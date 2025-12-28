package com.realestate.payment.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long rentalId;
    private String payerAddress;
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private Currency currency; // USD, ETH

    @Enumerated(EnumType.STRING)
    private PaymentStatus status; // PENDING, COMPLETED, FAILED

    private String transactionHash;
    private LocalDateTime timestamp;

    public enum Currency {
        USD, ETH
    }

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED
    }
}
