package com.myits.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "faculty_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "department", nullable = false, length = 120)
    private String department;

    @Column(name = "designation", length = 120)
    private String designation;

    @Column(name = "house_coordinator", length = 120)
    private String houseCoordinator;

    @Column(name = "course", length = 150)
    private String course;

    @Column(name = "mobile_no", nullable = false, length = 20)
    private String mobileNo;

    @Column(name = "house", nullable = false, length = 100)
    private String house;
}
