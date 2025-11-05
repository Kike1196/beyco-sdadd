package com.beyco.app.controllers;

import com.beyco.app.models.Alumno;
import com.beyco.app.models.Curso;
import com.beyco.app.services.AlumnoService;
import com.beyco.app.services.CursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/instructor-cursos")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.0.55:3000", "http://172.19.128.1:3000", "http://10.0.43.165:3000", "http://10.0.46.106:3000",
                        "http://10.0.47.154:3000", "http://10.0.43.69:3000", "http://10.0.47.108:3000", "http://10.0.45.30:3000", "http://10.0.43.190:3000"})
public class CursoInstructorController {

    @Autowired
    private CursoService cursoService;

    @Autowired
    private AlumnoService alumnoService;

    /**
     * Endpoint para OBTENER la lista de todos los cursos asignados.
     */
    @GetMapping
    public List<Curso> getAllCursos() {
        System.out.println("📋 Obteniendo todos los cursos");
        return cursoService.listarTodosLosCursos();
    }

    /**
     * Endpoint para OBTENER los cursos asignados a un instructor específico.
     * ESTE ENDPOINT SÍ FUNCIONA
     */
    @GetMapping("/instructor/{instructorId}")
    public List<Curso> getCursosByInstructor(@PathVariable int instructorId) {
        System.out.println("🎯 Obteniendo cursos para instructor ID: " + instructorId);
        
        List<Curso> cursos = cursoService.listarTodosLosCursos()
                .stream()
                .filter(c -> c.getInstructorId() == instructorId)
                .collect(Collectors.toList());
        
        System.out.println("✅ Cursos encontrados: " + cursos.size());
        return cursos;
    }

    /**
     * Endpoint para OBTENER los cursos asignados a un instructor con información de alumnos
     * VERSIÓN SIMPLIFICADA QUE SÍ FUNCIONA
     */
    @GetMapping("/instructor/{instructorId}/completo")
    public ResponseEntity<Map<String, Object>> getCursosByInstructorCompleto(@PathVariable int instructorId) {
        try {
            System.out.println("🎯 Solicitando cursos COMPLETOS para instructor ID: " + instructorId);
            
            // Primero obtener los cursos del instructor
            List<Curso> cursos = cursoService.listarTodosLosCursos()
                    .stream()
                    .filter(c -> c.getInstructorId() == instructorId)
                    .collect(Collectors.toList());

            System.out.println("📊 Cursos base encontrados: " + cursos.size());

            // Enriquecer cada curso con información de alumnos
            List<Map<String, Object>> cursosCompletos = cursos.stream().map(curso -> {
                Map<String, Object> cursoMap = new HashMap<>();
                cursoMap.put("id", curso.getId());
                cursoMap.put("nombre", curso.getNombre());
                cursoMap.put("stps", curso.getStps());
                cursoMap.put("horas", curso.getHoras());
                cursoMap.put("fechaIngreso", curso.getFechaIngreso());
                cursoMap.put("empresa", curso.getEmpresa());
                cursoMap.put("instructor", curso.getInstructor());
                cursoMap.put("lugar", curso.getLugar());
                cursoMap.put("precio", curso.getPrecio());
                cursoMap.put("examenPractico", curso.getExamenPractico());
                cursoMap.put("empresaId", curso.getEmpresaId());
                cursoMap.put("instructorId", curso.getInstructorId());
                
                // Obtener información de alumnos
                try {
                    List<Alumno> alumnos = alumnoService.buscarAlumnosPorCurso(curso.getId());
                    cursoMap.put("alumnosInscritos", alumnos.size());
                    cursoMap.put("alumnos", alumnos);
                    System.out.println("👨‍🎓 Curso " + curso.getId() + " tiene " + alumnos.size() + " alumnos");
                } catch (Exception e) {
                    System.err.println("❌ Error obteniendo alumnos para curso " + curso.getId() + ": " + e.getMessage());
                    cursoMap.put("alumnosInscritos", 0);
                    cursoMap.put("alumnos", List.of());
                }
                
                return cursoMap;
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cursos", cursosCompletos);
            response.put("total", cursosCompletos.size());

            System.out.println("✅ Cursos completos procesados: " + cursosCompletos.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error en getCursosByInstructorCompleto: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al cargar cursos con información de alumnos: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint para OBTENER los alumnos de un curso específico
     * VERSIÓN SIMPLIFICADA
     */
    @GetMapping("/{cursoId}/alumnos")
    public ResponseEntity<Map<String, Object>> getAlumnosPorCurso(@PathVariable int cursoId) {
        try {
            System.out.println("👨‍🎓 Solicitando alumnos para curso ID: " + cursoId);
            
            List<Alumno> alumnos = alumnoService.buscarAlumnosPorCurso(cursoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cursoId", cursoId);
            response.put("alumnos", alumnos);
            response.put("total", alumnos.size());

            System.out.println("✅ Alumnos encontrados para curso " + cursoId + ": " + alumnos.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error en getAlumnosPorCurso: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al cargar alumnos del curso: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint de prueba simple
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "✅ Controlador de cursos de instructor está funcionando correctamente");
        response.put("timestamp", System.currentTimeMillis());
        
        System.out.println("✅ Test endpoint ejecutado correctamente");
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint de prueba para instructor específico
     */
    @GetMapping("/instructor/{instructorId}/test")
    public ResponseEntity<Map<String, Object>> testCursosInstructor(@PathVariable int instructorId) {
        try {
            System.out.println("🧪 Test endpoint para instructor: " + instructorId);
            
            List<Curso> cursos = cursoService.listarTodosLosCursos()
                    .stream()
                    .filter(c -> c.getInstructorId() == instructorId)
                    .collect(Collectors.toList());
            
            // Log detallado
            System.out.println("📋 Cursos encontrados para instructor " + instructorId + ": " + cursos.size());
            cursos.forEach(curso -> {
                System.out.println("   - ID: " + curso.getId() + 
                                 " | Nombre: " + curso.getNombre() +
                                 " | Fecha: " + curso.getFechaIngreso() +
                                 " | Empresa: " + curso.getEmpresa() +
                                 " | Instructor ID: " + curso.getInstructorId());
            });
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("instructorId", instructorId);
            response.put("totalCursos", cursos.size());
            response.put("cursos", cursos);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error en testCursosInstructor: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint para CREAR una nueva asignación de curso.
     */
    @PostMapping
    public ResponseEntity<Curso> createCurso(@RequestBody Curso curso) {
        boolean exito = cursoService.crearCurso(curso);
        if (exito) {
            return new ResponseEntity<>(curso, HttpStatus.CREATED);
        }
        return ResponseEntity.badRequest().build();
    }

    /**
     * Endpoint para ACTUALIZAR una asignación de curso existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Curso> updateCurso(@PathVariable int id, @RequestBody Curso curso) {
        curso.setId(id);
        boolean exito = cursoService.actualizarCurso(curso);
        if (exito) {
            return ResponseEntity.ok(curso);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Endpoint para ELIMINAR una asignación de curso.
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