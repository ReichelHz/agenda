package com.agenda.backend.controller;

import com.agenda.backend.controller.dto.LoginRequest;
import com.agenda.backend.controller.dto.RegisterUserRequest;
import com.agenda.backend.controller.dto.UserResponse;
import com.agenda.backend.model.User;
import com.agenda.backend.service.JwtService;
import com.agenda.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping({"/api/users", "/api/auth"})
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        User created = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(created));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.login(request);
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable String id) {
        User user = userService.getById(id);
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
