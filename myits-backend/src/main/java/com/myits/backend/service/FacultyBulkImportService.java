package com.myits.backend.service;

import com.myits.backend.dto.FacultyBulkImportResultDto;
import org.springframework.web.multipart.MultipartFile;

public interface FacultyBulkImportService {

    FacultyBulkImportResultDto importFaculty(MultipartFile file);
}