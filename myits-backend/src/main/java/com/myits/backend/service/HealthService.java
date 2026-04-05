package com.myits.backend.service;

import com.myits.backend.dto.ApiResponseDto;

public interface HealthService {

    ApiResponseDto<Object> health();

    ApiResponseDto<Object> welcome();
}
