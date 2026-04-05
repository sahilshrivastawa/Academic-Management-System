package com.myits.backend.service;

public interface SmsGatewayService {

    void sendOtpSms(String mobileNo, String otp);
}
