package com.beyco.app.controllers;

import com.beyco.app.models.Usuario;
import com.beyco.app.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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

    // === MÉTODO AUXILIAR PARA CONVERTIR USUARIO A MAP ===
    private Map<String, Object> usuarioToMap(Usuario usuario) {
        Map<String, Object> usuarioMap = new HashMap<>();
        usuarioMap.put("numEmpleado", usuario.getNumEmpleado());
        usuarioMap.put("nombre", usuario.getNombre());
        usuarioMap.put("apellidoPaterno", usuario.getApellidoPaterno());
        usuarioMap.put("apellidoMaterno", usuario.getApellidoMaterno());
        usuarioMap.put("correo", usuario.getCorreo());
        usuarioMap.put("idRol", usuario.getIdRol());
        usuarioMap.put("rol", mapearRol(usuario.getIdRol()));
        usuarioMap.put("activo", usuario.isActivo());
        usuarioMap.put("fechaIngreso", usuario.getFechaIngreso() != null ? usuario.getFechaIngreso().toString() : null);
        usuarioMap.put("preguntaRecuperacion", usuario.getPreguntaRecuperacion());
        usuarioMap.put("respuestaRecuperacion", usuario.getRespuestaRecuperacion());
        usuarioMap.put("firma", usuario.getFirma());
        return usuarioMap;
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

            String pregunta = usuarioService.obtenerPreguntaSeguridad(correo);
            
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

    // === ENDPOINTS DE AUTENTICACIÓN ===

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String correo = loginRequest.get("correo");
            String contrasena = loginRequest.get("contrasena");
            
            System.out.println("🎯 POST /api/usuarios/login - Correo: " + correo);
            
            if (correo == null || correo.trim().isEmpty() || contrasena == null || contrasena.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Correo y contraseña son requeridos");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Usuario usuario = usuarioService.autenticarUsuario(correo, contrasena);
            
            if (usuario != null) {
                String rol = mapearRol(usuario.getIdRol());
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Login exitoso");
                response.put("usuario", Map.of(
                    "id", usuario.getNumEmpleado(),
                    "nombre", usuario.getNombre() + " " + usuario.getApellidoPaterno() + " " + usuario.getApellidoMaterno(),
                    "correo", usuario.getCorreo(),
                    "id_rol", usuario.getIdRol(),
                    "rol", rol,
                    "num_empleado", usuario.getNumEmpleado(),
                    "activo", usuario.isActivo()
                ));
                System.out.println("✅ Login exitoso para: " + correo + " - Rol: " + rol);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Credenciales inválidas");
                System.out.println("❌ Login fallido para: " + correo);
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

    // === ENDPOINTS CRUD ===

    @GetMapping("/instructores")
    public ResponseEntity<?> getInstructores() {
        System.out.println("🎯 GET /api/usuarios/instructores");
        try {
            List<Usuario> instructores = usuarioService.listarInstructoresActivos();
            System.out.println("✅ Instructores encontrados: " + instructores.size());
            
            // Convertir a Map para evitar problemas de serialización
            List<Map<String, Object>> instructoresMap = instructores.stream()
                .map(this::usuarioToMap)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("instructores", instructoresMap);
            response.put("total", instructoresMap.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error en /instructores: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al obtener instructores");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ CORREGIDO: Devolver estructura esperada por el frontend
    @GetMapping
    public ResponseEntity<?> getAllUsuarios() {
        System.out.println("🎯 GET /api/usuarios");
        try {
            List<Usuario> usuarios = usuarioService.listarTodosLosUsuarios();
            System.out.println("✅ Usuarios encontrados: " + usuarios.size());
            
            // Convertir a Map para asegurar la estructura correcta
            List<Map<String, Object>> usuariosMap = usuarios.stream()
                .map(this::usuarioToMap)
                .collect(Collectors.toList());
            
            // ✅ ESTRUCTURA CORRECTA PARA EL FRONTEND
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("usuarios", usuariosMap);  // ← El frontend busca "usuarios"
            response.put("total", usuariosMap.size());
            
            System.out.println("📦 Respuesta estructurada con " + usuariosMap.size() + " usuarios");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error en GET /api/usuarios: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al obtener usuarios");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/activos")
    public ResponseEntity<?> getUsuariosActivos() {
        System.out.println("🎯 GET /api/usuarios/activos");
        try {
            List<Usuario> usuarios = usuarioService.listarUsuariosActivos();
            System.out.println("✅ Usuarios activos encontrados: " + usuarios.size());
            
            List<Map<String, Object>> usuariosMap = usuarios.stream()
                .map(this::usuarioToMap)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("usuarios", usuariosMap);
            response.put("total", usuariosMap.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error en GET /api/usuarios/activos: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al obtener usuarios activos");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUsuarioById(@PathVariable int id) {
        System.out.println("🎯 GET /api/usuarios/" + id);
        try {
            Optional<Usuario> usuarioOpt = usuarioService.buscarPorId(id);
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                System.out.println("✅ Usuario encontrado: " + usuario.getNombre());
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("usuario", usuarioToMap(usuario));
                
                return ResponseEntity.ok(response);
            } else {
                System.out.println("❌ Usuario no encontrado, ID: " + id);
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Usuario no encontrado");
                return ResponseEntity.status(404).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en GET /api/usuarios/" + id + ": " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al obtener usuario");
            return ResponseEntity.status(500).body(errorResponse);
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
                response.put("id", usuario.getNumEmpleado());
                System.out.println("✅ Usuario creado: " + usuario.getNombre() + " - ID: " + usuario.getNumEmpleado());
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
            errorResponse.put("error", e.getMessage());
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
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUsuario(@PathVariable int id) {
        System.out.println("🎯 DELETE /api/usuarios/" + id);
        try {
            boolean eliminado = usuarioService.desactivarUsuario(id);
            if (eliminado) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Usuario desactivado correctamente");
                System.out.println("✅ Usuario desactivado ID: " + id);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "No se pudo desactivar el usuario");
                System.out.println("❌ Error al desactivar usuario ID: " + id);
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en DELETE /api/usuarios/" + id + ": " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error del servidor al desactivar usuario");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // === ENDPOINTS ADICIONALES ===

    @PutMapping("/{id}/activar")
    public ResponseEntity<?> activarUsuario(@PathVariable int id) {
        System.out.println("🎯 PUT /api/usuarios/" + id + "/activar");
        try {
            boolean activado = usuarioService.activarUsuario(id);
            if (activado) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Usuario activado correctamente");
                System.out.println("✅ Usuario activado ID: " + id);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "No se pudo activar el usuario");
                System.out.println("❌ Error al activar usuario ID: " + id);
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en PUT /api/usuarios/" + id + "/activar: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error del servidor al activar usuario");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{id}/firma")
    public ResponseEntity<?> actualizarFirma(@PathVariable int id, @RequestBody Map<String, String> request) {
        System.out.println("🎯 PUT /api/usuarios/" + id + "/firma");
        try {
            String rutaFirma = request.get("rutaFirma");
            if (rutaFirma == null || rutaFirma.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "La ruta de la firma es requerida");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            boolean actualizado = usuarioService.actualizarFirma(id, rutaFirma);
            if (actualizado) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Firma actualizada correctamente");
                System.out.println("✅ Firma actualizada para usuario ID: " + id);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "No se pudo actualizar la firma");
                System.out.println("❌ Error al actualizar firma para usuario ID: " + id);
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en PUT /api/usuarios/" + id + "/firma: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error del servidor al actualizar firma");
            return ResponseEntity.status(500).body(errorResponse);
        }
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