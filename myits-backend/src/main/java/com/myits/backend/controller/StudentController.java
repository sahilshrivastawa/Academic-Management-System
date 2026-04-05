package com.myits.backend.controller;

import com.myits.backend.dto.ApiResponseDto;
import com.myits.backend.dto.StudentMessageRequestDto;
import com.myits.backend.dto.StudentMessageResponseDto;
import com.myits.backend.dto.StudentAiDashboardResponseDto;
import com.myits.backend.dto.AttendancePredictionRequestDto;
import com.myits.backend.dto.AttendancePredictionResponseDto;
import com.myits.backend.dto.StudentChatbotRequestDto;
import com.myits.backend.dto.StudentChatbotResponseDto;
import com.myits.backend.dto.AcademicPerformanceRequestDto;
import com.myits.backend.dto.AcademicPerformanceResponseDto;
import com.myits.backend.service.AttendancePredictionService;
import com.myits.backend.service.AcademicPerformanceAnalyzerService;
import com.myits.backend.dto.StudentRequestDto;
import com.myits.backend.dto.StudentResponseDto;
import com.myits.backend.dto.StudentSelfProfileRequestDto;
import com.myits.backend.dto.StudentBulkImportResultDto;
import com.myits.backend.service.StudentAiDashboardService;
import com.myits.backend.service.StudentBulkImportService;
import com.myits.backend.service.StudentChatbotService;
import com.myits.backend.service.StudentCommunicationService;
import com.myits.backend.service.StudentService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
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
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentService studentService;
    private final StudentBulkImportService studentBulkImportService;
    private final StudentCommunicationService studentCommunicationService;
    private final StudentAiDashboardService studentAiDashboardService;
    private final AttendancePredictionService attendancePredictionService;
    private final StudentChatbotService studentChatbotService;
    private final AcademicPerformanceAnalyzerService academicPerformanceAnalyzerService;

    public StudentController(StudentService studentService,
                             StudentBulkImportService studentBulkImportService,
                             StudentCommunicationService studentCommunicationService,
                             StudentAiDashboardService studentAiDashboardService,
                             AttendancePredictionService attendancePredictionService,
                             StudentChatbotService studentChatbotService,
                             AcademicPerformanceAnalyzerService academicPerformanceAnalyzerService) {
        this.studentService = studentService;
        this.studentBulkImportService = studentBulkImportService;
        this.studentCommunicationService = studentCommunicationService;
        this.studentAiDashboardService = studentAiDashboardService;
        this.attendancePredictionService = attendancePredictionService;
        this.studentChatbotService = studentChatbotService;
        this.academicPerformanceAnalyzerService = academicPerformanceAnalyzerService;
    }

    @PostMapping
    public ResponseEntity<ApiResponseDto<StudentResponseDto>> addStudent(@Valid @RequestBody StudentRequestDto request) {
        StudentResponseDto student = studentService.addStudent(request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Student added successfully", student));
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponseDto<StudentBulkImportResultDto>> importStudents(@RequestParam("file") MultipartFile file) {
        StudentBulkImportResultDto result = studentBulkImportService.importStudents(file);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Student bulk import completed", result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDto<StudentResponseDto>> updateStudent(@PathVariable Long id,
                                                                             @Valid @RequestBody StudentRequestDto request) {
        StudentResponseDto student = studentService.updateStudent(id, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Student updated successfully", student));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto<String>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Student deleted successfully", "Deleted"));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<List<StudentResponseDto>>> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<StudentResponseDto> paginatedStudents = studentService.getAllStudentsPaginated(page, size);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Students fetched successfully (paginated)", paginatedStudents.getContent()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDto<StudentResponseDto>> getStudentById(@PathVariable Long id) {
        StudentResponseDto student = studentService.getStudentById(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Student fetched successfully", student));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponseDto<StudentResponseDto>> getMyStudentProfile(Authentication authentication) {
        StudentResponseDto student = studentService.getStudentByEmail(authentication.getName());
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Student profile fetched successfully", student));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<ApiResponseDto<StudentResponseDto>> upsertMyStudentProfile(
            @Valid @RequestBody StudentSelfProfileRequestDto request,
            Authentication authentication) {
        StudentResponseDto student = studentService.upsertStudentProfileByEmail(authentication.getName(), request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Student profile saved successfully", student));
    }

    @PostMapping("/messages")
    public ResponseEntity<ApiResponseDto<StudentMessageResponseDto>> sendMessage(
            @Valid @RequestBody StudentMessageRequestDto request,
            Authentication authentication) {
        StudentMessageResponseDto sentMessage = studentCommunicationService.sendMessage(authentication.getName(), request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Message sent successfully", sentMessage));
    }

    @GetMapping("/messages/inbox")
    public ResponseEntity<ApiResponseDto<List<StudentMessageResponseDto>>> getInbox(Authentication authentication) {
        List<StudentMessageResponseDto> messages = studentCommunicationService.getInbox(authentication.getName());
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Inbox fetched successfully", messages));
    }

    @GetMapping("/ai-dashboard")
    public ResponseEntity<ApiResponseDto<StudentAiDashboardResponseDto>> getAiDashboard(Authentication authentication) {
        StudentAiDashboardResponseDto response = studentAiDashboardService.getDashboardInsights(authentication.getName());
        return ResponseEntity.ok(new ApiResponseDto<>(true, "AI dashboard insights fetched successfully", response));
    }

    @PostMapping("/attendance/predict")
    public ResponseEntity<ApiResponseDto<AttendancePredictionResponseDto>> predictAttendance(
            @Valid @RequestBody AttendancePredictionRequestDto request) {
        AttendancePredictionResponseDto response = attendancePredictionService.predictAttendance(request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Attendance predicted successfully", response));
    }

    @PostMapping("/chatbot/ask")
    public ResponseEntity<ApiResponseDto<StudentChatbotResponseDto>> askChatbot(
            @Valid @RequestBody StudentChatbotRequestDto request,
            Authentication authentication) {
        StudentChatbotResponseDto response = studentChatbotService.ask(authentication.getName(), request.getMessage());
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Chatbot response generated successfully", response));
    }

    @PostMapping("/performance/analyze")
    public ResponseEntity<ApiResponseDto<AcademicPerformanceResponseDto>> analyzePerformance(
            @Valid @RequestBody AcademicPerformanceRequestDto request) {
        AcademicPerformanceResponseDto response = academicPerformanceAnalyzerService.analyze(request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Academic performance analyzed successfully", response));
    }
}
