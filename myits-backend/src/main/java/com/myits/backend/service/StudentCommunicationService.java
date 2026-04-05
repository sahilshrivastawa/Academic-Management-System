package com.myits.backend.service;

import com.myits.backend.dto.StudentMessageRequestDto;
import com.myits.backend.dto.StudentMessageResponseDto;
import java.util.List;

public interface StudentCommunicationService {

    StudentMessageResponseDto sendMessage(String senderEmail, StudentMessageRequestDto request);

    List<StudentMessageResponseDto> getInbox(String currentUserEmail);
}
