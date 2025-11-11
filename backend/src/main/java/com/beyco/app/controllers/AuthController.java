package com.beyco.app.controllers;

import com.beyco.app.models.Usuario;
import com.beyco.app.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://192.168.0.55:3000", 
    "http://10.0.43.69:3000",
    "http://10.0.47.108:3000",
    "http://10.0.45.30:3000",
    "http://10.0.43.190:3000"
})
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    // ✅ ENDPOINT DE LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String correo = loginRequest.get("correo");
            String contrasena = loginRequest.get("contrasena");
            
            System.out.println("🎯 POST /api/auth/login - Correo: " + correo);
            System.out.println("🔑 Contraseña recibida: " + contrasena);
            
            if (correo == null || correo.trim().isEmpty() || contrasena == null || contrasena.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Correo y contraseña son requeridos");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Usuario usuario = usuarioService.autenticarUsuario(correo, contrasena);
            
            if (usuario != null) {
                // Mapear el rol según el Id_Rol
                String rol = mapearRol(usuario.getIdRol());
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Login exitoso");
                
                // Crear objeto usuario con todos los campos
                Map<String, Object> usuarioData = new HashMap<>();
                usuarioData.put("id", usuario.getNumEmpleado());
                usuarioData.put("nombre", usuario.getNombre() + " " + usuario.getApellidoPaterno() + " " + usuario.getApellidoMaterno());
                usuarioData.put("correo", usuario.getCorreo());
                usuarioData.put("id_rol", usuario.getIdRol());
                usuarioData.put("rol", rol);
                usuarioData.put("num_empleado", usuario.getNumEmpleado());
                usuarioData.put("activo", usuario.isActivo());
                
                response.put("usuario", usuarioData);
                
                System.out.println("✅ Login exitoso para: " + correo + " - Rol: " + rol);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Credenciales incorrectas");
                System.out.println("❌ Login fallido para: " + correo);
                return ResponseEntity.status(401).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en /api/auth/login: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error del servidor durante el login");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ HEALTH CHECK PARA EL FRONTEND
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        System.out.println("🏥 Health check de autenticación recibido");
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Servicio de autenticación funcionando correctamente");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    // === MÉTODO AUXILIAR ===
    private String mapearRol(int idRol) {
        switch (idRol) {
            case 1: return "administrador";
            case 2: return "instructor";
            case 3: return "secretaria";
            default: return "instructor";
        }
    }
}