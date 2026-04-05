package com.myits.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
public class StudentRequestDto {

    @NotNull
    private Long userId;

    @NotBlank
    private String enrollmentNo;

    @NotBlank
    private String branch;

    @NotNull
    @Min(1)
    @Max(4)
    private Integer academicYear;

    @NotBlank
    private String course;

    @NotBlank
    @Pattern(regexp = "^[0-9+\\- ]{8,20}$", message = "Mobile number must be 8-20 characters and contain only digits, +, -, or spaces")
    private String mobileNo;

    @NotBlank
    private String house;
}
