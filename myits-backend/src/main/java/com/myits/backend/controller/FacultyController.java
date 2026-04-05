package com.myits.backend.controller;

import com.myits.backend.dto.FacultyBulkImportResultDto;
import com.myits.backend.dto.FacultyDirectoryResponseDto;
import com.myits.backend.service.FacultyDirectoryService;
import com.myits.backend.service.FacultyBulkImportService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/faculty")
public class FacultyController {

    private final FacultyDirectoryService facultyDirectoryService;
    private final FacultyBulkImportService facultyBulkImportService;

    public FacultyController(FacultyDirectoryService facultyDirectoryService,
                             FacultyBulkImportService facultyBulkImportService) {
        this.facultyDirectoryService = facultyDirectoryService;
        this.facultyBulkImportService = facultyBulkImportService;
    }

    @GetMapping("/directory")
    public ResponseEntity<List<FacultyDirectoryResponseDto>> getDirectory() {
        return ResponseEntity.ok(facultyDirectoryService.getFacultyDirectory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacultyDirectoryResponseDto> getFacultyById(@PathVariable Long id) {
        return ResponseEntity.ok(facultyDirectoryService.getFacultyById(id));
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacultyBulkImportResultDto> importFaculty(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(facultyBulkImportService.importFaculty(file));
    }
}
