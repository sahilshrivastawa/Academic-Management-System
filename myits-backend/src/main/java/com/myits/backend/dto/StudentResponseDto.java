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
public class StudentResponseDto {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String enrollmentNo;
    private String branch;
    private Integer academicYear;
    private String course;
    private String degree;
    private String program;
    private String mobileNo;
    private String house;
}
