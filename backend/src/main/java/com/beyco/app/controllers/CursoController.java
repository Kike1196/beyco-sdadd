package com.beyco.app.controllers;

import com.beyco.app.models.CatalogoCurso;
import com.beyco.app.models.Curso;
import com.beyco.app.services.CursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
@CrossOrigin(origins = "http://localhost:3000")
public class CursoController {

    @Autowired
    private CursoService cursoService;

    @Autowired
    private com.beyco.app.services.CatalogoCursoService catalogoCursoService;

    @GetMapping("/cursos")
    public List<CatalogoCurso> getAllCursos() {
        // Cambia a esto cuando la BD esté lista:
        return catalogoCursoService.listarTodosLosCursos();
        // return catalogoCursoService.obtenerCursosEjemplo();
    }
    @PostMapping
    public ResponseEntity<String> createCurso(@RequestBody Curso curso) {
        try {
            System.out.println("Recibiendo curso para crear: " + curso.getNombre());
            boolean exito = cursoService.crearCurso(curso);
            if (exito) {
                return ResponseEntity.status(HttpStatus.CREATED).body("Curso creado exitosamente");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No se pudo crear el curso");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno del servidor: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateCurso(@PathVariable int id, @RequestBody Curso curso) {
        try {
            System.out.println("Actualizando curso ID: " + id);
            curso.setId(id);
            boolean exito = cursoService.actualizarCurso(curso);
            if (exito) {
                return ResponseEntity.ok("Curso actualizado exitosamente");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Curso no encontrado");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno del servidor: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCurso(@PathVariable int id) {
        try {
            System.out.println("Eliminando curso ID: " + id);
            boolean exito = cursoService.eliminarCurso(id);
            if (exito) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Curso no encontrado");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno del servidor: " + e.getMessage());
        }
    }
}