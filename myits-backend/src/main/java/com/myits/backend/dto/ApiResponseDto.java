package com.myits.backend.dto;

public record ApiResponseDto<T>(boolean success, String message, T data) {
}
