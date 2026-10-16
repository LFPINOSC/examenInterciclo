package com.examen.biblioteca.service;

import com.examen.biblioteca.dto.UserUpdateRequest;
import com.examen.biblioteca.exception.BusinessException;
import com.examen.biblioteca.exception.ResourceNotFoundException;
import com.examen.biblioteca.model.User;
import com.examen.biblioteca.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) { this.repository = repository; }

    public List<User> findAll() { return repository.findAll(Sort.by("fullName").ascending()); }
    public User findById(Long id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado")); }

    @Transactional
    public User update(Long id, UserUpdateRequest request) {
        User user = findById(id);
        repository.findByEmail(request.email().trim().toLowerCase()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) throw new BusinessException("El correo ya está registrado");
        });
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setRole(request.role());
        user.setEnabled(request.enabled());
        return repository.save(user);
    }

    @Transactional
    public void delete(Long id, String currentUsername) {
        User user = findById(id);
        if (user.getUsername().equals(currentUsername)) throw new BusinessException("No puede eliminar su propia cuenta mientras está autenticado");
        repository.delete(user);
    }
}
