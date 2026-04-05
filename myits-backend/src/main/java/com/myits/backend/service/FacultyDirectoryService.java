package com.myits.backend.service;

import com.myits.backend.dto.FacultyDirectoryResponseDto;
import java.util.List;

public interface FacultyDirectoryService {

    List<FacultyDirectoryResponseDto> getFacultyDirectory();

    FacultyDirectoryResponseDto getFacultyById(Long facultyId);
}
