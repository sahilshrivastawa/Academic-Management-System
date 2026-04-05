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
public class CourseResponseDto {

    private Long id;
    private String courseName;
    private String courseCode;
    private Long instructorUserId;
    private String instructorName;
    private String instructorRole;
}
