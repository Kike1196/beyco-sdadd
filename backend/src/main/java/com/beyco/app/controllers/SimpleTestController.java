package com.beyco.app.controllers;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simple")
public class SimpleTestController {

    public SimpleTestController() {
        System.out.println("🎯 SimpleTestController INICIALIZADO!");
    }

    @GetMapping("/test")
    public String test() {
        System.out.println("✅ SimpleTestController: Petición recibida!");
        return "🎯 SimpleTestController está funcionando!";
    }
}