import os
from typing import Any, Dict, List

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from openai import OpenAI

app = FastAPI(title="Attendance AI Service", version="1.0.0")


class AttendancePredictionRequest(BaseModel):
    past_attendance_list: List[float] = Field(min_length=3, max_length=200)


class AttendancePredictionResponse(BaseModel):
    predicted_attendance: float
    risk_level: str
    ai_warning: str


class ChatbotRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1000)
    context: Dict[str, Any]


class ChatbotResponse(BaseModel):
    answer: str


class PerformanceCourse(BaseModel):
    course_name: str = Field(min_length=1, max_length=120)
    score: float = Field(ge=0, le=100)


class AcademicPerformanceRequest(BaseModel):
    attendance: float = Field(ge=0, le=100)
    activity: float = Field(ge=0, le=100)
    courses: List[PerformanceCourse] = Field(min_length=1, max_length=30)


class AcademicPerformanceResponse(BaseModel):
    performance_level: str
    weak_subject: str
    recommendation: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/predict-attendance", response_model=AttendancePredictionResponse)
def predict_attendance(payload: AttendancePredictionRequest) -> AttendancePredictionResponse:
    history = payload.past_attendance_list

    if any(value < 0 or value > 100 for value in history):
        raise HTTPException(status_code=400, detail="Attendance values must be between 0 and 100")

    x = np.arange(len(history), dtype=float)
    y = np.array(history, dtype=float)

    slope, intercept = np.polyfit(x, y, 1)
    next_index = float(len(history))
    predicted = float(intercept + (slope * next_index))
    predicted = max(0.0, min(100.0, predicted))

    recent_average = float(np.mean(y[-5:]))

    if predicted < 60 or recent_average < 60:
        risk_level = "HIGH"
        ai_warning = "High risk: attendance trend is low. Attend all upcoming classes and contact your mentor today."
    elif predicted < 75 or recent_average < 75:
        risk_level = "MEDIUM"
        ai_warning = "Medium risk: attendance needs improvement. Follow a weekly attendance plan to avoid shortage."
    else:
        risk_level = "LOW"
        ai_warning = "Low risk: attendance is stable. Keep your current consistency."

    return AttendancePredictionResponse(
        predicted_attendance=round(predicted, 2),
        risk_level=risk_level,
        ai_warning=ai_warning,
    )


@app.post("/chatbot/ask", response_model=ChatbotResponse)
def chatbot_ask(payload: ChatbotRequest) -> ChatbotResponse:
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    openai_api_key = os.getenv("OPENAI_API_KEY")
    model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if openai_api_key:
        try:
            client = OpenAI(api_key=openai_api_key)
            system_prompt = (
                "You are an academic assistant chatbot for students. "
                "Answer using only the provided student context. "
                "Focus on attendance, courses, performance, and practical suggestions. "
                "Keep answers concise and actionable."
            )
            user_prompt = (
                f"Student context:\n{payload.context}\n\n"
                f"Student question: {question}\n\n"
                "Return a short helpful answer in plain text."
            )

            completion = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                max_tokens=350,
            )

            answer = completion.choices[0].message.content or "I could not generate a response right now."
            return ChatbotResponse(answer=answer.strip())
        except Exception as ex:
            return ChatbotResponse(answer=_fallback_answer(question, payload.context, str(ex)))

    return ChatbotResponse(answer=_fallback_answer(question, payload.context, "OPENAI_API_KEY not set"))


def _fallback_answer(question: str, context: Dict[str, Any], reason: str) -> str:
    courses = context.get("courses") or []
    attendance = context.get("attendancePercentage", "N/A")
    prediction = context.get("attendancePrediction", "N/A")
    performance = context.get("academicProgressAnalysis", "No performance summary available.")
    recommendations = context.get("recommendations") or []

    question_lc = question.lower()

    if "attendance" in question_lc:
        return (
            f"Your current attendance is around {attendance}% and the predicted trend is {prediction}%. "
            f"AI note: keep attending consistently to improve this trend."
        )
    if "course" in question_lc or "subject" in question_lc:
        course_text = ", ".join(courses) if courses else "No enrolled courses found"
        return f"Your enrolled courses are: {course_text}."
    if "performance" in question_lc or "progress" in question_lc:
        return str(performance)
    if "suggest" in question_lc or "recommend" in question_lc:
        if recommendations:
            return "Suggestions: " + " ".join(f"{idx + 1}. {item}" for idx, item in enumerate(recommendations[:3]))
        return "Suggestion: follow a weekly study schedule and attend all upcoming classes."

    return (
        "Based on your dashboard, focus on attendance consistency, complete pending tasks early, "
        "and review your enrolled courses daily. "
        f"(Fallback mode reason: {reason})"
    )


@app.post("/analyze-performance", response_model=AcademicPerformanceResponse)
def analyze_performance(payload: AcademicPerformanceRequest) -> AcademicPerformanceResponse:
    course_scores = np.array([course.score for course in payload.courses], dtype=float)
    avg_course_score = float(np.mean(course_scores))

    weighted_score = (
        0.45 * payload.attendance
        + 0.40 * avg_course_score
        + 0.15 * payload.activity
    )

    if weighted_score >= 85:
        performance_level = "EXCELLENT"
    elif weighted_score >= 70:
        performance_level = "GOOD"
    elif weighted_score >= 55:
        performance_level = "AVERAGE"
    else:
        performance_level = "AT_RISK"

    weak_course = min(payload.courses, key=lambda course: course.score)
    weak_subject = weak_course.course_name if weak_course.score < 70 else "No major weak subject"

    if performance_level == "EXCELLENT":
        recommendation = (
            "Maintain current consistency. Focus on advanced practice in stronger subjects and peer mentoring."
        )
    elif performance_level == "GOOD":
        recommendation = (
            "Increase focus on your weaker subject and improve weekly activity participation to reach excellent level."
        )
    elif performance_level == "AVERAGE":
        recommendation = (
            "Create a structured weekly plan: improve attendance, revise fundamentals, and complete one extra practice set daily."
        )
    else:
        recommendation = (
            "Immediate action needed: attend all classes, seek faculty support in weak subject, and follow a strict recovery timetable."
        )

    return AcademicPerformanceResponse(
        performance_level=performance_level,
        weak_subject=weak_subject,
        recommendation=recommendation,
    )
