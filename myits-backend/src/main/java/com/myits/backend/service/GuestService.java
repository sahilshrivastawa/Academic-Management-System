package com.myits.backend.service;

import com.myits.backend.dto.GuestRequestDto;
import com.myits.backend.dto.GuestResponseDto;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;

public interface GuestService {

    GuestResponseDto addGuest(GuestRequestDto request);

    List<GuestResponseDto> viewGuestVisits(LocalDate visitDate);

    void deleteGuest(Long guestId);

    Page<GuestResponseDto> getAllGuestsPaginated(int page, int size);
}
