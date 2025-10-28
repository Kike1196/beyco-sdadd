package com.beyco.app.controllers;

import com.beyco.app.models.Alumno;
import com.beyco.app.models.Curso;
import com.beyco.app.models.Instructor;
import com.beyco.app.services.AlumnoService;
import com.beyco.app.services.CursoService;
import com.beyco.app.services.InscripcionService;
import com.beyco.app.services.InstructorService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscripciones")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.0.55:3000"})
public class InscripcionController {

    @Autowired
    private CursoService cursoService;

    @Autowired
    private AlumnoService alumnoService;

    @Autowired
    private InscripcionService inscripcionService;

    @Autowired
    private InstructorService instructorService;

    /**
     * Obtiene todos los cursos disponibles para inscripción
     */
    @GetMapping("/cursos")
    public ResponseEntity<List<Curso>> getCursosParaInscripcion() {
        try {
            List<Curso> cursos = cursoService.listarTodosLosCursos();
            return ResponseEntity.ok(cursos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Obtiene alumnos inscritos en un curso específico
     */
    @GetMapping("/cursos/{cursoId}/alumnos")
    public ResponseEntity<List<Alumno>> getAlumnosInscritos(@PathVariable int cursoId) {
        try {
            System.out.println("🔍 Solicitando alumnos para curso ID: " + cursoId);
            List<Alumno> alumnos = alumnoService.buscarAlumnosPorCurso(cursoId);
            System.out.println("✅ Alumnos encontrados: " + alumnos.size() + " para curso " + cursoId);
            
            // Debug: mostrar los alumnos encontrados
            for (Alumno alumno : alumnos) {
                System.out.println("👤 Alumno: " + alumno.getNombre() + " " + 
                                alumno.getApellidoPaterno() + " CURP: " + alumno.getCurp());
            }
            
            return ResponseEntity.ok(alumnos);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo alumnos para curso " + cursoId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Obtiene todos los alumnos (para búsqueda)
     */
    @GetMapping("/alumnos")
    public ResponseEntity<List<Alumno>> getAllAlumnos() {
        try {
            List<Alumno> alumnos = alumnoService.listarTodosLosAlumnos();
            return ResponseEntity.ok(alumnos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Inscribe un alumno a un curso
     */
    @PostMapping("/inscribir")
    public ResponseEntity<String> inscribirAlumno(@RequestBody InscripcionRequest request) {
        try {
            // Verificar si ya está inscrito
            if (inscripcionService.existeInscripcion(request.getAlumnoCurp(), request.getCursoId())) {
                return ResponseEntity.badRequest().body("El alumno ya está inscrito en este curso");
            }
            
            boolean exito = inscripcionService.inscribirAlumno(request.getAlumnoCurp(), request.getCursoId());
            if (exito) {
                return ResponseEntity.ok("Alumno inscrito correctamente");
            } else {
                return ResponseEntity.badRequest().body("Error al inscribir alumno");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    /**
     * Crea un nuevo alumno
     */
    @PostMapping("/alumnos/nuevo")
    public ResponseEntity<String> crearAlumno(@RequestBody Alumno alumno) {
        try {
            boolean exito = alumnoService.crearAlumno(alumno);
            if (exito) {
                return ResponseEntity.ok("Alumno creado correctamente");
            } else {
                return ResponseEntity.badRequest().body("Error al crear alumno");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    /**
     * Obtiene el conteo de alumnos inscritos en un curso
     */
    @GetMapping("/cursos/{cursoId}/contar")
    public ResponseEntity<Integer> contarAlumnosInscritos(@PathVariable int cursoId) {
        try {
            int count = inscripcionService.contarAlumnosInscritos(cursoId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Clase interna para el request de inscripción
     */
    public static class InscripcionRequest {
        private String alumnoCurp;
        private int cursoId;

        // Getters y setters
        public String getAlumnoCurp() { return alumnoCurp; }
        public void setAlumnoCurp(String alumnoCurp) { this.alumnoCurp = alumnoCurp; }
        public int getCursoId() { return cursoId; }
        public void setCursoId(int cursoId) { this.cursoId = cursoId; }
    }

    /**
     * Verifica si un alumno ya existe por CURP
     */
    @GetMapping("/alumnos/verificar/{curp}")
    public ResponseEntity<Boolean> verificarAlumnoExistente(@PathVariable String curp) {
        try {
            Alumno alumno = alumnoService.buscarAlumnoPorCurp(curp);
            return ResponseEntity.ok(alumno != null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }    
    }

    /**
     * Obtiene todos los instructores disponibles (CORREGIDO - solo un método)
     */
    @GetMapping("/instructores")
    public ResponseEntity<List<Instructor>> getAllInstructores() {
        try {
            // Usar el servicio de instructor
            List<Instructor> instructores = instructorService.listarTodosLosInstructores();
            System.out.println("✅ Instructores encontrados: " + instructores.size());
            return ResponseEntity.ok(instructores);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo instructores: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Obtiene cursos por instructor
     */
    @GetMapping("/instructores/{instructorId}/cursos")
    public ResponseEntity<List<Curso>> getCursosPorInstructor(@PathVariable int instructorId) {
        try {
            System.out.println("🔍 Solicitando cursos para instructor ID: " + instructorId);
            List<Curso> cursos = cursoService.listarCursosPorInstructor(instructorId);
            System.out.println("✅ Cursos encontrados: " + cursos.size() + " para instructor " + instructorId);
            
            if (cursos.isEmpty()) {
                System.out.println("⚠️  No se encontraron cursos para el instructor " + instructorId);
            }
            
            return ResponseEntity.ok(cursos);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo cursos para instructor " + instructorId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Busca alumnos por apellido
     */
    @GetMapping("/alumnos/buscar")
    public ResponseEntity<List<Alumno>> buscarAlumnosPorApellido(@RequestParam String apellido) {
        try {
            System.out.println("🔍 Buscando alumnos por apellido: " + apellido);
            List<Alumno> alumnos = alumnoService.buscarAlumnosPorApellidos(apellido);
            System.out.println("✅ Alumnos encontrados: " + alumnos.size());
            
            // Debug: mostrar alumnos encontrados
            for (Alumno alumno : alumnos) {
                System.out.println("👤 " + alumno.getNombre() + " " + 
                                alumno.getApellidoPaterno() + " " + 
                                alumno.getApellidoMaterno());
            }
            
            return ResponseEntity.ok(alumnos);
        } catch (Exception e) {
            System.err.println("❌ Error buscando alumnos por apellido: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Elimina un alumno de un curso específico (solo la inscripción)
     */
    @DeleteMapping("/cursos/{cursoId}/alumnos/{alumnoCurp}")
    public ResponseEntity<String> eliminarAlumnoDelCurso(
            @PathVariable int cursoId,
            @PathVariable String alumnoCurp) {
        try {
            System.out.println("🗑️ Eliminando alumno " + alumnoCurp + " del curso " + cursoId);
            
            boolean exito = inscripcionService.eliminarInscripcion(alumnoCurp, cursoId);
            
            if (exito) {
                System.out.println("✅ Alumno eliminado del curso correctamente");
                return ResponseEntity.ok("Alumno eliminado del curso correctamente");
            } else {
                System.out.println("❌ No se pudo eliminar el alumno del curso");
                return ResponseEntity.badRequest().body("No se pudo eliminar el alumno del curso");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error eliminando alumno del curso: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    /**
     * Elimina un alumno definitivamente del sistema
     */
    @DeleteMapping("/alumnos/{alumnoCurp}")
    public ResponseEntity<String> eliminarAlumnoDefinitivamente(@PathVariable String alumnoCurp) {
        try {
            System.out.println("⚠️ Eliminando alumno " + alumnoCurp + " del sistema");
            
            boolean exito = alumnoService.eliminarAlumnoDefinitivamente(alumnoCurp);
            
            if (exito) {
                System.out.println("✅ Alumno eliminado definitivamente del sistema");
                return ResponseEntity.ok("Alumno eliminado definitivamente del sistema");
            } else {
                System.out.println("❌ No se pudo eliminar el alumno del sistema");
                return ResponseEntity.badRequest().body("No se pudo eliminar el alumno del sistema");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error eliminando alumno del sistema: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

}