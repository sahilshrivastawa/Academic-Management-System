package com.myits.backend.service;

import com.myits.backend.dto.CourseRequestDto;
import com.myits.backend.dto.CourseResponseDto;

public interface CourseService {

    CourseResponseDto addCourse(CourseRequestDto request);

    CourseResponseDto updateCourse(Long courseId, CourseRequestDto request);

    CourseResponseDto assignInstructor(Long courseId, Long instructorUserId);
}
