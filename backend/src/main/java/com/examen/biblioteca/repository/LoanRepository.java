package com.examen.biblioteca.repository;

import com.examen.biblioteca.model.Loan;
import com.examen.biblioteca.model.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUserIdOrderByLoanDateDesc(Long userId);
    long countByStatus(LoanStatus status);
    boolean existsByBookIdAndUserIdAndStatus(Long bookId, Long userId, LoanStatus status);
}
