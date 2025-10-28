package com.beyco.app.controllers;

import com.beyco.app.models.Curso;
import com.beyco.app.services.CursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instructores") 
@CrossOrigin(origins = {"http://localhost:3000", "http://172.19.128.1:3000",
                        "http://10.0.43.190:3000"}) 
public class CursoController {

    @Autowired
    private CursoService cursoService;

    // Se ha eliminado la inyección de CatalogoCursoService porque no se usa para las operaciones principales de este controlador.

    // --- CAMBIO #1: La ruta ahora es solo @GetMapping ---
    // La URL para obtener los cursos será http://localhost:8080/api/cursos
    @GetMapping
    // --- CAMBIO #2: El método ahora devuelve List<Curso> ---
    // Esto coincide con los datos que tu frontend espera para la tabla.
    public List<Curso> getAllCursos() {
        // --- CAMBIO #3: Se usa el servicio correcto ---
        // Llamamos a cursoService para obtener los cursos asignados.
        // Asegúrate de que tu `CursoService` tenga un método que devuelva la lista de cursos.
        // Por ejemplo: `listarCursos()` o `findAll()`.
        return cursoService.listarTodosLosCursos();
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
                // Se devuelve un cuerpo en el 204 para mayor claridad, aunque no es estándar.
                // Podrías usar return ResponseEntity.noContent().build(); también.
                return ResponseEntity.ok("Curso eliminado exitosamente");
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
