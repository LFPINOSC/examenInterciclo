package com.examen.biblioteca.service;

import com.examen.biblioteca.exception.ResourceNotFoundException;
import com.examen.biblioteca.model.Author;
import com.examen.biblioteca.repository.AuthorRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthorService {
    private final AuthorRepository repository;

    public AuthorService(AuthorRepository repository) { this.repository = repository; }

    public List<Author> findAll() { return repository.findAll(Sort.by("name").ascending()); }
    public Author findById(Long id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Autor no encontrado")); }
    @Transactional public Author create(Author author) { author.setId(null); return repository.save(author); }
    @Transactional public Author update(Long id, Author input) {
        Author current = findById(id);
        current.setName(input.getName());
        current.setNationality(input.getNationality());
        current.setBiography(input.getBiography());
        return repository.save(current);
    }
    @Transactional public void delete(Long id) { repository.delete(findById(id)); }
}
