package com.beyco.app.controllers;

import com.beyco.app.models.CatalogoCurso;
import com.beyco.app.services.CatalogoCursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo")  // ← CAMBIADO
@CrossOrigin(origins = "http://localhost:3000")
public class CatalogoCursoController {

    @Autowired
    private CatalogoCursoService catalogoCursoService;

    @GetMapping("/cursos")  // ← CAMBIADO
    public List<CatalogoCurso> getAllCursos() {
        // En desarrollo, usar datos de ejemplo
        return catalogoCursoService.obtenerCursosEjemplo();
        // En producción: return catalogoCursoService.listarTodosLosCursos();
    }

    @GetMapping("/cursos/buscar")  // ← CAMBIADO
    public List<CatalogoCurso> buscarCursos(@RequestParam String busqueda) {
        if (busqueda == null || busqueda.trim().isEmpty()) {
            return catalogoCursoService.obtenerCursosEjemplo();
        }
        return catalogoCursoService.buscarCursos(busqueda);
    }

    @PostMapping("/cursos")  // ← CAMBIADO
    public ResponseEntity<String> createCurso(@RequestBody CatalogoCurso curso) {
        try {
            System.out.println("Recibiendo curso para crear: " + curso.getNombre());
            boolean exito = catalogoCursoService.crearCurso(curso);
            if (exito) {
                return ResponseEntity.status(HttpStatus.CREATED).body("Curso agregado al catálogo exitosamente");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No se pudo agregar el curso al catálogo");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno del servidor: " + e.getMessage());
        }
    }

    @PutMapping("/cursos/{id}")
    public ResponseEntity<String> updateCurso(@PathVariable int id, @RequestBody CatalogoCurso curso) {
        try {
            System.out.println("🔄 Actualizando curso ID: " + id);
            curso.setId(id);
            
            // Obtener curso actual para comparar
            CatalogoCurso cursoActual = catalogoCursoService.obtenerCursoPorId(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
            
            boolean claveSTPSCambio = !cursoActual.getStps().equals(curso.getStps());
            
            boolean exito;
            if (claveSTPSCambio) {
                exito = catalogoCursoService.actualizarCurso(curso);
            } else {
                exito = catalogoCursoService.actualizarCursoSinClaveSTPS(curso);
            }
            
            if (exito) {
                return ResponseEntity.ok("Curso actualizado en el catálogo exitosamente");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Curso no encontrado en el catálogo");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno del servidor: " + e.getMessage());
        }
    }

    @DeleteMapping("/cursos/{id}")  // ← CAMBIADO
    public ResponseEntity<String> deleteCurso(@PathVariable int id) {
        try {
            System.out.println("Eliminando curso ID: " + id);
            boolean exito = catalogoCursoService.eliminarCurso(id);
            if (exito) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Curso no encontrado en el catálogo");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno del servidor: " + e.getMessage());
        }
    }

    
}