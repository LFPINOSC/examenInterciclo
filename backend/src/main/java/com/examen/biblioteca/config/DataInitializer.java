package com.examen.biblioteca.config;

import com.examen.biblioteca.model.*;
import com.examen.biblioteca.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           AuthorRepository authorRepository,
                           CategoryRepository categoryRepository,
                           BookRepository bookRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.authorRepository = authorRepository;
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setFullName("Administrador Biblioteca");
            admin.setEmail("admin@biblioteca.local");
            admin.setPasswordHash(passwordEncoder.encode("Admin123*"));
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("lector")) {
            User reader = new User();
            reader.setUsername("lector");
            reader.setFullName("Lector de Prueba");
            reader.setEmail("lector@biblioteca.local");
            reader.setPasswordHash(passwordEncoder.encode("Lector123*"));
            reader.setRole(Role.LECTOR);
            reader.setEnabled(true);
            userRepository.save(reader);
        }

        if (authorRepository.count() == 0 && categoryRepository.count() == 0 && bookRepository.count() == 0) {
            Author garcia = new Author();
            garcia.setName("Gabriel García Márquez");
            garcia.setNationality("Colombiana");
            garcia = authorRepository.save(garcia);

            Author orwell = new Author();
            orwell.setName("George Orwell");
            orwell.setNationality("Británica");
            orwell = authorRepository.save(orwell);

            Category novel = new Category();
            novel.setName("Novela");
            novel.setDescription("Obras narrativas de ficción");
            novel = categoryRepository.save(novel);

            Category dystopia = new Category();
            dystopia.setName("Distopía");
            dystopia.setDescription("Ficción sobre sociedades futuras problemáticas");
            dystopia = categoryRepository.save(dystopia);

            Book b1 = new Book();
            b1.setTitle("Cien años de soledad");
            b1.setIsbn("9780307474728");
            b1.setPublicationYear(1967);
            b1.setTotalCopies(3);
            b1.setAvailableCopies(3);
            b1.setAuthor(garcia);
            b1.setCategory(novel);
            bookRepository.save(b1);

            Book b2 = new Book();
            b2.setTitle("1984");
            b2.setIsbn("9780451524935");
            b2.setPublicationYear(1949);
            b2.setTotalCopies(2);
            b2.setAvailableCopies(2);
            b2.setAuthor(orwell);
            b2.setCategory(dystopia);
            bookRepository.save(b2);
        }
    }
}
