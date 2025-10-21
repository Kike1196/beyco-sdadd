package com.beyco.app.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    // Datos mock para empezar rápido
    @GetMapping("/instructor/{id}")
    public Map<String, Object> getDashboard(@PathVariable int id) {
        Map<String, Object> dashboard = new HashMap<>();
        
        // Estadísticas
        Map<String, Integer> stats = new HashMap<>();
        stats.put("cursosActivos", 3);
        stats.put("totalEstudiantes", 45);
        stats.put("cursosCompletados", 12);
        stats.put("proximaSesion", 1);
        
        // Cursos recientes
        List<Map<String, Object>> cursos = Arrays.asList(
            crearCurso(1, "Spring Boot Avanzado", "2025-10-25", "Activo", 15, 75.5),
            crearCurso(2, "Microservicios", "2025-10-20", "Activo", 12, 60.0),
            crearCurso(3, "AWS Fundamentals", "2025-11-01", "Programado", 0, 0.0)
        );
        
        // Anuncios
        List<Map<String, Object>> anuncios = Arrays.asList(
            crearAnuncio(1, "Recordatorio importante", "Revisar material para próxima sesión", true),
            crearAnuncio(2, "Nuevos recursos", "Se agregaron ejercicios prácticos", false)
        );
        
        dashboard.put("estadisticas", stats);
        dashboard.put("cursos", cursos);
        dashboard.put("anuncios", anuncios);
        dashboard.put("instructor", crearInstructor(id));
        
        return dashboard;
    }
    
    private Map<String, Object> crearCurso(int id, String titulo, String fecha, String estado, int estudiantes, double progreso) {
        Map<String, Object> curso = new HashMap<>();
        curso.put("id", id);
        curso.put("titulo", titulo);
        curso.put("fechaInicio", fecha);
        curso.put("estado", estado);
        curso.put("totalEstudiantes", estudiantes);
        curso.put("progreso", progreso);
        return curso;
    }
    
    private Map<String, Object> crearAnuncio(int id, String titulo, String contenido, boolean importante) {
        Map<String, Object> anuncio = new HashMap<>();
        anuncio.put("id", id);
        anuncio.put("titulo", titulo);
        anuncio.put("contenido", contenido);
        anuncio.put("importante", importante);
        anuncio.put("fecha", "2025-10-18 10:30:00");
        return anuncio;
    }
    
    private Map<String, Object> crearInstructor(int id) {
        Map<String, Object> instructor = new HashMap<>();
        instructor.put("id", id);
        instructor.put("nombre", "María González");
        instructor.put("especialidad", "Desarrollo Backend");
        instructor.put("email", "maria.gonzalez@beyco.com");
        instructor.put("telefono", "+52 55 1234 5678");
        return instructor;
    }
}