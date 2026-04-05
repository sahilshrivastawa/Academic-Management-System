package com.myits.backend.repository;

import com.myits.backend.entity.Guest;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GuestRepository extends JpaRepository<Guest, Long> {

    @Query("SELECT g FROM Guest g WHERE g.visitDate = :visitDate ORDER BY g.id ASC")
    List<Guest> findByVisitDate(@Param("visitDate") LocalDate visitDate);

    List<Guest> findByOrganizationContainingIgnoreCase(String organization);
}
