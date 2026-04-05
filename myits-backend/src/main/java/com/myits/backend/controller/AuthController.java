package com.myits.backend.controller;

import com.myits.backend.dto.AuthResponse;
import com.myits.backend.dto.LoginRequest;
import com.myits.backend.dto.ApiResponseDto;
import com.myits.backend.dto.OtpSendRequest;
import com.myits.backend.dto.OtpSendResponse;
import com.myits.backend.dto.RegisterRequest;
import com.myits.backend.dto.ResetPasswordRequest;
import com.myits.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/auth", "/api/v1/auth"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponseDto<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Password reset successful", "OK"));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponseDto<OtpSendResponse>> sendOtp(@Valid @RequestBody OtpSendRequest request) {
        OtpSendResponse response = authService.sendOtp(request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OTP sent successfully", response));
    }
}
