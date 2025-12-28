package com.realestate.rental.repository;

import com.realestate.rental.model.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByRenterAddress(String renterAddress);

    List<Rental> findByPropertyId(Long propertyId);
}
