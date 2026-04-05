package com.myits.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class StudentMessageRequestDto {

    @NotNull
    private Long receiverStudentId;

    @NotBlank
    private String subject;

    @NotBlank
    private String message;
}
