package com.budgetbuddy.project.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StorageService {

  @Value("${app.upload.dir}")
  private String uploadDir;

  public String save(MultipartFile file) {
    try {
      String extension = Objects.requireNonNull(file.getOriginalFilename())
          .substring(file.getOriginalFilename().lastIndexOf('.'));

      String filename = UUID.randomUUID() + extension;

      Path path = Paths.get(uploadDir).resolve(filename);
      Files.copy(file.getInputStream(), path);

      return filename;
    } catch (IOException e) {
      throw new RuntimeException("Could not save file", e);
    }
  }
}
