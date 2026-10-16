package com.examen.biblioteca.service;

import com.examen.biblioteca.dto.BookRequest;
import com.examen.biblioteca.exception.BusinessException;
import com.examen.biblioteca.exception.ResourceNotFoundException;
import com.examen.biblioteca.model.Author;
import com.examen.biblioteca.model.Book;
import com.examen.biblioteca.model.Category;
import com.examen.biblioteca.repository.AuthorRepository;
import com.examen.biblioteca.repository.BookRepository;
import com.examen.biblioteca.repository.CategoryRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;

    public BookService(BookRepository bookRepository, AuthorRepository authorRepository, CategoryRepository categoryRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Book> findAll(String q) {
        if (q != null && !q.isBlank()) {
            return bookRepository.findByTitleContainingIgnoreCaseOrIsbnContainingIgnoreCaseOrderByTitleAsc(q.trim(), q.trim());
        }
        return bookRepository.findAll(Sort.by("title").ascending());
    }

    public Book findById(Long id) {
        return bookRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Libro no encontrado"));
    }

    @Transactional
    public Book create(BookRequest request) {
        if (bookRepository.existsByIsbn(request.isbn())) throw new BusinessException("Ya existe un libro con ese ISBN");
        Book book = new Book();
        apply(book, request, true);
        return bookRepository.save(book);
    }

    @Transactional
    public Book update(Long id, BookRequest request) {
        Book book = findById(id);
        if (!book.getIsbn().equals(request.isbn()) && bookRepository.existsByIsbn(request.isbn())) {
            throw new BusinessException("Ya existe un libro con ese ISBN");
        }
        apply(book, request, false);
        return bookRepository.save(book);
    }

    private void apply(Book book, BookRequest request, boolean creating) {
        Author author = authorRepository.findById(request.authorId())
                .orElseThrow(() -> new ResourceNotFoundException("Autor no encontrado"));
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

        int borrowed = creating ? 0 : book.getTotalCopies() - book.getAvailableCopies();
        if (request.totalCopies() < borrowed) {
            throw new BusinessException("El total de ejemplares no puede ser menor a los ejemplares actualmente prestados");
        }

        book.setTitle(request.title().trim());
        book.setIsbn(request.isbn().trim());
        book.setPublicationYear(request.publicationYear());
        book.setTotalCopies(request.totalCopies());
        book.setAvailableCopies(request.totalCopies() - borrowed);
        book.setAuthor(author);
        book.setCategory(category);
        book.setActive(request.active() == null || request.active());
    }

    @Transactional
    public void delete(Long id) {
        Book book = findById(id);
        if (!book.getAvailableCopies().equals(book.getTotalCopies())) {
            throw new BusinessException("No se puede eliminar un libro con préstamos activos");
        }
        bookRepository.delete(book);
    }
}
