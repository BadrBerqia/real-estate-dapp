package com.realestate.user.service;

import com.realestate.user.model.User;
import com.realestate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User registerUser(User user) {
        return userRepository.findByWalletAddress(user.getWalletAddress())
                .orElseGet(() -> userRepository.save(user));
    }

    public Optional<User> getUserByWallet(String walletAddress) {
        return userRepository.findByWalletAddress(walletAddress);
    }

    public User updateUser(User user) {
        return userRepository.save(user); // Simple update
    }
}
