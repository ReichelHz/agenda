package com.agenda.backend.service;

import com.agenda.backend.controller.dto.CreateShortUrlRequest;
import com.agenda.backend.exception.ResourceNotFoundException;
import com.agenda.backend.model.ShortUrl;
import com.agenda.backend.repository.ShortUrlRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class UrlService {

    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int CODE_LENGTH = 7;
    private static final int MAX_RETRIES = 10;

    private final ShortUrlRepository shortUrlRepository;
    private final Random random = new Random();

    public UrlService(ShortUrlRepository shortUrlRepository) {
        this.shortUrlRepository = shortUrlRepository;
    }

    public ShortUrl createShortUrl(CreateShortUrlRequest request, String userId) {
        ShortUrl shortUrl = new ShortUrl();
        shortUrl.setOriginalUrl(request.getOriginalUrl().trim());
        shortUrl.setUserId(userId);
        shortUrl.setShortCode(generateUniqueShortCode());
        shortUrl.setClickCount(0);
        shortUrl.setCreatedAt(LocalDateTime.now());

        return shortUrlRepository.save(shortUrl);
    }

    public List<ShortUrl> listByUserId(String userId) {
        return shortUrlRepository.findAllByUserId(userId);
    }

    public ShortUrl resolveAndCountClick(String shortCode) {
        ShortUrl shortUrl = shortUrlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException("Short URL not found"));

        shortUrl.setClickCount(shortUrl.getClickCount() + 1);
        return shortUrlRepository.save(shortUrl);
    }

    public String generateUniqueShortCode() {
        for (int i = 0; i < MAX_RETRIES; i++) {
            String candidate = randomCode(CODE_LENGTH);
            if (!shortUrlRepository.existsByShortCode(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Failed to generate unique short code");
    }

    private String randomCode(int length) {
        StringBuilder builder = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(CODE_CHARS.length());
            builder.append(CODE_CHARS.charAt(index));
        }
        return builder.toString();
    }
}
