package com.myits.backend.repository;

import com.myits.backend.entity.Enrollment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByStudent_Id(Long studentId);

    List<Enrollment> findByCourse_Id(Long courseId);

    Optional<Enrollment> findByStudent_IdAndCourse_Id(Long studentId, Long courseId);

    boolean existsByStudent_IdAndCourse_Id(Long studentId, Long courseId);
}
