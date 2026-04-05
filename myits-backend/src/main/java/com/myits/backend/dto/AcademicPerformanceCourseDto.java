package com.myits.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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
public class AcademicPerformanceCourseDto {

    @NotBlank(message = "courseName is required")
    private String courseName;

    @Min(value = 0, message = "score must be between 0 and 100")
    @Max(value = 100, message = "score must be between 0 and 100")
    private Double score;
}
