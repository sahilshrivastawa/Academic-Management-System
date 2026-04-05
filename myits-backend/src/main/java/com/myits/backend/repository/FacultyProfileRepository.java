package com.myits.backend.repository;

import com.myits.backend.entity.FacultyProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacultyProfileRepository extends JpaRepository<FacultyProfile, Long> {

    Optional<FacultyProfile> findByUser_Id(Long userId);
}
