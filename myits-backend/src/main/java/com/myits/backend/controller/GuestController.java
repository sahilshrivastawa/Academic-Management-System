package com.myits.backend.controller;

import com.myits.backend.dto.ApiResponseDto;
import com.myits.backend.dto.GuestRequestDto;
import com.myits.backend.dto.GuestResponseDto;
import com.myits.backend.service.GuestService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/guests")
public class GuestController {

    private final GuestService guestService;

    public GuestController(GuestService guestService) {
        this.guestService = guestService;
    }

    @PostMapping
    public ResponseEntity<ApiResponseDto<GuestResponseDto>> addGuest(@Valid @RequestBody GuestRequestDto request) {
        GuestResponseDto guest = guestService.addGuest(request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Guest added successfully", guest));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<List<GuestResponseDto>>> viewGuestVisits(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate visitDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (visitDate != null) {
            List<GuestResponseDto> guests = guestService.viewGuestVisits(visitDate);
            return ResponseEntity.ok(new ApiResponseDto<>(true, "Guest visits fetched successfully (by date)", guests));
        }
        Page<GuestResponseDto> paginatedGuests = guestService.getAllGuestsPaginated(page, size);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Guest visits fetched successfully (paginated)", paginatedGuests.getContent()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto<String>> deleteGuest(@PathVariable Long id) {
        guestService.deleteGuest(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Guest deleted successfully", "Deleted"));
    }
}
