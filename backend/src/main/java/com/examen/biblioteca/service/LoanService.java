package com.examen.biblioteca.service;

import com.examen.biblioteca.dto.LoanRequest;
import com.examen.biblioteca.exception.BusinessException;
import com.examen.biblioteca.exception.ResourceNotFoundException;
import com.examen.biblioteca.model.*;
import com.examen.biblioteca.repository.BookRepository;
import com.examen.biblioteca.repository.LoanRepository;
import com.examen.biblioteca.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoanService {
    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public LoanService(LoanRepository loanRepository, BookRepository bookRepository, UserRepository userRepository) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public List<Loan> findAll(Authentication auth) {
        updateExpired();
        User current = currentUser(auth);
        if (current.getRole() == Role.ADMIN) return loanRepository.findAll();
        return loanRepository.findByUserIdOrderByLoanDateDesc(current.getId());
    }

    @Transactional
    public Loan create(LoanRequest request, Authentication auth) {
        User current = currentUser(auth);
        User borrower;
        if (current.getRole() == Role.ADMIN && request.userId() != null) {
            borrower = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        } else {
            borrower = current;
        }

        Book book = bookRepository.findById(request.bookId())
                .orElseThrow(() -> new ResourceNotFoundException("Libro no encontrado"));
        if (!book.isActive()) throw new BusinessException("El libro está inactivo");
        if (book.getAvailableCopies() <= 0) throw new BusinessException("No existen ejemplares disponibles");
        if (loanRepository.existsByBookIdAndUserIdAndStatus(book.getId(), borrower.getId(), LoanStatus.ACTIVO)) {
            throw new BusinessException("El usuario ya tiene un préstamo activo de este libro");
        }
        if (!request.dueDate().isAfter(LocalDate.now())) throw new BusinessException("La fecha límite debe ser futura");

        Loan loan = new Loan();
        loan.setUser(borrower);
        loan.setBook(book);
        loan.setLoanDate(LocalDate.now());
        loan.setDueDate(request.dueDate());
        loan.setStatus(LoanStatus.ACTIVO);

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);
        return loanRepository.save(loan);
    }

    @Transactional
    public Loan returnBook(Long id, Authentication auth) {
        Loan loan = findById(id);
        assertCanManage(loan, auth);
        if (loan.getStatus() == LoanStatus.DEVUELTO) throw new BusinessException("El préstamo ya fue devuelto");

        loan.setStatus(LoanStatus.DEVUELTO);
        loan.setReturnDate(LocalDate.now());
        Book book = loan.getBook();
        book.setAvailableCopies(Math.min(book.getAvailableCopies() + 1, book.getTotalCopies()));
        bookRepository.save(book);
        return loanRepository.save(loan);
    }

    @Transactional
    public void delete(Long id, Authentication auth) {
        Loan loan = findById(id);
        User current = currentUser(auth);
        if (current.getRole() != Role.ADMIN) throw new BusinessException("Solo el administrador puede eliminar préstamos");
        if (loan.getStatus() != LoanStatus.DEVUELTO) throw new BusinessException("Solo se pueden eliminar préstamos ya devueltos");
        loanRepository.delete(loan);
    }

    public Loan findById(Long id) {
        return loanRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Préstamo no encontrado"));
    }

    private void assertCanManage(Loan loan, Authentication auth) {
        User current = currentUser(auth);
        if (current.getRole() != Role.ADMIN && !loan.getUser().getId().equals(current.getId())) {
            throw new BusinessException("No puede modificar préstamos de otro usuario");
        }
    }

    private User currentUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));
    }

    private void updateExpired() {
        for (Loan loan : loanRepository.findAll()) {
            if (loan.getStatus() == LoanStatus.ACTIVO && loan.getDueDate().isBefore(LocalDate.now())) {
                loan.setStatus(LoanStatus.VENCIDO);
                loanRepository.save(loan);
            }
        }
    }
}
