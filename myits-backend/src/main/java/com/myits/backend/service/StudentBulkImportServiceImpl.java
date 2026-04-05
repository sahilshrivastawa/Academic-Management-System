package com.myits.backend.service;

import com.myits.backend.dto.StudentBulkImportResultDto;
import com.myits.backend.entity.Role;
import com.myits.backend.entity.Student;
import com.myits.backend.entity.User;
import com.myits.backend.exception.ApiException;
import com.myits.backend.repository.RoleRepository;
import com.myits.backend.repository.StudentRepository;
import com.myits.backend.repository.UserRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.apache.poi.ss.usermodel.Cell;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentBulkImportServiceImpl implements StudentBulkImportService {

    @Getter
    @AllArgsConstructor
    private static class ImportResult {
        private final boolean created;
        private final boolean duplicate;
        private final String email;
    }

    private static final String DEFAULT_PASSWORD = "Changeme@123";
    private static final Set<String> IMPORTABLE_KEYS = Set.of(
            "name", "email", "password", "enrollmentno", "rollno", "branch",
            "academicyear", "yearsection", "course", "mobileno", "house"
    );
        private static final Map<String, String> HEADER_ALIASES = Map.ofEntries(
            Map.entry("name", "name"),
            Map.entry("fullname", "name"),
            Map.entry("studentname", "name"),
            Map.entry("nameofstudent", "name"),
            Map.entry("email", "email"),
            Map.entry("emailid", "email"),
            Map.entry("emailaddress", "email"),
            Map.entry("password", "password"),
            Map.entry("pass", "password"),
            Map.entry("enrollmentno", "enrollmentno"),
            Map.entry("enrolmentno", "enrollmentno"),
            Map.entry("rollno", "rollno"),
            Map.entry("rollnumber", "rollno"),
            Map.entry("branch", "branch"),
            Map.entry("course", "course"),
            Map.entry("academicyear", "academicyear"),
            Map.entry("yearsection", "yearsection"),
            Map.entry("year", "academicyear"),
            Map.entry("mobileno", "mobileno"),
            Map.entry("mobile", "mobileno"),
            Map.entry("mobilenumber", "mobileno"),
            Map.entry("phone", "mobileno"),
            Map.entry("house", "house")
        );

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentBulkImportServiceImpl(UserRepository userRepository,
                                        StudentRepository studentRepository,
                                        RoleRepository roleRepository,
                                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public StudentBulkImportResultDto importStudents(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("Upload file is required");
        }

        String fileName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        List<Map<String, String>> rows = readRows(file, fileName);

        Role studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseThrow(() -> new ApiException("STUDENT role not configured in system"));

        StudentBulkImportResultDto result = StudentBulkImportResultDto.builder().build();
        result.setTotalRows(rows.size());

        int rowNumber = 1;
        for (Map<String, String> row : rows) {
            rowNumber += 1;
            try {
                boolean created = processRow(row, studentRole);

                if (created) {
                    result.setCreatedStudents(result.getCreatedStudents() + 1);
                } else {
                    result.setUpdatedStudents(result.getUpdatedStudents() + 1);
                }
            } catch (Exception exception) {
                result.setSkippedRows(result.getSkippedRows() + 1);
                result.getMessages().add("Row " + rowNumber + ": " + exception.getMessage());
            }
        }

        if (result.getMessages().isEmpty()) {
            result.getMessages().add("Import completed successfully");
        }

        return result;
    }

    private boolean processRow(Map<String, String> row, Role studentRole) {
        String name = requireValue(row, "name");
        String email = requireValue(row, "email").toLowerCase(Locale.ROOT);
        String password = normalize(row.get("password"));
        String enrollmentNo = requireValue(row, "enrollmentno", "rollno");
        String branch = requireValue(row, "branch");
        String academicYearValue = getFirstNonBlank(row, "academicyear", "yearsection");
        int academicYear = parseYear(academicYearValue.isBlank() ? "1" : academicYearValue);
        String course = requireValue(row, "course");
        String mobileNo = requireValue(row, "mobileno");
        String house = requireValue(row, "house");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(password.isBlank() ? DEFAULT_PASSWORD : password))
                    .role(studentRole)
                    .build();
            user = userRepository.save(user);
        } else {
            if (!"STUDENT".equalsIgnoreCase(user.getRole().getRoleName())) {
                throw new ApiException("Email belongs to non-student account: " + email);
            }
            user.setName(name);
            user.setPassword(passwordEncoder.encode(password.isBlank() ? DEFAULT_PASSWORD : password));
            userRepository.save(user);
        }

        Student enrollmentOwner = studentRepository.findByEnrollmentNo(enrollmentNo).orElse(null);
        if (enrollmentOwner != null && !enrollmentOwner.getUser().getId().equals(user.getId())) {
            throw new ApiException("Enrollment number already used by another account: " + enrollmentNo);
        }

        Student existingStudent = studentRepository.findByUser_Id(user.getId()).orElse(null);
        boolean created = existingStudent == null;
        Student student = existingStudent == null ? Student.builder().user(user).build() : existingStudent;
        student.setEnrollmentNo(enrollmentNo);
        student.setBranch(branch);
        student.setAcademicYear(academicYear);
        student.setCourse(course);
        student.setDegree("");
        student.setProgram("");
        student.setMobileNo(mobileNo);
        student.setHouse(house);

        studentRepository.save(student);
        return created;
    }

    private int parseYear(String value) {
        try {
            String digitsOnly = value == null ? "" : value.replaceAll("[^0-9]", "");
            int year = Integer.parseInt(digitsOnly.isBlank() ? value.trim() : digitsOnly);
            if (year < 1 || year > 4) {
                throw new ApiException("academicYear must be between 1 and 4");
            }
            return year;
        } catch (NumberFormatException exception) {
            throw new ApiException("Invalid academicYear: " + value);
        }
    }

    private String requireValue(Map<String, String> row, String... keys) {
        String value = getFirstNonBlank(row, keys);
        if (value.isBlank()) {
            throw new ApiException("Missing required field: " + String.join("/", keys));
        }
        return value;
    }

    private String getFirstNonBlank(Map<String, String> row, String... keys) {
        return Arrays.stream(keys)
                .map(row::get)
                .map(this::normalize)
                .filter(v -> !v.isBlank())
                .findFirst()
                .orElse("");
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private List<Map<String, String>> readRows(MultipartFile file, String fileName) {
        try {
            if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
                return readExcel(file);
            }
            return readCsv(file);
        } catch (IOException exception) {
            throw new ApiException("Failed to read import file");
        }
    }

    private List<Map<String, String>> readCsv(MultipartFile file) throws IOException {
        List<Map<String, String>> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return rows;
            }

            String[] headers = splitCsv(headerLine);
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                String[] values = splitCsv(line);
                Map<String, String> row = new HashMap<>();
                for (int index = 0; index < headers.length; index++) {
                    String key = toCanonicalHeader(headers[index]);
                    String value = index < values.length ? normalize(values[index]) : "";
                    if (IMPORTABLE_KEYS.contains(key)) {
                        row.put(key, value);
                    }
                }
                rows.add(row);
            }
        }
        return rows;
    }

    private String[] splitCsv(String line) {
        return line.split(",", -1);
    }

    private List<Map<String, String>> readExcel(MultipartFile file) throws IOException {
        List<Map<String, String>> rows = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                return rows;
            }

            DataFormatter formatter = new DataFormatter();
            int headerRowIndex = detectHeaderRow(sheet, formatter);
            Row headerRow = sheet.getRow(headerRowIndex);
            if (headerRow == null) {
                return rows;
            }

            List<String> headers = new ArrayList<>();
            int headerCellCount = Math.max(0, headerRow.getLastCellNum());
            for (int columnIndex = 0; columnIndex < headerCellCount; columnIndex++) {
                Cell cell = headerRow.getCell(columnIndex);
                headers.add(toCanonicalHeader(cell == null ? "" : formatter.formatCellValue(cell)));
            }

            for (int rowIndex = headerRowIndex + 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row rowData = sheet.getRow(rowIndex);
                if (rowData == null) {
                    continue;
                }

                Map<String, String> row = new HashMap<>();
                boolean hasValue = false;
                for (int columnIndex = 0; columnIndex < headers.size(); columnIndex++) {
                    Cell cell = rowData.getCell(columnIndex);
                    String value = cell == null ? "" : normalize(formatter.formatCellValue(cell));
                    if (!value.isBlank()) {
                        hasValue = true;
                    }
                    String key = headers.get(columnIndex);
                    if (IMPORTABLE_KEYS.contains(key)) {
                        row.put(key, value);
                    }
                }

                if (hasValue) {
                    rows.add(row);
                }
            }
        }
        return rows;
    }

    private int detectHeaderRow(Sheet sheet, DataFormatter formatter) {
        int firstRowIndex = sheet.getFirstRowNum();
        int lastRowIndex = Math.min(sheet.getLastRowNum(), firstRowIndex + 10);

        int bestRowIndex = firstRowIndex;
        int bestScore = -1;

        for (int rowIndex = firstRowIndex; rowIndex <= lastRowIndex; rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null) {
                continue;
            }

            int cellCount = Math.max(0, row.getLastCellNum());
            int score = 0;
            for (int columnIndex = 0; columnIndex < cellCount; columnIndex++) {
                Cell cell = row.getCell(columnIndex);
                String key = toCanonicalHeader(cell == null ? "" : formatter.formatCellValue(cell));
                if (IMPORTABLE_KEYS.contains(key)) {
                    score++;
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestRowIndex = rowIndex;
            }

            if (score >= 4) {
                return rowIndex;
            }
        }

        return bestRowIndex;
    }

    private String normalizeHeader(String header) {
        return normalize(header)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");
    }

    private String toCanonicalHeader(String header) {
        String normalized = normalizeHeader(header);
        return HEADER_ALIASES.getOrDefault(normalized, normalized);
    }
}