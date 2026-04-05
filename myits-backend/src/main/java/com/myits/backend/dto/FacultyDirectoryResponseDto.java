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
public class FacultyDirectoryResponseDto {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String designation;
    private String department;
    private String houseCoordinator;
    private String mobileNo;
}
