package com.examen.biblioteca.controller;

import com.examen.biblioteca.model.Author;
import com.examen.biblioteca.service.AuthorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
public class AuthorController {
    private final AuthorService service;
    public AuthorController(AuthorService service) { this.service = service; }

    @GetMapping public List<Author> all() { return service.findAll(); }
    @GetMapping("/{id}") public Author one(@PathVariable Long id) { return service.findById(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasRole('ADMIN')")
    public Author create(@Valid @RequestBody Author author) { return service.create(author); }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public Author update(@PathVariable Long id, @Valid @RequestBody Author author) { return service.update(id, author); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
