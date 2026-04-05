package com.myits.backend.controller;

import com.myits.backend.dto.ApiResponseDto;
import com.myits.backend.dto.CourseRequestDto;
import com.myits.backend.dto.CourseResponseDto;
import com.myits.backend.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponseDto<CourseResponseDto>> addCourse(@Valid @RequestBody CourseRequestDto request) {
        CourseResponseDto course = courseService.addCourse(request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Course added successfully", course));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDto<CourseResponseDto>> updateCourse(@PathVariable Long id,
                                                                           @Valid @RequestBody CourseRequestDto request) {
        CourseResponseDto course = courseService.updateCourse(id, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Course updated successfully", course));
    }

    @PutMapping("/{id}/assign/{instructorUserId}")
    public ResponseEntity<ApiResponseDto<CourseResponseDto>> assignInstructor(@PathVariable Long id,
                                                                               @PathVariable Long instructorUserId) {
        CourseResponseDto course = courseService.assignInstructor(id, instructorUserId);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Course instructor assigned successfully", course));
    }
}
