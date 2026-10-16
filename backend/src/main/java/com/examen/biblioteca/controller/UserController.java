package com.examen.biblioteca.controller;

import com.examen.biblioteca.dto.UserUpdateRequest;
import com.examen.biblioteca.model.User;
import com.examen.biblioteca.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {
    private final UserService service;
    public UserController(UserService service) { this.service = service; }

    @GetMapping public List<User> all() { return service.findAll(); }
    @GetMapping("/{id}") public User one(@PathVariable Long id) { return service.findById(id); }
    @PutMapping("/{id}") public User update(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) { return service.update(id, request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) { service.delete(id, auth.getName()); }
}
