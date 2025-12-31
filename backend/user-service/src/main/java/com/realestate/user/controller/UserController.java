package com.realestate.user.controller;

import com.realestate.user.model.User;
import com.realestate.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(userService.registerUser(user));
    }

    @GetMapping("/{walletAddress}")
    public ResponseEntity<User> getUser(@PathVariable String walletAddress) {
        return userService.getUserByWallet(walletAddress)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{walletAddress}")
    public ResponseEntity<User> updateUser(@PathVariable String walletAddress, @RequestBody User user) {
        return userService.getUserByWallet(walletAddress)
                .map(existingUser -> {
                    existingUser.setUsername(user.getUsername());
                    existingUser.setEmail(user.getEmail());
                    existingUser.setPhone(user.getPhone());
                    if (user.getRole() != null) {
                        existingUser.setRole(user.getRole());
                    }
                    return ResponseEntity.ok(userService.updateUser(existingUser));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}