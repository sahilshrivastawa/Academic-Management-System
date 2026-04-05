package com.myits.backend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentMessageResponseDto {

    private Long id;
    private Long senderStudentId;
    private String senderName;
    private String senderEmail;
    private Long receiverStudentId;
    private String receiverName;
    private String receiverEmail;
    private String subject;
    private String message;
    private LocalDateTime createdAt;
}
