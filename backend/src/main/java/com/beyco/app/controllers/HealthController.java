package com.beyco.app.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        System.out.println("✅ Health check ejecutado");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Backend funcionando correctamente");
        response.put("timestamp", System.currentTimeMillis());
        response.put("service", "BEYCO API");
        return response;
    }

    @GetMapping("/test")
    public Map<String, Object> test() {
        System.out.println("✅ Test endpoint ejecutado");
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Conexión exitosa con el backend");
        response.put("backend", "Spring Boot 3.2.0");
        response.put("java", System.getProperty("java.version"));
        return response;
    }
}