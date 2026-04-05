package com.myits.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class RegisterRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
        @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{6,}$",
            message = "Password must be at least 6 characters and include letters, numbers, and special characters"
        )
    private String password;

    @NotBlank
    private String role;

    private String rollNo;

    private String branch;

    private String course;

    private String designation;

    private String houseCoordinator;

    private String degree;

    private String program;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^$|^[0-9+\\- ]{8,20}$", message = "Mobile number must be 8-20 characters and contain only digits, +, -, or spaces")
    private String mobileNo;

    @Min(value = 1, message = "Year must be between 1 and 4")
    @Max(value = 4, message = "Year must be between 1 and 4")
    private Integer year;

    private String house;

    private String department;

    @NotBlank
    private String otp;
}
