package com.agenda.backend.controller.dto;

import com.agenda.backend.model.ShortUrl;

import java.time.LocalDateTime;

public class ShortUrlResponse {

    private String id;
    private String originalUrl;
    private String shortCode;
    private int clickCount;
    private LocalDateTime createdAt;

    public static ShortUrlResponse from(ShortUrl shortUrl) {
        ShortUrlResponse response = new ShortUrlResponse();
        response.setId(shortUrl.getId());
        response.setOriginalUrl(shortUrl.getOriginalUrl());
        response.setShortCode(shortUrl.getShortCode());
        response.setClickCount(shortUrl.getClickCount());
        response.setCreatedAt(shortUrl.getCreatedAt());
        return response;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOriginalUrl() {
        return originalUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public String getShortCode() {
        return shortCode;
    }

    public void setShortCode(String shortCode) {
        this.shortCode = shortCode;
    }

    public int getClickCount() {
        return clickCount;
    }

    public void setClickCount(int clickCount) {
        this.clickCount = clickCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
