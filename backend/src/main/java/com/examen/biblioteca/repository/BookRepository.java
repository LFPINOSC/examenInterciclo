package com.examen.biblioteca.repository;

import com.examen.biblioteca.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByIsbn(String isbn);
    List<Book> findByTitleContainingIgnoreCaseOrIsbnContainingIgnoreCaseOrderByTitleAsc(String title, String isbn);
}
