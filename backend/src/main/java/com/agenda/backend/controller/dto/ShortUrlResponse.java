package com.agenda.backend.controller.dto;

import com.agenda.backend.model.ShortUrl;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ShortUrlResponse {

    private Long id;
    private String originalUrl;
    private String shortCode;
    private String shortUrl;
    private int clickCount;
    private LocalDateTime createdAt;

    public static ShortUrlResponse from(ShortUrl shortUrl) {
        ShortUrlResponse response = new ShortUrlResponse();
        response.setId(shortUrl.getId());
        response.setOriginalUrl(shortUrl.getOriginalUrl());
        response.setShortCode(shortUrl.getShortCode());

        response.setShortUrl("/r/" + shortUrl.getShortCode());

        response.setClickCount(shortUrl.getClickCount());
        response.setCreatedAt(shortUrl.getCreatedAt());

        return response;
    }
}