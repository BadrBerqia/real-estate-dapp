package com.realestate.rental.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "rentals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rental {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long propertyId;
    private String renterAddress;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPrice;

    @Column(nullable = false)
    private String status; // PENDING, ACTION_REQUIRED, ACTIVE, COMPLETED, CANCELLED

    private String transactionHash;
}
