package com.myits.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myits.backend.dto.StudentAiDashboardResponseDto;
import com.myits.backend.dto.StudentChatbotResponseDto;
import com.myits.backend.entity.Enrollment;
import com.myits.backend.entity.Student;
import com.myits.backend.exception.ApiException;
import com.myits.backend.exception.ResourceNotFoundException;
import com.myits.backend.repository.EnrollmentRepository;
import com.myits.backend.repository.StudentRepository;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StudentChatbotServiceImpl implements StudentChatbotService {

    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentAiDashboardService studentAiDashboardService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${ai.chatbot.service.url:http://localhost:8001/chatbot/ask}")
    private String aiChatbotServiceUrl;

    public StudentChatbotServiceImpl(StudentRepository studentRepository,
                                     EnrollmentRepository enrollmentRepository,
                                     StudentAiDashboardService studentAiDashboardService,
                                     ObjectMapper objectMapper) {
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.studentAiDashboardService = studentAiDashboardService;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Override
    public StudentChatbotResponseDto ask(String studentEmail, String message) {
        Student student = studentRepository.findByUser_Email(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + studentEmail));

        List<Enrollment> enrollments = enrollmentRepository.findByStudent_Id(student.getId());
        List<String> courses = enrollments.stream()
                .map(enrollment -> enrollment.getCourse().getCourseName() + " (" + enrollment.getCourse().getCourseCode() + ")")
                .toList();

        StudentAiDashboardResponseDto dashboard = studentAiDashboardService.getDashboardInsights(studentEmail);

        Map<String, Object> context = new HashMap<>();
        context.put("studentName", student.getUser().getName());
        context.put("attendancePercentage", dashboard.getAttendancePercentage());
        context.put("attendancePrediction", dashboard.getAttendancePrediction());
        context.put("courses", courses);
        context.put("enrolledCourses", dashboard.getEnrolledCourses());
        context.put("performanceSummary", dashboard.getSummary());
        context.put("academicProgressAnalysis", dashboard.getAcademicProgressAnalysis());
        context.put("recommendations", dashboard.getRecommendations());

        Map<String, Object> payload = new HashMap<>();
        payload.put("question", message);
        payload.put("context", context);

        try {
            String requestBody = objectMapper.writeValueAsString(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(aiChatbotServiceUrl))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new ApiException("AI chatbot service returned error: " + response.statusCode());
            }

            JsonNode jsonNode = objectMapper.readTree(response.body());
            String answer = jsonNode.path("answer").asText("I could not generate a response.");
            return StudentChatbotResponseDto.builder().answer(answer).build();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ApiException("Failed to call AI chatbot service: " + ex.getMessage());
        } catch (IOException ex) {
            throw new ApiException("Failed to call AI chatbot service: " + ex.getMessage());
        }
    }
}
