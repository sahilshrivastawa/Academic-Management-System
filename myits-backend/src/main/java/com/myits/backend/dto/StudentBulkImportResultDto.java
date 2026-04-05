package com.myits.backend.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentBulkImportResultDto {

    private int totalRows;
    private int createdStudents;
    private int updatedStudents;
    private int skippedRows;

    @Builder.Default
    private List<String> messages = new ArrayList<>();
}