package com.agenda.backend.controller;

import com.agenda.backend.controller.dto.CreateShortUrlRequest;
import com.agenda.backend.controller.dto.ShortUrlResponse;
import com.agenda.backend.exception.AuthenticationFailedException;
import com.agenda.backend.model.ShortUrl;
import com.agenda.backend.model.User;
import com.agenda.backend.service.UrlService;
import com.agenda.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
public class UrlController {

    private final UrlService urlService;
    private final UserService userService;

    public UrlController(UrlService urlService, UserService userService) {
        this.urlService = urlService;
        this.userService = userService;
    }

    @PostMapping("/api/urls")
    public ResponseEntity<Map<String, Object>> createShortUrl(
            @Valid @RequestBody CreateShortUrlRequest request,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);
        ShortUrl created = urlService.createShortUrl(request, user.getId());

        Map<String, Object> body = Map.of(
                "id", created.getId(),
                "shortCode", created.getShortCode(),
                "shortUrl", "/" + created.getShortCode(),
                "originalUrl", created.getOriginalUrl(),
                "clickCount", created.getClickCount(),
                "createdAt", created.getCreatedAt()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/api/urls")
    public ResponseEntity<List<ShortUrlResponse>> listMyUrls(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<ShortUrlResponse> urls = urlService.listByUserId(user.getId())
                .stream()
                .map(ShortUrlResponse::from)
                .toList();

        return ResponseEntity.ok(urls);
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode) {
        ShortUrl shortUrl = urlService.resolveAndCountClick(shortCode);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(shortUrl.getOriginalUrl()))
                .build();
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationFailedException();
        }

        return userService.getByEmail(authentication.getName())
                .orElseThrow(AuthenticationFailedException::new);
    }
}
