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
public class StudentCourseViewDto {

    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String enrollmentNo;
    private String branch;
    private Integer academicYear;
}
