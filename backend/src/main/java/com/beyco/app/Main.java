package com.beyco.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Main {

    public static void main(String[] args) {
        // Esta DEBE ser la ÚNICA línea en tu método main.
        // Inicia todo el framework de Spring Boot.
        SpringApplication.run(Main.class, args);
    }

}