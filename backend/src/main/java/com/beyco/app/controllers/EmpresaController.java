// controllers/EmpresaController.java
package com.beyco.app.controllers;

import com.beyco.app.models.Empresa;
import com.beyco.app.services.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://192.168.0.55:3000",
    "http://10.0.43.69:3000",
    "http://10.0.47.108:3000",
    "http://10.0.45.30:3000",
    "http://10.0.43.190:3000"
})
public class EmpresaController {

    @Autowired
    private EmpresaService empresaService;

    // ✅ ENDPOINT GET - LISTAR TODAS LAS EMPRESAS
    @GetMapping
    public ResponseEntity<?> getAllEmpresas() {
        System.out.println("🎯 ===== GET /api/empresas LLAMADO =====");
        try {
            List<Empresa> empresas = empresaService.listarTodas();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", empresas);
            response.put("total", empresas.size());
            
            System.out.println("✅ Enviando " + empresas.size() + " empresas al frontend");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error en EmpresaController: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al obtener empresas: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ ENDPOINT GET - BUSCAR EMPRESA POR ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getEmpresaById(@PathVariable int id) {
        System.out.println("🔍 Buscando empresa con ID: " + id);
        try {
            Empresa empresa = empresaService.buscarPorId(id);
            
            if (empresa != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", empresa);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Empresa no encontrada");
                return ResponseEntity.status(404).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error al buscar empresa: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al buscar empresa: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ ENDPOINT POST - CREAR NUEVA EMPRESA
    @PostMapping
    public ResponseEntity<?> crearEmpresa(@RequestBody Empresa empresa) {
        System.out.println("➕ Creando nueva empresa: " + empresa.getNombre());
        try {
            // Validaciones básicas
            if (empresa.getNombre() == null || empresa.getNombre().trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "El nombre de la empresa es requerido");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            boolean creada = empresaService.crearEmpresa(empresa);
            
            if (creada) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Empresa creada correctamente");
                response.put("data", empresa);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "No se pudo crear la empresa");
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error al crear empresa: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al crear empresa: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ ENDPOINT PUT - ACTUALIZAR EMPRESA
    @PutMapping
    public ResponseEntity<?> actualizarEmpresa(@RequestBody Empresa empresa) {
        System.out.println("✏️ Actualizando empresa ID: " + empresa.getId());
        try {
            boolean actualizada = empresaService.actualizarEmpresa(empresa);
            
            if (actualizada) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Empresa actualizada correctamente");
                response.put("data", empresa);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "No se pudo actualizar la empresa");
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error al actualizar empresa: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al actualizar empresa: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ ENDPOINT DELETE - ELIMINAR EMPRESA
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarEmpresa(@PathVariable int id) {
        System.out.println("🗑️ Eliminando empresa ID: " + id);
        try {
            boolean eliminada = empresaService.eliminarEmpresa(id);
            
            if (eliminada) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Empresa eliminada correctamente");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "No se pudo eliminar la empresa");
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar empresa: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al eliminar empresa: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ ENDPOINT GET - BUSCAR EMPRESAS
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarEmpresas(@RequestParam String criterio) {
        System.out.println("🔍 Buscando empresas con criterio: " + criterio);
        try {
            List<Empresa> empresas = empresaService.buscarEmpresas(criterio);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", empresas);
            response.put("total", empresas.size());
            
            System.out.println("✅ Empresas encontradas: " + empresas.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error al buscar empresas: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al buscar empresas: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ ENDPOINT GET - HEALTH CHECK
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        System.out.println("🏥 Health check de empresas recibido");
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Servicio de empresas funcionando correctamente");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}