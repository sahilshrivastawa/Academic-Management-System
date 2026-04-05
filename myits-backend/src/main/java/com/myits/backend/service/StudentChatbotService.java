package com.myits.backend.service;

import com.myits.backend.dto.StudentChatbotResponseDto;

public interface StudentChatbotService {

    StudentChatbotResponseDto ask(String studentEmail, String message);
}
