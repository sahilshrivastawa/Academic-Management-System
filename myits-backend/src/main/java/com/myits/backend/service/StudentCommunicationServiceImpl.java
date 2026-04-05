package com.myits.backend.service;

import com.myits.backend.dto.StudentMessageRequestDto;
import com.myits.backend.dto.StudentMessageResponseDto;
import com.myits.backend.entity.Student;
import com.myits.backend.entity.StudentMessage;
import com.myits.backend.entity.User;
import com.myits.backend.exception.ApiException;
import com.myits.backend.exception.ResourceNotFoundException;
import com.myits.backend.repository.StudentMessageRepository;
import com.myits.backend.repository.StudentRepository;
import com.myits.backend.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudentCommunicationServiceImpl implements StudentCommunicationService {

    private final StudentMessageRepository studentMessageRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public StudentCommunicationServiceImpl(StudentMessageRepository studentMessageRepository,
                                           StudentRepository studentRepository,
                                           UserRepository userRepository) {
        this.studentMessageRepository = studentMessageRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public StudentMessageResponseDto sendMessage(String senderEmail, StudentMessageRequestDto request) {
        User senderUser = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + senderEmail));

        Student senderStudent = studentRepository.findByUser_Id(senderUser.getId())
                .orElseThrow(() -> new ApiException("Only student accounts can send messages in Student Communication"));

        Student receiverStudent = studentRepository.findById(request.getReceiverStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getReceiverStudentId()));

        if (senderStudent.getId().equals(receiverStudent.getId())) {
            throw new ApiException("You cannot send a message to yourself");
        }

        StudentMessage message = StudentMessage.builder()
                .senderStudent(senderStudent)
                .receiverStudent(receiverStudent)
                .subject(request.getSubject().trim())
                .message(request.getMessage().trim())
                .build();

        StudentMessage savedMessage = studentMessageRepository.save(message);
        return toDto(savedMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentMessageResponseDto> getInbox(String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        Student currentStudent = studentRepository.findByUser_Id(currentUser.getId())
                .orElseThrow(() -> new ApiException("Only student accounts can access student communication inbox"));

        return studentMessageRepository.findByReceiverStudent_IdOrderByCreatedAtDesc(currentStudent.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    private StudentMessageResponseDto toDto(StudentMessage message) {
        return StudentMessageResponseDto.builder()
                .id(message.getId())
                .senderStudentId(message.getSenderStudent().getId())
                .senderName(message.getSenderStudent().getUser().getName())
                .senderEmail(message.getSenderStudent().getUser().getEmail())
                .receiverStudentId(message.getReceiverStudent().getId())
                .receiverName(message.getReceiverStudent().getUser().getName())
                .receiverEmail(message.getReceiverStudent().getUser().getEmail())
                .subject(message.getSubject())
                .message(message.getMessage())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
