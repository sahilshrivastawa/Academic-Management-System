package com.myits.backend.controller;

import com.myits.backend.dto.AdminRequestDto;
import com.myits.backend.dto.AdminResponseDto;
import com.myits.backend.dto.ApiResponseDto;
import com.myits.backend.service.AdminService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admins")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping
    public ResponseEntity<ApiResponseDto<AdminResponseDto>> addAdmin(@Valid @RequestBody AdminRequestDto request) {
        AdminResponseDto admin = adminService.addAdmin(request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Admin added successfully", admin));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDto<AdminResponseDto>> updateAdmin(@PathVariable Long id,
                                                                         @Valid @RequestBody AdminRequestDto request) {
        AdminResponseDto admin = adminService.updateAdmin(id, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Admin updated successfully", admin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto<String>> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Admin deleted successfully", "Deleted"));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<List<AdminResponseDto>>> getAllAdmins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AdminResponseDto> paginatedAdmins = adminService.getAllAdminsPaginated(page, size);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Admins fetched successfully (paginated)", paginatedAdmins.getContent()));
    }
}
