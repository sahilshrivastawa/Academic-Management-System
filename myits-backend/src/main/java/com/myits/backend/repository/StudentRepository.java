package com.myits.backend.repository;

import com.myits.backend.entity.Student;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUser_Id(Long userId);

    Optional<Student> findByEnrollmentNo(String enrollmentNo);

    Optional<Student> findByUser_Email(String email);

    boolean existsByEnrollmentNo(String enrollmentNo);
}
