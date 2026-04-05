package com.myits.backend.service;

import com.myits.backend.dto.ApiResponseDto;
import java.time.Instant;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class HealthServiceImpl implements HealthService {

    @Override
    public ApiResponseDto<Object> health() {
        return new ApiResponseDto<>(
                true,
                "MyITS backend is running",
                Map.of("timestamp", Instant.now().toString())
        );
    }

    @Override
    public ApiResponseDto<Object> welcome() {
        return new ApiResponseDto<>(
                true,
                "Welcome to MyITS API",
                null
        );
    }
}
