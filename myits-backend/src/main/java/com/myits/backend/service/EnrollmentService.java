package com.myits.backend.service;

import com.myits.backend.dto.CourseResponseDto;
import com.myits.backend.dto.EnrollmentRequestDto;
import com.myits.backend.dto.EnrollmentResponseDto;
import com.myits.backend.dto.StudentCourseViewDto;
import java.util.List;

public interface EnrollmentService {

    EnrollmentResponseDto enrollStudent(EnrollmentRequestDto request);

    List<CourseResponseDto> getCoursesByStudent(Long studentId);

    List<StudentCourseViewDto> getStudentsByCourse(Long courseId);
}
