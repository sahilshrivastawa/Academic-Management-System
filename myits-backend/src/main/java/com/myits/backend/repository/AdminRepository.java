package com.myits.backend.repository;

import com.myits.backend.entity.Admin;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByUser_Id(Long userId);

    List<Admin> findByDepartmentContainingIgnoreCase(String department);
}
