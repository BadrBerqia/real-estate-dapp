package com.realestate.payment.service;

import com.realestate.payment.model.Payment;
import com.realestate.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;

    public Payment processPayment(Payment payment) {
        payment.setTimestamp(LocalDateTime.now());
        // Logic to verify payment with blockchain service could go here
        // For now, we assume it's valid or being created as PENDING
        if (payment.getStatus() == null) {
            payment.setStatus(Payment.PaymentStatus.PENDING);
        }
        return paymentRepository.save(payment);
    }

    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    public List<Payment> getPaymentsByRental(Long rentalId) {
        return paymentRepository.findByRentalId(rentalId);
    }
}
