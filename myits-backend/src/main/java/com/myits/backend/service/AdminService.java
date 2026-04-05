package com.myits.backend.service;

import com.myits.backend.dto.AdminRequestDto;
import com.myits.backend.dto.AdminResponseDto;
import java.util.List;
import org.springframework.data.domain.Page;

public interface AdminService {

    AdminResponseDto addAdmin(AdminRequestDto request);

    AdminResponseDto updateAdmin(Long adminId, AdminRequestDto request);

    void deleteAdmin(Long adminId);

    List<AdminResponseDto> getAllAdmins();

    Page<AdminResponseDto> getAllAdminsPaginated(int page, int size);
}
