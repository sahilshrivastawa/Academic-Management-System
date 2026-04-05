package com.myits.backend.service;

import com.myits.backend.dto.AuthResponse;
import com.myits.backend.dto.LoginRequest;
import com.myits.backend.dto.OtpSendRequest;
import com.myits.backend.dto.OtpSendResponse;
import com.myits.backend.dto.RegisterRequest;
import com.myits.backend.dto.ResetPasswordRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void resetPassword(ResetPasswordRequest request);

    OtpSendResponse sendOtp(OtpSendRequest request);
}
