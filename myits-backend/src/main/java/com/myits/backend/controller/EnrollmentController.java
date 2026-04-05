package com.myits.backend.controller;

import com.myits.backend.dto.ApiResponseDto;
import com.myits.backend.dto.CourseResponseDto;
import com.myits.backend.dto.EnrollmentRequestDto;
import com.myits.backend.dto.EnrollmentResponseDto;
import com.myits.backend.dto.StudentCourseViewDto;
import com.myits.backend.service.EnrollmentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponseDto<EnrollmentResponseDto>> enrollStudent(@Valid @RequestBody EnrollmentRequestDto request) {
        EnrollmentResponseDto enrollment = enrollmentService.enrollStudent(request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Student enrolled successfully", enrollment));
    }

    @GetMapping("/students/{studentId}/courses")
    public ResponseEntity<ApiResponseDto<List<CourseResponseDto>>> getCoursesByStudent(@PathVariable Long studentId) {
        List<CourseResponseDto> courses = enrollmentService.getCoursesByStudent(studentId);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Courses fetched successfully", courses));
    }

    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<ApiResponseDto<List<StudentCourseViewDto>>> getStudentsByCourse(@PathVariable Long courseId) {
        List<StudentCourseViewDto> students = enrollmentService.getStudentsByCourse(courseId);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Students fetched successfully", students));
    }
}
