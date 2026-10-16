package com.examen.biblioteca.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LoanRequest(
        @NotNull Long bookId,
        Long userId,
        @NotNull @Future LocalDate dueDate
) {}
