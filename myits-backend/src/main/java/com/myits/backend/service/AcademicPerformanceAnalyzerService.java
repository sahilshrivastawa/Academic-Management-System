package com.myits.backend.service;

import com.myits.backend.dto.AcademicPerformanceRequestDto;
import com.myits.backend.dto.AcademicPerformanceResponseDto;

public interface AcademicPerformanceAnalyzerService {

    AcademicPerformanceResponseDto analyze(AcademicPerformanceRequestDto request);
}
