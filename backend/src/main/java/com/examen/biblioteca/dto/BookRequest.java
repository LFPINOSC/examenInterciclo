package com.examen.biblioteca.dto;

import jakarta.validation.constraints.*;

public record BookRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 20) String isbn,
        @Min(1400) @Max(2100) Integer publicationYear,
        @NotNull @Min(1) Integer totalCopies,
        @NotNull Long authorId,
        @NotNull Long categoryId,
        Boolean active
) {}
