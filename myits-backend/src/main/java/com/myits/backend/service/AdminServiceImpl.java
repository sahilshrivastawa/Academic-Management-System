package com.myits.backend.service;

import com.myits.backend.dto.AdminRequestDto;
import com.myits.backend.dto.AdminResponseDto;
import com.myits.backend.entity.Admin;
import com.myits.backend.entity.User;
import com.myits.backend.exception.ApiException;
import com.myits.backend.exception.ResourceNotFoundException;
import com.myits.backend.repository.AdminRepository;
import com.myits.backend.repository.UserRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    public AdminServiceImpl(AdminRepository adminRepository, UserRepository userRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
    }

    @Override
    public AdminResponseDto addAdmin(AdminRequestDto request) {
        validateUniqueForCreate(request.getUserId());

        User user = getUserOrThrow(request.getUserId());
        Admin admin = Admin.builder()
                .user(user)
                .department(request.getDepartment().trim())
                .build();

        Admin savedAdmin = adminRepository.save(admin);
        return toDto(savedAdmin);
    }

    @Override
    public AdminResponseDto updateAdmin(Long adminId, AdminRequestDto request) {
        Admin admin = getAdminOrThrow(adminId);

        if (!admin.getUser().getId().equals(request.getUserId())) {
            adminRepository.findByUser_Id(request.getUserId()).ifPresent(existing -> {
                if (!existing.getId().equals(adminId)) {
                    throw new ApiException("Admin is already linked with this user");
                }
            });
            admin.setUser(getUserOrThrow(request.getUserId()));
        }

        admin.setDepartment(request.getDepartment().trim());
        Admin updatedAdmin = adminRepository.save(admin);
        return toDto(updatedAdmin);
    }

    @Override
    public void deleteAdmin(Long adminId) {
        Admin admin = getAdminOrThrow(adminId);
        adminRepository.delete(admin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminResponseDto> getAllAdmins() {
        return adminRepository.findAll(Sort.by(Sort.Order.asc("id"))).stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminResponseDto> getAllAdminsPaginated(int page, int size) {
        int validSize = Math.min(size, 100);
        PageRequest pageRequest = PageRequest.of(page, validSize);
        Page<Admin> adminPage = adminRepository.findAll(pageRequest);
        return adminPage.map(this::toDto);
    }

    private void validateUniqueForCreate(Long userId) {
        adminRepository.findByUser_Id(userId).ifPresent(existing -> {
            throw new ApiException("Admin is already linked with this user");
        });
    }

    private Admin getAdminOrThrow(Long adminId) {
        return adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + adminId));
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private AdminResponseDto toDto(Admin admin) {
        return AdminResponseDto.builder()
                .id(admin.getId())
                .userId(admin.getUser().getId())
                .userName(admin.getUser().getName())
                .userEmail(admin.getUser().getEmail())
                .department(admin.getDepartment())
                .build();
    }
}
