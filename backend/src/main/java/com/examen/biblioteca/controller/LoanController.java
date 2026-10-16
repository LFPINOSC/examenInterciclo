package com.examen.biblioteca.controller;

import com.examen.biblioteca.dto.LoanRequest;
import com.examen.biblioteca.model.Loan;
import com.examen.biblioteca.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanController {
    private final LoanService service;
    public LoanController(LoanService service) { this.service = service; }

    @GetMapping public List<Loan> all(Authentication auth) { return service.findAll(auth); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Loan create(@Valid @RequestBody LoanRequest request, Authentication auth) { return service.create(request, auth); }
    @PutMapping("/{id}/return") public Loan returnBook(@PathVariable Long id, Authentication auth) { return service.returnBook(id, auth); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) { service.delete(id, auth); }
}
