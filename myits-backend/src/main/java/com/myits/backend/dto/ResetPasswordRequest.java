package com.myits.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
public class ResetPasswordRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String role;

        @NotBlank
        @Pattern(regexp = "^[0-9+\\- ]{8,20}$", message = "Mobile number must be 8-20 characters and contain only digits, +, -, or spaces")
        private String mobileNo;

        @NotBlank
        private String otp;

    @NotBlank
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{6,}$",
            message = "Password must be at least 6 characters and include letters, numbers, and special characters"
    )
    private String newPassword;
}