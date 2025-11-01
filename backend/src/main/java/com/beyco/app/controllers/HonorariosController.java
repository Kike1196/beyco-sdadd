// controllers/HonorariosController.java
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

    // Endpoint para ver todos los cursos (debug)
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
                System.out.println("Curso ID: " + curso.getId() + 
                                 ", Instructor: " + curso.getInstructorNombre() + 
                                 ", Curso: " + curso.getCursoNombre() + 
                                 ", Fecha: " + curso.getFechaCurso() +
                                 ", Precio: " + curso.getMonto());
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

    // Endpoint para ver todos los pagos (debug)
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
                                 ", Instructor: " + pago.getInstructorNombre() + 
                                 ", Fecha: " + pago.getFechaPago() +
                                 ", Monto: " + pago.getMonto() +
                                 ", Estatus: " + pago.getEstatus());
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
                System.out.println("Instructor: " + instructor.getNombre() + " " + 
                                 instructor.getApellidoPaterno() + " " + 
                                 instructor.getApellidoMaterno() + 
                                 " (ID: " + instructor.getNumEmpleado() + ")");
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

    // Obtener cursos pendientes por instructor y periodo - ENDPOINT CORREGIDO
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
                    System.out.println("Curso: " + curso.getCursoNombre() + 
                                     ", Fecha: " + curso.getFechaCurso() + 
                                     ", Monto: " + curso.getMonto() + 
                                     ", Estatus: " + curso.getEstatus());
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

    // Generar recibo de pago
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

    // Endpoint para crear datos de prueba en pagos_instructores
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
                    // Insertar pago de prueba
                    boolean creado = honorariosService.crearPagoPrueba(
                        curso.getInstructorId(),
                        curso.getFechaCurso(),
                        curso.getMonto(),
                        curso.getHorasImpartidas(),
                        curso.getCursoNombre()
                    );
                    
                    if (creado) {
                        registrosCreados++;
                        System.out.println("✅ Creado pago de prueba para: " + curso.getCursoNombre());
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ Error creando pago para curso: " + curso.getCursoNombre() + " - " + e.getMessage());
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
}