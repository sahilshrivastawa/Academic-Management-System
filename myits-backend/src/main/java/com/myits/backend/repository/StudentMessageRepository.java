package com.myits.backend.repository;

import com.myits.backend.entity.StudentMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentMessageRepository extends JpaRepository<StudentMessage, Long> {

    List<StudentMessage> findByReceiverStudent_IdOrderByCreatedAtDesc(Long receiverStudentId);

    List<StudentMessage> findBySenderStudent_IdOrderByCreatedAtDesc(Long senderStudentId);
}
