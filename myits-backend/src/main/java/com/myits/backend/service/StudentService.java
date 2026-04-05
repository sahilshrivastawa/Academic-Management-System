package com.myits.backend.service;

import com.myits.backend.dto.StudentRequestDto;
import com.myits.backend.dto.StudentResponseDto;
import com.myits.backend.dto.StudentSelfProfileRequestDto;
import java.util.List;
import org.springframework.data.domain.Page;

public interface StudentService {

    StudentResponseDto addStudent(StudentRequestDto request);

    StudentResponseDto updateStudent(Long studentId, StudentRequestDto request);

    void deleteStudent(Long studentId);

    List<StudentResponseDto> getAllStudents();

    StudentResponseDto getStudentById(Long studentId);

    StudentResponseDto getStudentByEmail(String email);

    StudentResponseDto upsertStudentProfileByEmail(String email, StudentSelfProfileRequestDto request);

    Page<StudentResponseDto> getAllStudentsPaginated(int page, int size);
}
