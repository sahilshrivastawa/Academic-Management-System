package com.myits.backend.service;

import com.myits.backend.dto.CourseResponseDto;
import com.myits.backend.dto.EnrollmentRequestDto;
import com.myits.backend.dto.EnrollmentResponseDto;
import com.myits.backend.dto.StudentCourseViewDto;
import com.myits.backend.entity.Course;
import com.myits.backend.entity.Enrollment;
import com.myits.backend.entity.Student;
import com.myits.backend.exception.ApiException;
import com.myits.backend.exception.ResourceNotFoundException;
import com.myits.backend.repository.CourseRepository;
import com.myits.backend.repository.EnrollmentRepository;
import com.myits.backend.repository.StudentRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public EnrollmentServiceImpl(EnrollmentRepository enrollmentRepository,
                                 StudentRepository studentRepository,
                                 CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public EnrollmentResponseDto enrollStudent(EnrollmentRequestDto request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId()));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        if (enrollmentRepository.existsByStudent_IdAndCourse_Id(student.getId(), course.getId())) {
            throw new ApiException("Student is already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return toEnrollmentDto(savedEnrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDto> getCoursesByStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }

        return enrollmentRepository.findByStudent_Id(studentId)
                .stream()
                .map(Enrollment::getCourse)
                .map(this::toCourseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentCourseViewDto> getStudentsByCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found with id: " + courseId);
        }

        return enrollmentRepository.findByCourse_Id(courseId)
                .stream()
                .map(Enrollment::getStudent)
                .map(this::toStudentDto)
                .toList();
    }

    private EnrollmentResponseDto toEnrollmentDto(Enrollment enrollment) {
        return EnrollmentResponseDto.builder()
                .id(enrollment.getId())
                .studentId(enrollment.getStudent().getId())
                .studentName(enrollment.getStudent().getUser().getName())
                .enrollmentNo(enrollment.getStudent().getEnrollmentNo())
                .courseId(enrollment.getCourse().getId())
                .courseName(enrollment.getCourse().getCourseName())
                .courseCode(enrollment.getCourse().getCourseCode())
                .build();
    }

    private CourseResponseDto toCourseDto(Course course) {
        return CourseResponseDto.builder()
                .id(course.getId())
                .courseName(course.getCourseName())
                .courseCode(course.getCourseCode())
                .instructorUserId(course.getFaculty().getId())
                .instructorName(course.getFaculty().getName())
                .instructorRole(course.getFaculty().getRole().getRoleName())
                .build();
    }

    private StudentCourseViewDto toStudentDto(Student student) {
        return StudentCourseViewDto.builder()
                .studentId(student.getId())
                .studentName(student.getUser().getName())
                .studentEmail(student.getUser().getEmail())
                .enrollmentNo(student.getEnrollmentNo())
                .branch(student.getBranch())
                .academicYear(student.getAcademicYear())
                .build();
    }
}
