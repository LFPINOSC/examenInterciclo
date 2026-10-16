package com.examen.biblioteca.repository;

import com.examen.biblioteca.model.Loan;
import com.examen.biblioteca.model.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findAllByOrderByLoanDateDescIdDesc();
    List<Loan> findByUserIdOrderByLoanDateDescIdDesc(Long userId);
    boolean existsByBookIdAndUserIdAndStatusIn(Long bookId, Long userId, Collection<LoanStatus> statuses);
}
