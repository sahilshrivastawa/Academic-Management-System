package com.myits.backend.service;

import com.myits.backend.dto.StudentAiDashboardResponseDto;

public interface StudentAiDashboardService {

    StudentAiDashboardResponseDto getDashboardInsights(String studentEmail);
}
