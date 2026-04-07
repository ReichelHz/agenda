package com.agenda.backend.repository;

import com.agenda.backend.model.ShortUrl;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShortUrlRepository extends MongoRepository<ShortUrl, String> {
    Optional<ShortUrl> findByShortCode(String shortCode);

    List<ShortUrl> findAllByUserId(String userId);

    boolean existsByShortCode(String shortCode);
}
