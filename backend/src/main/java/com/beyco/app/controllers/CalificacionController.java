package com.beyco.app.controllers;

import com.beyco.app.models.CalificacionRequest;
import com.beyco.app.services.CalificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calificaciones")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.0.55:3000"})
public class CalificacionController {

    @Autowired
    private CalificacionService calificacionService;

    @PostMapping("/guardar")
    public ResponseEntity<String> guardarCalificacion(@RequestBody CalificacionRequest request) {
        try {
            System.out.println("📝 Guardando calificación para alumno: " + request.getAlumnoCurp());
            System.out.println("📊 Datos calificación: " + request.toString());
            
            boolean exito = calificacionService.guardarCalificacion(
                request.getAlumnoCurp(),
                request.getCursoId(),
                request.getEvaluacionInicial(),
                request.getEvaluacionFinal(),
                request.getExamenPractico(),
                request.getPromedio(),
                request.getResultado(),
                request.getObservaciones()
            );
            
            if (exito) {
                System.out.println("✅ Calificación guardada correctamente");
                return ResponseEntity.ok("Calificación guardada correctamente");
            } else {
                System.out.println("❌ Error al guardar calificación");
                return ResponseEntity.badRequest().body("Error al guardar calificación");
            }
        } catch (Exception e) {
            System.err.println("❌ Error guardando calificación: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/curso/{cursoId}/alumno/{alumnoCurp}")
    public ResponseEntity<CalificacionRequest> obtenerCalificacion(
            @PathVariable int cursoId,
            @PathVariable String alumnoCurp) {
        try {
            System.out.println("🔍 Obteniendo calificación para alumno: " + alumnoCurp + ", curso: " + cursoId);
            
            CalificacionRequest calificacion = calificacionService.obtenerCalificacion(alumnoCurp, cursoId);
            
            if (calificacion != null) {
                System.out.println("✅ Calificación encontrada");
                return ResponseEntity.ok(calificacion);
            } else {
                System.out.println("ℹ️ No se encontró calificación");
                return ResponseEntity.ok(null); // Retornar null en lugar de 404
            }
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo calificación: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(null); // Retornar null en caso de error
        }
    }
}