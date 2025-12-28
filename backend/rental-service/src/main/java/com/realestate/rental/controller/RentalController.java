package com.realestate.rental.controller;

import com.realestate.rental.model.Rental;
import com.realestate.rental.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {
    private final RentalRepository rentalRepository;

    @PostMapping
    public Rental createRental(@RequestBody Rental rental) {
        return rentalRepository.save(rental);
    }

    @GetMapping("/my-rentals")
    public List<Rental> getMyRentals(@RequestParam String address) {
        return rentalRepository.findByRenterAddress(address);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Rental> updateStatus(@PathVariable Long id, @RequestParam String status,
            @RequestParam(required = false) String txHash) {
        return rentalRepository.findById(id).map(rental -> {
            rental.setStatus(status);
            if (txHash != null)
                rental.setTransactionHash(txHash);
            return ResponseEntity.ok(rentalRepository.save(rental));
        }).orElse(ResponseEntity.notFound().build());
    }
}
