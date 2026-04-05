package com.myits.backend.service;

import com.myits.backend.dto.AuthResponse;
import com.myits.backend.dto.LoginRequest;
import com.myits.backend.dto.OtpSendRequest;
import com.myits.backend.dto.OtpSendResponse;
import com.myits.backend.dto.RegisterRequest;
import com.myits.backend.dto.ResetPasswordRequest;
import com.myits.backend.entity.FacultyProfile;
import com.myits.backend.entity.OtpCode;
import com.myits.backend.entity.Role;
import com.myits.backend.entity.Student;
import com.myits.backend.entity.User;
import com.myits.backend.exception.ApiException;
import com.myits.backend.repository.FacultyProfileRepository;
import com.myits.backend.repository.OtpCodeRepository;
import com.myits.backend.repository.RoleRepository;
import com.myits.backend.repository.StudentRepository;
import com.myits.backend.repository.UserRepository;
import com.myits.backend.security.JwtService;
import java.time.Instant;
import java.util.Objects;
import java.util.Set;
import java.security.SecureRandom;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

        private static final Set<String> ALLOWED_ROLES = Set.of("ADMIN", "STUDENT", "FACULTY", "GUEST");
        private static final Set<String> ALLOWED_OTP_PURPOSES = Set.of("LOGIN", "REGISTER", "RESET_PASSWORD");
        private static final SecureRandom OTP_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
        private final StudentRepository studentRepository;
        private final FacultyProfileRepository facultyProfileRepository;
    private final RoleRepository roleRepository;
                private final OtpCodeRepository otpCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
        private final SmsGatewayService smsGatewayService;

                @Value("${otp.validity-ms:300000}")
                private long otpValidityMs;

                @Value("${otp.max-attempts:5}")
                private int otpMaxAttempts;

                @Value("${otp.resend-cooldown-ms:30000}")
                private long otpResendCooldownMs;

        @Value("${otp.debug.return-otp-for-testing:false}")
        private boolean returnOtpForTesting;

    public AuthServiceImpl(UserRepository userRepository,
                                                   StudentRepository studentRepository,
                                                   FacultyProfileRepository facultyProfileRepository,
                           RoleRepository roleRepository,
                                                   OtpCodeRepository otpCodeRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           UserDetailsService userDetailsService,
                           JwtService jwtService,
                           SmsGatewayService smsGatewayService) {
        this.userRepository = userRepository;
                this.studentRepository = studentRepository;
                this.facultyProfileRepository = facultyProfileRepository;
        this.roleRepository = roleRepository;
                this.otpCodeRepository = otpCodeRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.smsGatewayService = smsGatewayService;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
                String normalizedEmail = normalizeEmail(request.getEmail());
                String normalizedMobileNo = normalizeMobileNo(request.getMobileNo());
                String normalizedRoleName = request.getRole().trim().toUpperCase();

                verifyOtpOrThrow(normalizedEmail, normalizedMobileNo, "REGISTER", request.getOtp());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ApiException("Email is already registered");
        }

        if (!ALLOWED_ROLES.contains(normalizedRoleName)) {
                        throw new ApiException("Invalid role. Allowed roles: ADMIN, STUDENT, FACULTY, GUEST");
        }

                validateEmailDomainForRole(normalizedEmail, normalizedRoleName);

        Role role = roleRepository.findByRoleName(normalizedRoleName)
                .orElseThrow(() -> new ApiException("Role not configured in system: " + normalizedRoleName));

        User user = User.builder()
                .name(request.getName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(Objects.requireNonNull(user));

        if ("STUDENT".equals(normalizedRoleName)) {
            validateStudentRegistrationFields(request);

            String normalizedRollNo = request.getRollNo().trim();
            if (studentRepository.existsByEnrollmentNo(normalizedRollNo)) {
                throw new ApiException("Roll number is already registered");
            }

            Student student = Student.builder()
                    .user(user)
                    .enrollmentNo(normalizedRollNo)
                    .branch(request.getBranch().trim())
                    .academicYear(request.getYear())
                    .course(request.getCourse().trim())
                    .degree("")
                    .program("")
                    .mobileNo(normalizedMobileNo)
                    .house(request.getHouse().trim())
                    .build();

            studentRepository.save(Objects.requireNonNull(student));
        }

                if ("FACULTY".equals(normalizedRoleName)) {
                        validateFacultyRegistrationFields(request);

                        FacultyProfile profile = FacultyProfile.builder()
                                        .user(user)
                                        .designation(request.getDesignation().trim())
                                        .department(request.getDepartment().trim())
                                        .mobileNo(normalizedMobileNo)
                                        .houseCoordinator(isBlank(request.getHouseCoordinator()) ? "" : request.getHouseCoordinator().trim())
                                        .course("")
                                        .house("")
                                        .build();

                        facultyProfileRepository.save(Objects.requireNonNull(profile));
                }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .email(user.getEmail())
                .role(role.getRoleName())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedRoleName = request.getRole().trim().toUpperCase();

        verifyOtpOrThrow(normalizedEmail, request.getMobileNo(), "LOGIN", request.getOtp());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ApiException("Invalid credentials"));

                if (!ALLOWED_ROLES.contains(normalizedRoleName)) {
                        throw new ApiException("Invalid role. Allowed roles: ADMIN, STUDENT, FACULTY, GUEST");
                }

                if (!user.getRole().getRoleName().equalsIgnoreCase(normalizedRoleName)) {
                        throw new ApiException("Invalid role for this account");
                }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .email(user.getEmail())
                .role(user.getRole().getRoleName())
                .build();
    }

        @Override
        @Transactional
        public void resetPassword(ResetPasswordRequest request) {
                        String normalizedEmail = normalizeEmail(request.getEmail());

                        verifyOtpOrThrow(normalizedEmail, request.getMobileNo(), "RESET_PASSWORD", request.getOtp());

                String normalizedRoleName = request.getRole().trim().toUpperCase();
                if (!ALLOWED_ROLES.contains(normalizedRoleName)) {
                        throw new ApiException("Invalid role. Allowed roles: ADMIN, STUDENT, FACULTY, GUEST");
                }

                        User user = userRepository.findByEmail(normalizedEmail)
                                .orElseThrow(() -> new ApiException("User not found for provided email"));

                if (!user.getRole().getRoleName().equalsIgnoreCase(normalizedRoleName)) {
                        throw new ApiException("Provided role does not match account role");
                }

                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);
        }

        @Override
        public OtpSendResponse sendOtp(OtpSendRequest request) {
                String purpose = normalizePurpose(request.getPurpose());
                String normalizedEmail = normalizeEmail(request.getEmail());
                String normalizedMobileNo = normalizeMobileNo(request.getMobileNo());
                if (normalizedEmail.isEmpty() || normalizedMobileNo.isEmpty()) {
                        throw new ApiException("Email and mobile number are required for OTP verification");
                }

                Instant now = Instant.now();
                OtpCode otpCode = otpCodeRepository
                                .findByEmailAndMobileNoAndPurpose(normalizedEmail, normalizedMobileNo, purpose)
                                .orElse(null);

                if (otpCode != null) {
                        Instant nextAllowedSend = otpCode.getSentAt().plusMillis(otpResendCooldownMs);
                        if (now.isBefore(nextAllowedSend)) {
                                long retryAfterSeconds = Math.max(1, (nextAllowedSend.toEpochMilli() - now.toEpochMilli() + 999) / 1000);
                                throw new ApiException("Please wait " + retryAfterSeconds + " seconds before requesting OTP again.");
                        }
                }

                String otp = String.format("%06d", OTP_RANDOM.nextInt(1_000_000));
                String otpHash = passwordEncoder.encode(otp);

                OtpCode updatedOtpCode = otpCode == null
                                ? OtpCode.builder()
                                                .email(normalizedEmail)
                                                .mobileNo(normalizedMobileNo)
                                                .purpose(purpose)
                                                .otpHash(otpHash)
                                                .expiresAt(now.plusMillis(otpValidityMs))
                                                .sentAt(now)
                                                .attemptCount(0)
                                                .build()
                                : otpCode;

                if (otpCode != null) {
                        updatedOtpCode.setOtpHash(otpHash);
                        updatedOtpCode.setExpiresAt(now.plusMillis(otpValidityMs));
                        updatedOtpCode.setSentAt(now);
                        updatedOtpCode.setAttemptCount(0);
                }

                otpCodeRepository.save(Objects.requireNonNull(updatedOtpCode));
                smsGatewayService.sendOtpSms(normalizedMobileNo, otp);

                return OtpSendResponse.builder()
                                .message("OTP generated and sent")
                                .expiresInSeconds((int) (otpValidityMs / 1000))
                        .otpForTesting(returnOtpForTesting ? otp : null)
                                .build();
        }

        private void verifyOtpOrThrow(String email, String mobileNo, String purpose, String otp) {
                String normalizedPurpose = normalizePurpose(purpose);
                String normalizedEmail = normalizeEmail(email);
                String normalizedMobile = normalizeMobileNo(mobileNo);

                if (normalizedEmail.isEmpty() || normalizedMobile.isEmpty()) {
                        throw new ApiException("Email and mobile number are required for OTP verification");
                }

                OtpCode otpCode = otpCodeRepository
                                .findByEmailAndMobileNoAndPurpose(normalizedEmail, normalizedMobile, normalizedPurpose)
                                .orElseThrow(() -> new ApiException("OTP not found. Please request OTP first."));

                Instant now = Instant.now();
                if (now.isAfter(otpCode.getExpiresAt())) {
                        otpCodeRepository.delete(otpCode);
                        throw new ApiException("OTP expired. Please request a new OTP.");
                }

                if (otpCode.getAttemptCount() >= otpMaxAttempts) {
                        otpCodeRepository.delete(otpCode);
                        throw new ApiException("Maximum OTP attempts exceeded. Please request a new OTP.");
                }

                if (isBlank(otp) || !passwordEncoder.matches(otp.trim(), otpCode.getOtpHash())) {
                        otpCode.setAttemptCount(otpCode.getAttemptCount() + 1);
                        otpCodeRepository.save(otpCode);
                        throw new ApiException("Invalid OTP");
                }

                otpCodeRepository.delete(otpCode);
        }

        private String normalizeEmail(String email) {
                return email == null ? "" : email.trim().toLowerCase();
        }

        private String normalizeMobileNo(String mobileNo) {
                if (mobileNo == null) {
                        return "";
                }
                return mobileNo.trim().replace(" ", "").replace("-", "");
        }

        private String normalizePurpose(String purpose) {
                String normalizedPurpose = purpose == null ? "" : purpose.trim().toUpperCase();
                if (!ALLOWED_OTP_PURPOSES.contains(normalizedPurpose)) {
                        throw new ApiException("Invalid OTP purpose. Allowed purposes: LOGIN, REGISTER, RESET_PASSWORD");
                }
                return normalizedPurpose;
        }

        private void validateStudentRegistrationFields(RegisterRequest request) {
                if (isBlank(request.getRollNo())) {
                        throw new ApiException("Roll number is required for student registration");
                }
                if (isBlank(request.getBranch())) {
                        throw new ApiException("Branch is required for student registration");
                }
                if (isBlank(request.getCourse())) {
                        throw new ApiException("Course is required for student registration");
                }
                if (isBlank(request.getMobileNo())) {
                        throw new ApiException("Mobile number is required for student registration");
                }
                if (request.getYear() == null || request.getYear() < 1 || request.getYear() > 4) {
                        throw new ApiException("Year must be between 1 and 4 for student registration");
                }
                if (isBlank(request.getHouse())) {
                        throw new ApiException("House is required for student registration");
                }
        }

        private boolean isBlank(String value) {
                return value == null || value.trim().isEmpty();
        }

        private void validateFacultyRegistrationFields(RegisterRequest request) {
                if (isBlank(request.getDepartment())) {
                        throw new ApiException("Department is required for faculty registration");
                }
                if (isBlank(request.getDesignation())) {
                        throw new ApiException("Designation is required for faculty registration");
                }
                if (isBlank(request.getMobileNo())) {
                        throw new ApiException("Mobile number is required for faculty registration");
                }
        }

                private void validateEmailDomainForRole(String email, String roleName) {
                        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();

                        if ("GUEST".equals(roleName)) {
                                if (!normalizedEmail.endsWith("@gmail.com")) {
                                        throw new ApiException("Guest registration requires a @gmail.com email address");
                                }
                                return;
                        }

                        if (!normalizedEmail.endsWith("@its.edu.in")) {
                                throw new ApiException("Student, Faculty, and Admin registration require an @its.edu.in email address");
                        }
                }
}
