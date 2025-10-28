package com.beyco.app.controllers;

import com.beyco.app.models.Curso;
import com.beyco.app.services.CursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.0.55:3000", 
                       "http://10.0.46.106:3000", "http://10.0.47.108:3000", 
                       "http://10.0.45.30:3000", "http://10.0.43.190:3000"})
public class HistorialController {
    
    @Autowired
    private CursoService cursoService;

    // Endpoint de prueba para verificar conexión
    @GetMapping("/test")
    public ResponseEntity<String> testConnection() {
        return ResponseEntity.ok("Backend conectado correctamente - Historial de Cursos");
    }

    // Obtener todos los cursos para el historial
    @GetMapping("/cursos")
    public ResponseEntity<List<Curso>> getAllCursosHistorial() {
        try {
            List<Curso> cursos = cursoService.listarTodosLosCursos();
            return ResponseEntity.ok(cursos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener cursos por año
    @GetMapping("/cursos/anio/{anio}")
    public ResponseEntity<List<Curso>> getCursosPorAnio(@PathVariable int anio) {
        try {
            List<Curso> cursos = cursoService.listarCursosPorAnio(anio);
            return ResponseEntity.ok(cursos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener cursos por estado
    @GetMapping("/cursos/estado/{estado}")
    public ResponseEntity<List<Curso>> getCursosPorEstado(@PathVariable String estado) {
        try {
            List<Curso> cursos = cursoService.listarCursosPorEstado(estado);
            return ResponseEntity.ok(cursos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}