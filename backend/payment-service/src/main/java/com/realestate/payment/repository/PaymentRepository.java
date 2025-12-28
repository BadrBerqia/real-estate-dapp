package com.realestate.payment.repository;

import com.realestate.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByRentalId(Long rentalId);

    List<Payment> findByPayerAddress(String payerAddress);
}
