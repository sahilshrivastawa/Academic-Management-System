package com.myits.backend.service;

import com.myits.backend.dto.GuestRequestDto;
import com.myits.backend.dto.GuestResponseDto;
import com.myits.backend.entity.Guest;
import com.myits.backend.exception.ResourceNotFoundException;
import com.myits.backend.repository.GuestRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class GuestServiceImpl implements GuestService {

    private final GuestRepository guestRepository;

    public GuestServiceImpl(GuestRepository guestRepository) {
        this.guestRepository = guestRepository;
    }

    @Override
    public GuestResponseDto addGuest(GuestRequestDto request) {
        Guest guest = Guest.builder()
                .name(request.getName().trim())
                .organization(request.getOrganization().trim())
                .visitDate(request.getVisitDate())
                .build();

        Guest savedGuest = guestRepository.save(guest);
        return toDto(savedGuest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestResponseDto> viewGuestVisits(LocalDate visitDate) {
        List<Guest> guests = visitDate == null
                ? guestRepository.findAll(Sort.by(Sort.Order.asc("id")))
                : guestRepository.findByVisitDate(visitDate);

        return guests.stream().map(this::toDto).toList();
    }

    @Override
    public void deleteGuest(Long guestId) {
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with id: " + guestId));
        guestRepository.delete(guest);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GuestResponseDto> getAllGuestsPaginated(int page, int size) {
        int validSize = Math.min(size, 100);
        PageRequest pageRequest = PageRequest.of(page, validSize);
        Page<Guest> guestPage = guestRepository.findAll(pageRequest);
        return guestPage.map(this::toDto);
    }

    private GuestResponseDto toDto(Guest guest) {
        return GuestResponseDto.builder()
                .id(guest.getId())
                .name(guest.getName())
                .organization(guest.getOrganization())
                .visitDate(guest.getVisitDate())
                .build();
    }
}
