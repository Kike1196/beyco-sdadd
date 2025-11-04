// controllers/FileUploadController.java
package com.beyco.app.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://192.168.0.55:3000",
    "http://10.0.43.69:3000", 
    "http://10.0.47.108:3000",
    "http://10.0.45.30:3000",
    "http://10.0.43.190:3000"
})
public class FileUploadController {

    @Value("${file.upload-dir:uploads/logos}")
    private String uploadDir;

    // Subir logo de empresa
    @PostMapping("/logo")
    public ResponseEntity<?> uploadLogo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("empresaId") int empresaId,
            @RequestParam("empresaNombre") String empresaNombre) {
        
        try {
            System.out.println("📤 Subiendo logo para empresa: " + empresaNombre + " (ID: " + empresaId + ")");
            
            // Validar archivo
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"El archivo está vacío\"}");
            }
            
            // Validar tipo de archivo
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("{\"error\": \"Solo se permiten archivos de imagen\"}");
            }
            
            // Crear directorio si no existe
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generar nombre único para el archivo
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            String fileName = "logo_" + empresaId + "_" + UUID.randomUUID() + fileExtension;
            Path filePath = uploadPath.resolve(fileName);
            
            // Guardar archivo
            Files.copy(file.getInputStream(), filePath);
            
            // Devolver información del archivo guardado
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Logo subido correctamente");
            response.put("fileName", fileName);
            response.put("filePath", filePath.toString());
            response.put("fileSize", file.getSize());
            response.put("contentType", contentType);
            
            System.out.println("✅ Logo guardado: " + fileName);
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            System.err.println("❌ Error al subir logo: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al subir el archivo: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Obtener información de un logo
    @GetMapping("/logo/{fileName}")
    public ResponseEntity<?> getLogoInfo(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir, fileName);
            
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> fileInfo = new HashMap<>();
            fileInfo.put("fileName", fileName);
            fileInfo.put("fileSize", Files.size(filePath));
            fileInfo.put("lastModified", Files.getLastModifiedTime(filePath).toString());
            
            return ResponseEntity.ok(fileInfo);
            
        } catch (IOException e) {
            System.err.println("❌ Error al obtener información del logo: " + e.getMessage());
            return ResponseEntity.status(500).body("{\"error\": \"Error al obtener información del archivo\"}");
        }
    }
}