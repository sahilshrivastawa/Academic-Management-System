package com.myits.backend.service;

import com.myits.backend.dto.StudentAiDashboardResponseDto;
import com.myits.backend.entity.Enrollment;
import com.myits.backend.entity.Student;
import com.myits.backend.exception.ResourceNotFoundException;
import com.myits.backend.repository.EnrollmentRepository;
import com.myits.backend.repository.StudentMessageRepository;
import com.myits.backend.repository.StudentRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StudentAiDashboardServiceImpl implements StudentAiDashboardService {

    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentMessageRepository studentMessageRepository;

    public StudentAiDashboardServiceImpl(StudentRepository studentRepository,
                                         EnrollmentRepository enrollmentRepository,
                                         StudentMessageRepository studentMessageRepository) {
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.studentMessageRepository = studentMessageRepository;
    }

    @Override
    public StudentAiDashboardResponseDto getDashboardInsights(String studentEmail) {
        Student student = studentRepository.findByUser_Email(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + studentEmail));

        List<Enrollment> enrollments = enrollmentRepository.findByStudent_Id(student.getId());
        int enrolledCourses = enrollments.size();
        int inboxMessages = studentMessageRepository.findByReceiverStudent_IdOrderByCreatedAtDesc(student.getId()).size();
        int sentMessages = studentMessageRepository.findBySenderStudent_IdOrderByCreatedAtDesc(student.getId()).size();

        int pendingAssignments = Math.max(0, (enrolledCourses * 2) - student.getAcademicYear() - (inboxMessages / 3));

        double attendancePercentage = clamp(
                58 + (enrolledCourses * 4.5) + (student.getAcademicYear() * 2.5) + (sentMessages * 0.7) - (pendingAssignments * 2.2),
                45,
                98
        );

        double attendancePrediction = clamp(
                attendancePercentage + (sentMessages * 0.6) - (pendingAssignments * 0.8),
                40,
                99
        );

        String academicProgressAnalysis = buildProgressAnalysis(
                student.getAcademicYear(),
                enrolledCourses,
                attendancePercentage,
                pendingAssignments,
                inboxMessages
        );

        String summary = String.format(
                "You are enrolled in %d course(s) with an estimated attendance of %.1f%%, %d pending assignment(s), and %d incoming message(s).",
                enrolledCourses,
                attendancePercentage,
                pendingAssignments,
                inboxMessages
        );

        List<String> recommendations = buildRecommendations(
                attendancePrediction,
                pendingAssignments,
                inboxMessages,
                enrolledCourses
        );

        return StudentAiDashboardResponseDto.builder()
                .summary(summary)
                .enrolledCourses(enrolledCourses)
                .attendancePercentage(round1(attendancePercentage))
                .pendingAssignments(pendingAssignments)
                .messages(inboxMessages)
                .attendancePrediction(round1(attendancePrediction))
                .academicProgressAnalysis(academicProgressAnalysis)
                .recommendations(recommendations)
                .chatbotPrompt("Hi AI Tutor, help me plan this week's study schedule based on my dashboard.")
                .build();
    }

    private String buildProgressAnalysis(int academicYear,
                                         int enrolledCourses,
                                         double attendancePercentage,
                                         int pendingAssignments,
                                         int inboxMessages) {
        String status;
        if (attendancePercentage >= 85 && pendingAssignments <= 2) {
            status = "Excellent";
        } else if (attendancePercentage >= 75 && pendingAssignments <= 4) {
            status = "On Track";
        } else {
            status = "Needs Attention";
        }

        return String.format(
                "%s progress: Year %d student with %d enrolled course(s). Attendance trend is %.1f%% with %d pending assignment(s) and %d active peer message(s).",
                status,
                academicYear,
                enrolledCourses,
                attendancePercentage,
                pendingAssignments,
                inboxMessages
        );
    }

    private List<String> buildRecommendations(double attendancePrediction,
                                              int pendingAssignments,
                                              int inboxMessages,
                                              int enrolledCourses) {
        List<String> recommendations = new ArrayList<>();

        if (attendancePrediction < 75) {
            recommendations.add("Prioritize high-credit classes this week to improve attendance consistency.");
        } else {
            recommendations.add("Maintain your attendance momentum by following the current class routine.");
        }

        if (pendingAssignments > 3) {
            recommendations.add("Break pending assignments into daily tasks and finish at least one per day.");
        } else {
            recommendations.add("Keep assignment backlog low by submitting tasks within 24 hours of completion.");
        }

        if (inboxMessages > 5) {
            recommendations.add("Respond to important student messages to keep collaboration channels clear.");
        } else {
            recommendations.add("Join one peer discussion this week to strengthen concept clarity.");
        }

        if (enrolledCourses >= 6) {
            recommendations.add("Use a fixed weekly timetable to balance workload across all enrolled courses.");
        }

        return recommendations;
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
