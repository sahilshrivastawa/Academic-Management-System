package com.myits.backend.service;

import com.myits.backend.dto.FacultyDirectoryResponseDto;
import com.myits.backend.entity.FacultyProfile;
import com.myits.backend.exception.ResourceNotFoundException;
import com.myits.backend.repository.FacultyProfileRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FacultyDirectoryServiceImpl implements FacultyDirectoryService {

    private final FacultyProfileRepository facultyProfileRepository;

    public FacultyDirectoryServiceImpl(FacultyProfileRepository facultyProfileRepository) {
        this.facultyProfileRepository = facultyProfileRepository;
    }

    @Override
    public List<FacultyDirectoryResponseDto> getFacultyDirectory() {
        return facultyProfileRepository.findAll(Sort.by(Sort.Order.asc("id")))
                .stream()
                .map(profile -> FacultyDirectoryResponseDto.builder()
                        .id(profile.getId())
                        .userId(profile.getUser().getId())
                        .name(profile.getUser().getName())
                        .email(profile.getUser().getEmail())
                .designation(profile.getDesignation())
                        .department(profile.getDepartment())
                .houseCoordinator(profile.getHouseCoordinator())
                        .mobileNo(profile.getMobileNo())
                        .build())
                .toList();
    }

    @Override
    public FacultyDirectoryResponseDto getFacultyById(Long facultyId) {
        FacultyProfile profile = facultyProfileRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found with id: " + facultyId));

        return FacultyDirectoryResponseDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .name(profile.getUser().getName())
                .email(profile.getUser().getEmail())
                .designation(profile.getDesignation())
                .department(profile.getDepartment())
                .houseCoordinator(profile.getHouseCoordinator())
                .mobileNo(profile.getMobileNo())
                .build();
    }
}
