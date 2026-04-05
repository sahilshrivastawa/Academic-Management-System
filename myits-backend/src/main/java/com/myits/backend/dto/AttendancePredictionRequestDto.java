package com.myits.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
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
public class AttendancePredictionRequestDto {

    @NotEmpty(message = "pastAttendanceList is required")
    @Size(min = 3, message = "At least 3 attendance values are required")
    private List<Double> pastAttendanceList;
}
