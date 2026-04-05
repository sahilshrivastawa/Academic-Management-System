package com.myits.backend.service;

import com.myits.backend.dto.StudentBulkImportResultDto;
import org.springframework.web.multipart.MultipartFile;

public interface StudentBulkImportService {

    StudentBulkImportResultDto importStudents(MultipartFile file);
}