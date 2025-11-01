package com.beyco.app.controllers;

import com.beyco.app.models.Evidencia;
import com.beyco.app.services.EvidenciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evidencia")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.0.55:3000", 
                       "http://10.0.46.106:3000", "http://10.0.47.108:3000", 
                       "http://10.0.45.30:3000", "http://10.0.43.190:3000"})
public class EvidenciaController {

    @Autowired
    private EvidenciaService evidenciaService;

    // ✅ ENDPOINT POST - SUBIR EVIDENCIA (VERSIÓN SIMPLIFICADA)
    @PostMapping("/subir")
    public ResponseEntity<?> subirEvidencia(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("cursos_Id_Curso") int cursosIdCurso,
            @RequestParam("Tipo_Evidencia") String tipoEvidencia,
            @RequestParam("Descripcion") String descripcion,
            @RequestParam(value = "Observaciones", required = false) String observaciones) {
        
        try {
            System.out.println("📷 === INICIANDO SUBIDA DE EVIDENCIA ===");
            System.out.println("📁 Archivo: " + archivo.getOriginalFilename());
            System.out.println("📚 Curso ID: " + cursosIdCurso);
            System.out.println("📝 Tipo: " + tipoEvidencia);
            System.out.println("🔖 Descripción: " + descripcion);
            System.out.println("💬 Observaciones: " + observaciones);
            System.out.println("📏 Tamaño archivo: " + archivo.getSize() + " bytes");

            // Validaciones básicas
            if (archivo.isEmpty()) {
                return ResponseEntity.badRequest().body(crearErrorResponse("El archivo no puede estar vacío"));
            }

            if (descripcion == null || descripcion.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(crearErrorResponse("La descripción es requerida"));
            }

            // Subir evidencia
            boolean subido = evidenciaService.subirEvidencia(archivo, tipoEvidencia, descripcion, observaciones, cursosIdCurso);

            if (subido) {
                System.out.println("✅ === EVIDENCIA SUBIDA EXITOSAMENTE ===");
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Evidencia subida correctamente");
                response.put("data", Map.of(
                    "cursoId", cursosIdCurso,
                    "tipo", tipoEvidencia,
                    "descripcion", descripcion,
                    "archivo", archivo.getOriginalFilename(),
                    "tamaño", archivo.getSize()
                ));
                
                return ResponseEntity.ok(response);
            } else {
                System.out.println("❌ No se pudo subir la evidencia");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(crearErrorResponse("No se pudo subir la evidencia"));
            }

        } catch (IllegalArgumentException e) {
            System.out.println("❌ Error de validación: " + e.getMessage());
            return ResponseEntity.badRequest().body(crearErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.out.println("❌ Error al subir evidencia: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(crearErrorResponse("Error interno al subir evidencia: " + e.getMessage()));
        }
    }

    // ✅ ENDPOINT GET - OBTENER EVIDENCIA POR CURSO
    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<?> obtenerEvidenciaPorCurso(@PathVariable int cursoId) {
        try {
            System.out.println("📋 Solicitando evidencia para curso: " + cursoId);
            
            List<Evidencia> evidencias = evidenciaService.obtenerEvidenciaPorCurso(cursoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", evidencias);
            response.put("total", evidencias.size());
            response.put("cursoId", cursoId);
            
            System.out.println("✅ Evidencias encontradas: " + evidencias.size() + " para curso " + cursoId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Error al obtener evidencia: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(crearErrorResponse("Error al obtener evidencia: " + e.getMessage()));
        }
    }

    // ✅ ENDPOINT GET - OBTENER TODAS LAS EVIDENCIAS
    @GetMapping("/todas")
    public ResponseEntity<?> obtenerTodasLasEvidencias() {
        try {
            System.out.println("📋 Solicitando todas las evidencias");
            
            List<Evidencia> evidencias = evidenciaService.obtenerTodasLasEvidencias();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", evidencias);
            response.put("total", evidencias.size());
            
            System.out.println("✅ Total de evidencias: " + evidencias.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Error al obtener evidencias: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(crearErrorResponse("Error al obtener evidencias: " + e.getMessage()));
        }
    }

    // ✅ ENDPOINT GET - OBTENER EVIDENCIA POR ID
    @GetMapping("/{idEvidencia}")
    public ResponseEntity<?> obtenerEvidenciaPorId(@PathVariable int idEvidencia) {
        try {
            System.out.println("🔍 Solicitando evidencia ID: " + idEvidencia);
            
            Evidencia evidencia = evidenciaService.obtenerEvidenciaPorId(idEvidencia);
            
            if (evidencia != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", evidencia);
                
                System.out.println("✅ Evidencia encontrada: " + evidencia.getDescripcion());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(crearErrorResponse("Evidencia no encontrada con ID: " + idEvidencia));
            }
            
        } catch (Exception e) {
            System.out.println("❌ Error al obtener evidencia: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(crearErrorResponse("Error al obtener evidencia: " + e.getMessage()));
        }
    }

    // ✅ ENDPOINT GET - DESCARGAR ARCHIVO
    @GetMapping("/descargar/{idEvidencia}")
    public ResponseEntity<byte[]> descargarArchivo(@PathVariable int idEvidencia) {
        try {
            System.out.println("📥 Solicitando descarga de evidencia ID: " + idEvidencia);
            
            Evidencia evidencia = evidenciaService.obtenerEvidenciaPorId(idEvidencia);
            if (evidencia == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            byte[] archivo = evidenciaService.obtenerArchivo(idEvidencia);
            
            // Determinar content type basado en la extensión del archivo
            String contentType = determinarContentType(evidencia.getArchivoRuta());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", evidencia.getDescripcion());
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            System.out.println("✅ Archivo enviado para descarga: " + evidencia.getDescripcion());
            return new ResponseEntity<>(archivo, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            System.out.println("❌ Error al descargar archivo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ ENDPOINT PUT - ACTUALIZAR ESTATUS
    @PutMapping("/{idEvidencia}/estatus")
    public ResponseEntity<?> actualizarEstatus(@PathVariable int idEvidencia, @RequestBody Map<String, String> request) {
        try {
            String nuevoEstatus = request.get("estatus");
            System.out.println("✏️ Actualizando estatus de evidencia " + idEvidencia + " a: " + nuevoEstatus);
            
            if (nuevoEstatus == null || nuevoEstatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(crearErrorResponse("El estatus es requerido"));
            }
            
            boolean actualizado = evidenciaService.actualizarEstatus(idEvidencia, nuevoEstatus);
            
            if (actualizado) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Estatus actualizado correctamente");
                response.put("data", Map.of(
                    "idEvidencia", idEvidencia,
                    "nuevoEstatus", nuevoEstatus
                ));
                
                System.out.println("✅ Estatus actualizado exitosamente");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(crearErrorResponse("No se pudo actualizar el estatus"));
            }
            
        } catch (Exception e) {
            System.out.println("❌ Error al actualizar estatus: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(crearErrorResponse("Error al actualizar estatus: " + e.getMessage()));
        }
    }

    // ✅ ENDPOINT DELETE - ELIMINAR EVIDENCIA
    @DeleteMapping("/{idEvidencia}")
    public ResponseEntity<?> eliminarEvidencia(@PathVariable int idEvidencia) {
        try {
            System.out.println("🗑️ Eliminando evidencia ID: " + idEvidencia);
            
            boolean eliminado = evidenciaService.eliminarEvidencia(idEvidencia);
            
            if (eliminado) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Evidencia eliminada correctamente");
                
                System.out.println("✅ Evidencia eliminada exitosamente");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(crearErrorResponse("No se pudo eliminar la evidencia"));
            }
            
        } catch (Exception e) {
            System.out.println("❌ Error al eliminar evidencia: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(crearErrorResponse("Error al eliminar evidencia: " + e.getMessage()));
        }
    }

    // ✅ ENDPOINT GET - VERIFICAR EVIDENCIA POR CURSO
    @GetMapping("/curso/{cursoId}/existe")
    public ResponseEntity<?> existeEvidenciaParaCurso(@PathVariable int cursoId) {
        try {
            System.out.println("🔍 Verificando evidencia para curso: " + cursoId);
            
            boolean existe = evidenciaService.existeEvidenciaParaCurso(cursoId);
            int count = evidenciaService.contarEvidenciasPorCurso(cursoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("existe", existe);
            response.put("count", count);
            response.put("cursoId", cursoId);
            
            System.out.println("✅ Verificación completada: existe=" + existe + ", count=" + count);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Error al verificar evidencia: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(crearErrorResponse("Error al verificar evidencia: " + e.getMessage()));
        }
    }

    // Método auxiliar para determinar content type
    private String determinarContentType(String nombreArchivo) {
        if (nombreArchivo == null) {
            return "application/octet-stream";
        }
        
        if (nombreArchivo.toLowerCase().endsWith(".pdf")) {
            return "application/pdf";
        } else if (nombreArchivo.toLowerCase().endsWith(".jpg") || nombreArchivo.toLowerCase().endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (nombreArchivo.toLowerCase().endsWith(".png")) {
            return "image/png";
        } else if (nombreArchivo.toLowerCase().endsWith(".gif")) {
            return "image/gif";
        } else if (nombreArchivo.toLowerCase().endsWith(".mp4")) {
            return "video/mp4";
        } else if (nombreArchivo.toLowerCase().endsWith(".avi")) {
            return "video/x-msvideo";
        } else if (nombreArchivo.toLowerCase().endsWith(".mov")) {
            return "video/quicktime";
        } else {
            return "application/octet-stream";
        }
    }

    // Método auxiliar para crear respuestas de error
    private Map<String, Object> crearErrorResponse(String mensaje) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", mensaje);
        errorResponse.put("timestamp", System.currentTimeMillis());
        return errorResponse;
    }
}