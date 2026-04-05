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
public class FacultyBulkImportResultDto {

    private int totalRows;
    private int createdFaculty;
    private int updatedFaculty;
    private int skippedRows;

    @Builder.Default
    private List<String> messages = new ArrayList<>();
}