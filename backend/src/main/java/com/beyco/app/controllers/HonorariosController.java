package com.beyco.app.controllers;

import com.beyco.app.models.HonorariosInstructorDTO;
import com.beyco.app.models.PagoInstructor;
import com.beyco.app.models.Usuario;
import com.beyco.app.services.HonorariosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/honorarios")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.0.55:3000", 
                       "http://10.0.46.106:3000", "http://10.0.47.108:3000", 
                       "http://10.0.45.30:3000", "http://10.0.43.190:3000"})
public class HonorariosController {

    @Autowired
    private HonorariosService honorariosService;

    // Endpoint para ver todos los cursos (debug) - CORREGIDO
    @GetMapping("/cursos")
    public ResponseEntity<?> listarTodosLosCursos() {
        try {
            System.out.println("📊 Solicitando lista de todos los cursos");
            List<PagoInstructor> cursos = honorariosService.obtenerTodosLosCursos();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", cursos);
            response.put("total", cursos.size());
            
            System.out.println("✅ Cursos encontrados: " + cursos.size());
            for (PagoInstructor curso : cursos) {
                System.out.println("Curso - Instructor ID: " + curso.getInstructorId() + 
                                 ", Fecha: " + curso.getFechaPago() +
                                 ", Monto: " + curso.getMonto() +
                                 ", Horas: " + curso.getHorasImpartidas() +
                                 ", Observaciones: " + curso.getObservaciones());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error al obtener cursos: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al obtener cursos: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Endpoint para ver todos los pagos (debug) - CORREGIDO
    @GetMapping("/pagos")
    public ResponseEntity<?> listarTodosLosPagos() {
        try {
            System.out.println("💰 Solicitando lista de todos los pagos");
            List<PagoInstructor> pagos = honorariosService.obtenerTodosLosPagos();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", pagos);
            response.put("total", pagos.size());
            
            System.out.println("✅ Pagos encontrados: " + pagos.size());
            for (PagoInstructor pago : pagos) {
                System.out.println("Pago ID: " + pago.getId() + 
                                 ", Instructor ID: " + pago.getInstructorId() +
                                 ", Fecha: " + pago.getFechaPago() +
                                 ", Monto: " + pago.getMonto() +
                                 ", Estatus: " + pago.getEstatus() +
                                 ", Observaciones: " + pago.getObservaciones());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error al obtener pagos: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al obtener pagos: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Obtener lista de instructores activos
    @GetMapping("/instructores")
    public ResponseEntity<?> listarInstructores() {
        try {
            System.out.println("👨‍🏫 Solicitando lista de instructores activos");
            List<Usuario> instructores = honorariosService.listarInstructoresActivos();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", instructores);
            response.put("total", instructores.size());
            
            System.out.println("✅ Instructores activos encontrados: " + instructores.size());
            for (Usuario instructor : instructores) {
                String nombreCompleto = instructor.getNombre() + " " + 
                                      instructor.getApellidoPaterno() + " " + 
                                      instructor.getApellidoMaterno();
                System.out.println("Instructor: " + nombreCompleto.trim() + 
                                 " (ID: " + instructor.getNumEmpleado() + 
                                 ", Email: " + instructor.getCorreo() + ")");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error al obtener instructores: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al obtener instructores: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Obtener cursos pendientes por instructor y periodo - CORREGIDO
    @GetMapping("/instructor/{instructorId}/cursos-pendientes")
    public ResponseEntity<?> obtenerCursosPendientes(
            @PathVariable("instructorId") int instructorId,
            @RequestParam("fechaInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam("fechaFin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        
        try {
            System.out.println("🔍 Buscando cursos para instructor ID: " + instructorId + 
                             " desde " + fechaInicio + " hasta " + fechaFin);
            
            HonorariosInstructorDTO honorarios = honorariosService.obtenerCursosPendientes(
                instructorId, fechaInicio, fechaFin);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", honorarios);
            
            System.out.println("📋 Cursos pendientes encontrados: " + 
                             (honorarios.getCursosPendientes() != null ? 
                              honorarios.getCursosPendientes().size() : 0));
            
            if (honorarios.getCursosPendientes() != null) {
                for (PagoInstructor curso : honorarios.getCursosPendientes()) {
                    System.out.println("Curso - Instructor ID: " + curso.getInstructorId() + 
                                     ", Fecha: " + curso.getFechaPago() + 
                                     ", Monto: " + curso.getMonto() + 
                                     ", Horas: " + curso.getHorasImpartidas() +
                                     ", Estatus: " + curso.getEstatus() +
                                     ", Observaciones: " + curso.getObservaciones());
                }
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error al obtener cursos pendientes: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al obtener cursos pendientes: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Generar recibo de pago - CORREGIDO
    @PostMapping("/generar-recibo")
    public ResponseEntity<?> generarReciboPago(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("💰 Solicitando generación de recibo");
            System.out.println("📝 Datos recibidos: " + request);
            
            @SuppressWarnings("unchecked")
            List<Integer> cursosIds = (List<Integer>) request.get("cursosIds");
            int instructorId = (Integer) request.get("instructorId");
            String periodoPago = (String) request.get("periodoPago");
            String fechaInicioStr = (String) request.get("fechaInicioPeriodo");
            String fechaFinStr = (String) request.get("fechaFinPeriodo");
            
            LocalDate fechaInicio = LocalDate.parse(fechaInicioStr);
            LocalDate fechaFin = LocalDate.parse(fechaFinStr);
            
            System.out.println("🔧 Procesando recibo para:");
            System.out.println("   - Instructor ID: " + instructorId);
            System.out.println("   - Cursos IDs: " + cursosIds);
            System.out.println("   - Periodo: " + periodoPago);
            System.out.println("   - Fecha inicio: " + fechaInicio);
            System.out.println("   - Fecha fin: " + fechaFin);
            
            boolean resultado = honorariosService.generarReciboPago(
                instructorId, cursosIds, periodoPago, fechaInicio, fechaFin);
            
            if (resultado) {
                System.out.println("✅ Recibo generado exitosamente");
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Recibo generado exitosamente");
                return ResponseEntity.ok(response);
            } else {
                System.out.println("❌ No se pudo generar el recibo");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "No se pudo generar el recibo");
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.out.println("💥 Error al generar recibo: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al generar recibo: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Endpoint de salud para verificar que el controller está funcionando
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        System.out.println("🏥 Health check recibido");
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Honorarios Controller está funcionando correctamente");
        response.put("timestamp", LocalDate.now().toString());
        return ResponseEntity.ok(response);
    }

    // Endpoint para crear datos de prueba en pagos_instructores - CORREGIDO
    @PostMapping("/crear-datos-prueba")
    public ResponseEntity<?> crearDatosPrueba() {
        try {
            System.out.println("🧪 Creando datos de prueba en pagos_instructores");
            
            // Obtener algunos cursos para crear datos de prueba
            List<PagoInstructor> cursos = honorariosService.obtenerTodosLosCursos();
            
            int registrosCreados = 0;
            
            // Crear algunos pagos de prueba
            for (PagoInstructor curso : cursos) {
                if (registrosCreados >= 2) break; // Solo crear 2 registros de prueba
                
                try {
                    // Extraer información del curso desde las observaciones
                    String observaciones = curso.getObservaciones();
                    String nombreCurso = "Curso de prueba";
                    if (observaciones != null && observaciones.contains("Curso: ")) {
                        int start = observaciones.indexOf("Curso: ") + 7;
                        int end = observaciones.indexOf(" (ID:");
                        if (end > start) {
                            nombreCurso = observaciones.substring(start, end);
                        }
                    }
                    
                    // Insertar pago de prueba
                    boolean creado = honorariosService.crearPagoPrueba(
                        curso.getInstructorId(),
                        curso.getFechaPago(), // Usar fechaPago en lugar de fechaCurso
                        curso.getMonto(),
                        curso.getHorasImpartidas(),
                        nombreCurso
                    );
                    
                    if (creado) {
                        registrosCreados++;
                        System.out.println("✅ Creado pago de prueba para: " + nombreCurso);
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ Error creando pago para curso: " + e.getMessage());
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Datos de prueba creados: " + registrosCreados + " registros");
            response.put("registrosCreados", registrosCreados);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Error al crear datos de prueba: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al crear datos de prueba: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Buscar instructores por criterio
    @GetMapping("/instructores/buscar")
    public ResponseEntity<?> buscarInstructores(@RequestParam("criterio") String criterio) {
        try {
            System.out.println("🔍 Buscando instructores con criterio: " + criterio);
            List<Usuario> instructores = honorariosService.buscarInstructores(criterio);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", instructores);
            response.put("total", instructores.size());
            
            System.out.println("✅ Instructores encontrados: " + instructores.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error al buscar instructores: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al buscar instructores: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // NUEVO: Endpoint para obtener cursos por instructor (debugging)
    @GetMapping("/instructor/{instructorId}/cursos")
    public ResponseEntity<?> obtenerCursosPorInstructor(@PathVariable("instructorId") int instructorId) {
        try {
            System.out.println("🔍 Buscando todos los cursos para instructor ID: " + instructorId);
            
            List<PagoInstructor> cursos = honorariosService.obtenerCursosPorInstructor(instructorId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", cursos);
            response.put("total", cursos.size());
            
            System.out.println("✅ Cursos encontrados para instructor " + instructorId + ": " + cursos.size());
            for (PagoInstructor curso : cursos) {
                System.out.println("Curso - Instructor ID: " + curso.getInstructorId() + 
                                 ", Fecha: " + curso.getFechaPago() + 
                                 ", Monto: " + curso.getMonto() +
                                 ", Observaciones: " + curso.getObservaciones());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error al obtener cursos por instructor: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al obtener cursos: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}