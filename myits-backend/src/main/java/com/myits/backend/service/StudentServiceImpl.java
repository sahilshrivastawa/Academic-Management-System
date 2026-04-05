package com.myits.backend.service;

import com.myits.backend.dto.StudentRequestDto;
import com.myits.backend.dto.StudentResponseDto;
import com.myits.backend.dto.StudentSelfProfileRequestDto;
import com.myits.backend.entity.Student;
import com.myits.backend.entity.User;
import com.myits.backend.exception.ApiException;
import com.myits.backend.exception.ResourceNotFoundException;
import com.myits.backend.repository.StudentRepository;
import com.myits.backend.repository.UserRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public StudentServiceImpl(StudentRepository studentRepository, UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public StudentResponseDto addStudent(StudentRequestDto request) {
        validateUniqueForCreate(request);

        User user = getUserOrThrow(request.getUserId());

        Student student = Student.builder()
                .user(user)
                .enrollmentNo(request.getEnrollmentNo().trim())
                .branch(request.getBranch().trim())
                .academicYear(request.getAcademicYear())
            .course(request.getCourse().trim())
            .degree("")
            .program("")
            .mobileNo(request.getMobileNo().trim())
            .house(request.getHouse().trim())
                .build();

        Student savedStudent = studentRepository.save(student);
        return toDto(savedStudent);
    }

    @Override
    public StudentResponseDto updateStudent(Long studentId, StudentRequestDto request) {
        Student student = getStudentOrThrow(studentId);

        if (!student.getEnrollmentNo().equalsIgnoreCase(request.getEnrollmentNo().trim())
                && studentRepository.existsByEnrollmentNo(request.getEnrollmentNo().trim())) {
            throw new ApiException("Enrollment number already exists");
        }

        if (!student.getUser().getId().equals(request.getUserId())) {
            studentRepository.findByUser_Id(request.getUserId()).ifPresent(existing -> {
                if (!existing.getId().equals(studentId)) {
                    throw new ApiException("Student is already linked with this user");
                }
            });
            student.setUser(getUserOrThrow(request.getUserId()));
        }

        student.setEnrollmentNo(request.getEnrollmentNo().trim());
        student.setBranch(request.getBranch().trim());
        student.setAcademicYear(request.getAcademicYear());
        student.setCourse(request.getCourse().trim());
        student.setDegree("");
        student.setProgram("");
        student.setMobileNo(request.getMobileNo().trim());
        student.setHouse(request.getHouse().trim());

        Student updatedStudent = studentRepository.save(student);
        return toDto(updatedStudent);
    }

    @Override
    public void deleteStudent(Long studentId) {
        Student student = getStudentOrThrow(studentId);
        studentRepository.delete(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDto> getAllStudents() {
        return studentRepository.findAll(Sort.by(Sort.Order.asc("id"))).stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDto getStudentById(Long studentId) {
        Student student = getStudentOrThrow(studentId);
        return toDto(student);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDto getStudentByEmail(String email) {
        Student student = studentRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + email));
        return toDto(student);
    }

    @Override
    public StudentResponseDto upsertStudentProfileByEmail(String email, StudentSelfProfileRequestDto request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));

        String roleName = user.getRole().getRoleName() == null ? "" : user.getRole().getRoleName().toUpperCase(Locale.ROOT);
        if (!"STUDENT".equals(roleName)) {
            throw new ApiException("Only student accounts can update student profile");
        }

        String enrollmentNo = request.getEnrollmentNo().trim();
        studentRepository.findByEnrollmentNo(enrollmentNo).ifPresent(existing -> {
            if (!existing.getUser().getId().equals(user.getId())) {
                throw new ApiException("Enrollment number already exists");
            }
        });

        Student student = studentRepository.findByUser_Id(user.getId()).orElseGet(() -> Student.builder().user(user).build());

        student.setEnrollmentNo(enrollmentNo);
        student.setBranch(request.getBranch().trim());
        student.setAcademicYear(request.getAcademicYear());
        student.setCourse(request.getCourse().trim());
        student.setDegree("");
        student.setProgram("");
        student.setMobileNo(request.getMobileNo().trim());
        student.setHouse(request.getHouse().trim());

        Student savedStudent = studentRepository.save(student);
        return toDto(savedStudent);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentResponseDto> getAllStudentsPaginated(int page, int size) {
        int validSize = Math.min(size, 100);
        PageRequest pageRequest = PageRequest.of(page, validSize);
        Page<Student> studentPage = studentRepository.findAll(pageRequest);
        return studentPage.map(this::toDto);
    }

    private void validateUniqueForCreate(StudentRequestDto request) {
        if (studentRepository.existsByEnrollmentNo(request.getEnrollmentNo().trim())) {
            throw new ApiException("Enrollment number already exists");
        }

        studentRepository.findByUser_Id(request.getUserId()).ifPresent(existing -> {
            throw new ApiException("Student is already linked with this user");
        });
    }

    private Student getStudentOrThrow(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private StudentResponseDto toDto(Student student) {
        return StudentResponseDto.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .userName(student.getUser().getName())
                .userEmail(student.getUser().getEmail())
                .enrollmentNo(student.getEnrollmentNo())
                .branch(student.getBranch())
                .academicYear(student.getAcademicYear())
                .course(student.getCourse())
                .degree(student.getDegree())
                .program(student.getProgram())
                .mobileNo(student.getMobileNo())
                .house(student.getHouse())
                .build();
    }
}
