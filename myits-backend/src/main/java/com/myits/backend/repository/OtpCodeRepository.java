package com.myits.backend.repository;

import com.myits.backend.entity.OtpCode;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    Optional<OtpCode> findByEmailAndMobileNoAndPurpose(String email, String mobileNo, String purpose);

    void deleteByEmailAndMobileNoAndPurpose(String email, String mobileNo, String purpose);
}
