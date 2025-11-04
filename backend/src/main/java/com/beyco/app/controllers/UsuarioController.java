package com.beyco.app.controllers;

import com.beyco.app.models.Usuario;
import com.beyco.app.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://192.168.0.55:3000", 
    "http://10.0.43.69:3000",
    "http://10.0.47.108:3000",
    "http://10.0.45.30:3000",
    "http://10.0.43.190:3000"
})
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // === ENDPOINT DE DIAGNÓSTICO ===
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        System.out.println("🏥 Health check de usuarios recibido");
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Servicio de usuarios funcionando correctamente");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    // === ENDPOINTS PARA RECUPERACIÓN DE CONTRASEÑA ===

    @PostMapping("/pregunta-seguridad")
    public ResponseEntity<?> obtenerPreguntaSeguridad(@RequestBody Map<String, String> request) {
        try {
            String correo = request.get("correo");
            System.out.println("🎯 POST /api/usuarios/pregunta-seguridad - Correo: " + correo);
            
            if (correo == null || correo.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "El correo es requerido");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            String pregunta = usuarioService.getPreguntaSeguridadPorCorreo(correo);
            
            if (pregunta != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("pregunta", pregunta);
                System.out.println("✅ Pregunta encontrada: " + pregunta);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Correo no encontrado en el sistema");
                System.out.println("❌ Correo no encontrado: " + correo);
                return ResponseEntity.status(404).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en /pregunta-seguridad: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error del servidor al obtener pregunta de seguridad");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/verificar-respuesta")
    public ResponseEntity<?> verificarRespuesta(@RequestBody Map<String, String> request) {
        try {
            String correo = request.get("correo");
            String respuesta = request.get("respuesta");
            
            System.out.println("🎯 POST /api/usuarios/verificar-respuesta - Correo: " + correo);
            
            if (correo == null || correo.trim().isEmpty() || respuesta == null || respuesta.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Correo y respuesta son requeridos");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            boolean respuestaCorrecta = usuarioService.verificarRespuestaSeguridad(correo, respuesta);
            
            if (respuestaCorrecta) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Respuesta verificada correctamente");
                System.out.println("✅ Respuesta correcta para: " + correo);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Respuesta incorrecta");
                System.out.println("❌ Respuesta incorrecta para: " + correo);
                return ResponseEntity.status(400).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en /verificar-respuesta: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error del servidor al verificar respuesta");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/actualizar-contrasena")
    public ResponseEntity<?> actualizarContrasena(@RequestBody Map<String, String> request) {
        try {
            String correo = request.get("correo");
            String nuevaContrasena = request.get("nuevaContrasena");
            
            System.out.println("🎯 POST /api/usuarios/actualizar-contrasena - Correo: " + correo);
            
            if (correo == null || correo.trim().isEmpty() || nuevaContrasena == null || nuevaContrasena.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Correo y nueva contraseña son requeridos");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (nuevaContrasena.length() < 6) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "La contraseña debe tener al menos 6 caracteres");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            boolean actualizado = usuarioService.actualizarContrasena(correo, nuevaContrasena);
            
            if (actualizado) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Contraseña actualizada correctamente");
                System.out.println("✅ Contraseña actualizada para: " + correo);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "No se pudo actualizar la contraseña");
                System.out.println("❌ Error al actualizar contraseña para: " + correo);
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en /actualizar-contrasena: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error del servidor al actualizar contraseña");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // === ENDPOINTS EXISTENTES (SE MANTIENEN) ===

    @GetMapping("/instructores")
    public ResponseEntity<List<Usuario>> getInstructores() {
        System.out.println("🎯 GET /api/usuarios/instructores");
        try {
            List<Usuario> instructores = usuarioService.listarInstructores();
            System.out.println("✅ Instructores encontrados: " + instructores.size());
            return ResponseEntity.ok(instructores);
        } catch (Exception e) {
            System.err.println("❌ Error en /instructores: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario loginRequest) {
        System.out.println("🎯 POST /api/usuarios/login - Correo: " + loginRequest.getCorreo());
        try {
            Usuario usuario = usuarioService.autenticarYObtenerUsuario(
                loginRequest.getCorreo(), 
                loginRequest.getContrasena()
            );
            
            if (usuario != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("usuario", usuario);
                System.out.println("✅ Login exitoso para: " + loginRequest.getCorreo());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Credenciales inválidas");
                System.out.println("❌ Login fallido para: " + loginRequest.getCorreo());
                return ResponseEntity.status(401).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en /login: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error del servidor durante el login");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        System.out.println("🎯 GET /api/usuarios");
        try {
            List<Usuario> usuarios = usuarioService.listarUsuarios();
            System.out.println("✅ Usuarios encontrados: " + usuarios.size());
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            System.err.println("❌ Error en GET /api/usuarios: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable int id) {
        System.out.println("🎯 GET /api/usuarios/" + id);
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorId(id);
            if (usuario != null) {
                System.out.println("✅ Usuario encontrado: " + usuario.getNombre());
                return ResponseEntity.ok(usuario);
            } else {
                System.out.println("❌ Usuario no encontrado, ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("❌ Error en GET /api/usuarios/" + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createUsuario(@RequestBody Usuario usuario) {
        System.out.println("🎯 POST /api/usuarios - Nuevo usuario: " + usuario.getNombre());
        try {
            boolean creado = usuarioService.crearUsuario(usuario);
            if (creado) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Usuario creado correctamente");
                System.out.println("✅ Usuario creado: " + usuario.getNombre());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "No se pudo crear el usuario");
                System.out.println("❌ Error al crear usuario: " + usuario.getNombre());
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en POST /api/usuarios: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error del servidor al crear usuario");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping
    public ResponseEntity<?> updateUsuario(@RequestBody Usuario usuario) {
        System.out.println("🎯 PUT /api/usuarios - Actualizar usuario ID: " + usuario.getNumEmpleado());
        try {
            boolean actualizado = usuarioService.actualizarUsuario(usuario);
            if (actualizado) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Usuario actualizado correctamente");
                System.out.println("✅ Usuario actualizado ID: " + usuario.getNumEmpleado());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "No se pudo actualizar el usuario");
                System.out.println("❌ Error al actualizar usuario ID: " + usuario.getNumEmpleado());
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en PUT /api/usuarios: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error del servidor al actualizar usuario");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUsuario(@PathVariable int id) {
        System.out.println("🎯 DELETE /api/usuarios/" + id);
        try {
            boolean eliminado = usuarioService.eliminarUsuario(id);
            if (eliminado) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Usuario eliminado correctamente");
                System.out.println("✅ Usuario eliminado ID: " + id);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "No se pudo eliminar el usuario");
                System.out.println("❌ Error al eliminar usuario ID: " + id);
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en DELETE /api/usuarios/" + id + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error del servidor al eliminar usuario");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}