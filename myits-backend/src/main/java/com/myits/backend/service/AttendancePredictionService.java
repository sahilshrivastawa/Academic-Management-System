package com.myits.backend.service;

import com.myits.backend.dto.AttendancePredictionRequestDto;
import com.myits.backend.dto.AttendancePredictionResponseDto;

public interface AttendancePredictionService {

    AttendancePredictionResponseDto predictAttendance(AttendancePredictionRequestDto request);
}
