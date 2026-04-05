package com.myits.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "enrollment_no", nullable = false, unique = true, length = 50)
    private String enrollmentNo;

    @Column(name = "branch", nullable = false, length = 100)
    private String branch;

    @Column(name = "academic_year", nullable = false)
    private Integer academicYear;

    @Column(name = "course", length = 150)
    private String course;

    @Column(name = "degree", length = 100)
    private String degree;

    @Column(name = "program", length = 100)
    private String program;

    @Column(name = "mobile_no", length = 20)
    private String mobileNo;

    @Column(name = "house", length = 100)
    private String house;

    @OneToMany(mappedBy = "student")
    @Builder.Default
    private List<Enrollment> enrollments = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "enrollments",
            joinColumns = @JoinColumn(name = "student_id", insertable = false, updatable = false),
            inverseJoinColumns = @JoinColumn(name = "course_id", insertable = false, updatable = false)
    )
    @Builder.Default
    private List<Course> courses = new ArrayList<>();
}
