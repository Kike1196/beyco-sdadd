package com.beyco.app.controllers;

import com.beyco.app.models.Curso;
import com.beyco.app.services.CursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cursos")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.0.55:3000", "http://172.19.128.1:3000", "http://10.0.43.165:3000", "http://10.0.46.106:3000",
                        "http://10.0.47.154:3000", "http://10.0.43.69:3000", "http://10.0.47.108:3000", "http://10.0.45.30:3000", "http://10.0.43.190:3000"})
public class CursoInstructorController {

    @Autowired
    private CursoService cursoService;

    /**
     * Endpoint para OBTENER la lista de todos los cursos asignados.
     * Se accede vía GET a /api/cursos
     */
    @GetMapping
    public List<Curso> getAllCursos() {
        return cursoService.listarTodosLosCursos();
    }
    /**
     * Endpoint para OBTENER los cursos asignados a un instructor específico.
     * Se accede vía GET a /api/cursos/instructor/{instructorId}
     */
    @GetMapping("/instructor/{instructorId}")
    public List<Curso> getCursosByInstructor(@PathVariable int instructorId) {
        return cursoService.listarTodosLosCursos()
                .stream()
                .filter(c -> c.getInstructorId() == instructorId)
                .collect(Collectors.toList());
    }

    /**
     * Endpoint para CREAR una nueva asignación de curso.
     * Se accede vía POST a /api/cursos
     */
    @PostMapping
    public ResponseEntity<Curso> createCurso(@RequestBody Curso curso) {
        boolean exito = cursoService.crearCurso(curso);
        if (exito) {
            // En una app real, buscaríamos el curso recién creado para devolverlo con su ID
            return new ResponseEntity<>(curso, HttpStatus.CREATED);
        }
        return ResponseEntity.badRequest().build();
    }

    /**
     * Endpoint para ACTUALIZAR una asignación de curso existente.
     * Se accede vía PUT a /api/cursos/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Curso> updateCurso(@PathVariable int id, @RequestBody Curso curso) {
        curso.setId(id); // Asegura que el ID sea el correcto
        boolean exito = cursoService.actualizarCurso(curso);
        if (exito) {
            return ResponseEntity.ok(curso);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Endpoint para ELIMINAR una asignación de curso.
     * Se accede vía DELETE a /api/cursos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCurso(@PathVariable int id) {
        boolean exito = cursoService.eliminarCurso(id);
        if (exito) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    
}

