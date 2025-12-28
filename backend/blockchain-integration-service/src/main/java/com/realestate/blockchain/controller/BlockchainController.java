package com.realestate.blockchain.controller;

import com.realestate.blockchain.service.BlockchainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/blockchain")
@RequiredArgsConstructor
public class BlockchainController {

    private final BlockchainService blockchainService;

    @GetMapping("/block-number")
    public ResponseEntity<Long> getBlockNumber() {
        try {
            return ResponseEntity.ok(blockchainService.getBlockNumber());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/balance/{address}")
    public ResponseEntity<BigDecimal> getBalance(@PathVariable String address) {
        try {
            return ResponseEntity.ok(blockchainService.getAddressBalance(address));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
