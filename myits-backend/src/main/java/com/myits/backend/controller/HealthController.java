package com.myits.backend.controller;

import com.myits.backend.dto.ApiResponseDto;
import com.myits.backend.service.HealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponseDto<Object>> health() {
        return ResponseEntity.ok(healthService.health());
    }

    @GetMapping("/")
    public ResponseEntity<ApiResponseDto<Object>> welcome() {
        return ResponseEntity.ok(healthService.welcome());
    }
}
