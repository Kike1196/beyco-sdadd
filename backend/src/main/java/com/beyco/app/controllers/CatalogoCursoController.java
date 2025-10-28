// src/main/java/com/beyco/app/controllers/CatalogoCursoController.java
package com.beyco.app.controllers;

import com.beyco.app.models.CatalogoCurso;
import com.beyco.app.services.CatalogoCursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo_cursos")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://192.168.0.55:3000",
    "http://10.0.43.69:3000",
    "http://10.0.47.108:3000",
    "http://10.0.45.30:3000",
    "http://10.0.43.190:3000"
})
public class CatalogoCursoController {

    @Autowired
    private CatalogoCursoService catalogoCursoService;

    @GetMapping
    public List<CatalogoCurso> getAll() {
        return catalogoCursoService.listarTodosActivos();
    }

    @PostMapping
    public ResponseEntity<String> crear(@RequestBody CatalogoCurso curso) {
        boolean exito = catalogoCursoService.crearCurso(curso);
        return exito ? 
            ResponseEntity.ok("Curso creado en el catálogo") : 
            ResponseEntity.badRequest().body("No se pudo crear el curso");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> actualizar(@PathVariable int id, @RequestBody CatalogoCurso curso) {
        curso.setId(id);
        boolean exito = catalogoCursoService.actualizarCurso(curso);
        return exito ? 
            ResponseEntity.ok("Curso actualizado") : 
            ResponseEntity.badRequest().body("No se pudo actualizar el curso");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminar(@PathVariable int id) {
        boolean exito = catalogoCursoService.eliminarCurso(id);
        return exito ? 
            ResponseEntity.noContent().build() : 
            ResponseEntity.notFound().build();
    }
}