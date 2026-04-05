package com.myits.backend.service;

import com.myits.backend.dto.CourseRequestDto;
import com.myits.backend.dto.CourseResponseDto;
import com.myits.backend.entity.Course;
import com.myits.backend.entity.User;
import com.myits.backend.exception.ApiException;
import com.myits.backend.exception.ResourceNotFoundException;
import com.myits.backend.repository.CourseRepository;
import com.myits.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseServiceImpl(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CourseResponseDto addCourse(CourseRequestDto request) {
        if (courseRepository.existsByCourseCode(request.getCourseCode().trim())) {
            throw new ApiException("Course code already exists");
        }

        User instructor = getAssignableInstructor(request.getInstructorUserId());

        Course course = Course.builder()
                .courseName(request.getCourseName().trim())
                .courseCode(request.getCourseCode().trim())
                .faculty(instructor)
                .build();

        Course savedCourse = courseRepository.save(course);
        return toDto(savedCourse);
    }

    @Override
    public CourseResponseDto updateCourse(Long courseId, CourseRequestDto request) {
        Course course = getCourseOrThrow(courseId);

        if (!course.getCourseCode().equalsIgnoreCase(request.getCourseCode().trim())
                && courseRepository.existsByCourseCode(request.getCourseCode().trim())) {
            throw new ApiException("Course code already exists");
        }

        User instructor = getAssignableInstructor(request.getInstructorUserId());

        course.setCourseName(request.getCourseName().trim());
        course.setCourseCode(request.getCourseCode().trim());
        course.setFaculty(instructor);

        Course updatedCourse = courseRepository.save(course);
        return toDto(updatedCourse);
    }

    @Override
    public CourseResponseDto assignInstructor(Long courseId, Long instructorUserId) {
        Course course = getCourseOrThrow(courseId);
        User instructor = getAssignableInstructor(instructorUserId);
        course.setFaculty(instructor);
        Course updatedCourse = courseRepository.save(course);
        return toDto(updatedCourse);
    }

    private Course getCourseOrThrow(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
    }

    private User getAssignableInstructor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String roleName = user.getRole().getRoleName().toUpperCase();
        if (!"FACULTY".equals(roleName) && !"ADMIN".equals(roleName)) {
            throw new ApiException("Only FACULTY or ADMIN users can be assigned to a course");
        }

        return user;
    }

    private CourseResponseDto toDto(Course course) {
        return CourseResponseDto.builder()
                .id(course.getId())
                .courseName(course.getCourseName())
                .courseCode(course.getCourseCode())
                .instructorUserId(course.getFaculty().getId())
                .instructorName(course.getFaculty().getName())
                .instructorRole(course.getFaculty().getRole().getRoleName())
                .build();
    }
}
