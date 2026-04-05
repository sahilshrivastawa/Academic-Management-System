package com.myits.backend.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAiDashboardResponseDto {

    private String summary;
    private int enrolledCourses;
    private double attendancePercentage;
    private int pendingAssignments;
    private int messages;
    private double attendancePrediction;
    private String academicProgressAnalysis;
    private List<String> recommendations;
    private String chatbotPrompt;
}
