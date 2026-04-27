package com.agenda.backend.controller;

import com.agenda.backend.controller.dto.ChangePasswordRequest;
import com.agenda.backend.controller.dto.UserResponse;
import com.agenda.backend.exception.AuthenticationFailedException;
import com.agenda.backend.model.User;
import com.agenda.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationFailedException();
        }

        User user = userService.getByEmail(authentication.getName())
                .orElseThrow(AuthenticationFailedException::new);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationFailedException();
        }
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }
}
