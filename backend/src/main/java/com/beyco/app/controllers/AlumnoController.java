package com.beyco.app.controllers;

import com.beyco.app.models.Alumno;
import com.beyco.app.services.AlumnoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/alumnos")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.0.55:3000"})
public class AlumnoController {

    @Autowired
    private AlumnoService alumnoService;

    /**
     * Endpoint para listar todos los alumnos activos
     */
    @GetMapping
    public Map<String, Object> listarAlumnos() {
        List<Alumno> alumnos = alumnoService.listarTodosLosAlumnos();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("alumnos", alumnos);
        response.put("total", alumnos.size());
        return response;
    }

    /**
     * Buscar alumnos por apellidos o CURP (como el buscador del frontend)
     */
    @GetMapping("/buscar")
    public Map<String, Object> buscarAlumnos(
            @RequestParam(required = false) String apellido,
            @RequestParam(required = false) String curp) {

        System.out.println("🔍 Buscando alumnos: apellido=" + apellido + ", curp=" + curp);
        Map<String, Object> response = new HashMap<>();

        try {
            List<Alumno> alumnos = new ArrayList<>();

            if (curp != null && !curp.isBlank()) {
                Alumno alumno = alumnoService.buscarAlumnoPorCurp(curp);
                if (alumno != null) {
                    alumnos.add(alumno);
                }
            } else if (apellido != null && !apellido.isBlank()) {
                alumnos = alumnoService.buscarAlumnosPorApellidos(apellido);
            } else {
                alumnos = alumnoService.listarTodosLosAlumnos();
            }

            response.put("success", true);
            response.put("alumnos", alumnos);
            response.put("total", alumnos.size());
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    /**
     * Obtener alumnos por curso
     */
    @GetMapping("/curso/{idCurso}")
    public Map<String, Object> obtenerAlumnosPorCurso(@PathVariable int idCurso) {
        System.out.println("📋 Solicitando alumnos del curso ID: " + idCurso);
        Map<String, Object> response = new HashMap<>();

        try {
            List<Alumno> alumnos = alumnoService.buscarAlumnosPorCurso(idCurso);
            response.put("success", true);
            response.put("cursoId", idCurso);
            response.put("alumnos", alumnos);
            response.put("total", alumnos.size());
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    /**
     * Crear nuevo alumno
     */
    @PostMapping
    public Map<String, Object> crearAlumno(@RequestBody Alumno alumno) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean creado = alumnoService.crearAlumno(alumno);
            response.put("success", creado);
            response.put("message", creado ? "Alumno creado correctamente" : "No se pudo crear el alumno");
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * Actualizar alumno existente
     */
    @PutMapping("/{curp}")
    public Map<String, Object> actualizarAlumno(@PathVariable String curp, @RequestBody Alumno alumno) {
        Map<String, Object> response = new HashMap<>();
        try {
            alumno.setCurp(curp);
            boolean actualizado = alumnoService.actualizarAlumno(alumno);
            response.put("success", actualizado);
            response.put("message", actualizado ? "Alumno actualizado correctamente" : "No se encontró el alumno");
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * Desactivar alumno (baja lógica)
     */
    @DeleteMapping("/{curp}")
    public Map<String, Object> desactivarAlumno(@PathVariable String curp) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean eliminado = alumnoService.desactivarAlumno(curp);
            response.put("success", eliminado);
            response.put("message", eliminado ? "Alumno desactivado correctamente" : "No se encontró el alumno");
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /**
     * Eliminar alumno permanentemente (junto con sus inscripciones)
     */
    @DeleteMapping("/eliminar/{curp}")
    public Map<String, Object> eliminarDefinitivo(@PathVariable String curp) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean eliminado = alumnoService.eliminarAlumnoDefinitivamente(curp);
            response.put("success", eliminado);
            response.put("message", eliminado ? "Alumno eliminado definitivamente" : "No se pudo eliminar");
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }
}
