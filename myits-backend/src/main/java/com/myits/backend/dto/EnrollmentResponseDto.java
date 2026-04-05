package com.myits.backend.dto;

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
public class EnrollmentResponseDto {

    private Long id;
    private Long studentId;
    private String studentName;
    private String enrollmentNo;
    private Long courseId;
    private String courseName;
    private String courseCode;
}
