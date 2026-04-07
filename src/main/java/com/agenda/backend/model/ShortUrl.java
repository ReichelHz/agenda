package com.agenda.backend.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.URL;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "short_urls")
@Getter
@Setter
@NoArgsConstructor
public class ShortUrl {

    @Id
    private String id;

    @NotBlank
    @URL
    private String originalUrl;

    @Indexed(unique = true)
    private String shortCode;

    @NotBlank
    private String userId;

    private int clickCount = 0;

    private LocalDateTime createdAt;
}
