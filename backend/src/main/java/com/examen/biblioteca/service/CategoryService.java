package com.examen.biblioteca.service;

import com.examen.biblioteca.exception.BusinessException;
import com.examen.biblioteca.exception.ResourceNotFoundException;
import com.examen.biblioteca.model.Category;
import com.examen.biblioteca.repository.CategoryRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) { this.repository = repository; }

    public List<Category> findAll() { return repository.findAll(Sort.by("name").ascending()); }
    public Category findById(Long id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada")); }
    @Transactional public Category create(Category category) {
        if (repository.existsByNameIgnoreCase(category.getName())) throw new BusinessException("La categoría ya existe");
        category.setId(null);
        return repository.save(category);
    }
    @Transactional public Category update(Long id, Category input) {
        Category current = findById(id);
        if (!current.getName().equalsIgnoreCase(input.getName()) && repository.existsByNameIgnoreCase(input.getName())) {
            throw new BusinessException("La categoría ya existe");
        }
        current.setName(input.getName());
        current.setDescription(input.getDescription());
        return repository.save(current);
    }
    @Transactional public void delete(Long id) { repository.delete(findById(id)); }
}
