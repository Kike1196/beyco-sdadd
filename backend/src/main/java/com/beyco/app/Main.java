package com.beyco.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.beyco.app")
public class Main {
    public static void main(String[] args) {
        System.out.println("🚀 Iniciando aplicación BEYCO...");
        ApplicationContext ctx = SpringApplication.run(Main.class, args);
        
        System.out.println("=== CONTROLADORES REGISTRADOS ===");
        String[] beanNames = ctx.getBeanDefinitionNames();
        for (String beanName : beanNames) {
            if (beanName.toLowerCase().contains("controller")) {
                System.out.println("✅ Controlador: " + beanName + " - " + ctx.getBean(beanName).getClass().getName());
            }
        }
        System.out.println("=== FIN DE CONTROLADORES ===");
    }
}