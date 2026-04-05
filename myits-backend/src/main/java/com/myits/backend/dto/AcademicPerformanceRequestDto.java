package com.myits.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
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
public class AcademicPerformanceRequestDto {

    @Min(value = 0, message = "attendance must be between 0 and 100")
    @Max(value = 100, message = "attendance must be between 0 and 100")
    private Double attendance;

    @Min(value = 0, message = "activity must be between 0 and 100")
    @Max(value = 100, message = "activity must be between 0 and 100")
    private Double activity;

    @Valid
    @NotEmpty(message = "courses are required")
    private List<AcademicPerformanceCourseDto> courses;
}
