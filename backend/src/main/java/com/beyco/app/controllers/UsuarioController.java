package com.beyco.app.controllers;

import com.beyco.app.models.Usuario;
import com.beyco.app.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.sql.SQLException;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.0.55:3000", "http://10.0.43.165:3000", "http://10.0.46.106:3000", "http://10.0.47.154:3000", "http://10.0.43.69:3000", " http://10.0.45.30:3000"})
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // --- Objeto para la respuesta del Login ---
    public static class LoginResponse {
        public String name;
        public String role;
    }

    // --- NUEVO ENDPOINT PARA INSTRUCTORES ---
    @GetMapping("/instructores")
    public List<Usuario> getInstructores() {
        return usuarioService.listarInstructores();
    }

    // --- Endpoint para LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String correo = credentials.get("usuario");
        String contrasena = credentials.get("contrasena");
        Usuario usuario = usuarioService.autenticarYObtenerUsuario(correo, contrasena);

        if (usuario != null) {
            LoginResponse response = new LoginResponse();
            response.name = usuario.getNombre();

            int idRol = usuario.getIdRol();
            if (idRol == 1) response.role = "Administrador";
            else if (idRol == 2) response.role = "Instructor";
            else if (idRol == 3) response.role = "Secretaria";
            else response.role = "Desconocido";

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario o contraseña incorrectos");
        }
    }

    // --- Endpoints para RECUPERACIÓN DE CONTRASEÑA ---
    @PostMapping("/pregunta-seguridad")
    public ResponseEntity<?> getPreguntaSeguridad(@RequestBody Map<String, String> payload) {
        // 1. Obtienes el correo que te envía el frontend
        String correo = payload.get("correo");

        if (correo == null || correo.isEmpty()) {
            return ResponseEntity.badRequest().body("El correo es necesario.");
        }

        // 2. Llamas al método del servicio CON el correo como parámetro
        Usuario usuario = usuarioService.buscarUsuarioPorCorreo(correo);

        // 3. Verificas el resultado
        if (usuario != null) {
            return ResponseEntity.ok(Map.of("pregunta", usuario.getPreguntaRecuperacion()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El correo no fue encontrado.");
        }
    }

    @PostMapping("/verificar-respuesta")
    public ResponseEntity<?> verificarRespuesta(@RequestBody Map<String, String> payload) {
        String correo = payload.get("correo");
        String respuesta = payload.get("respuesta");
        boolean esCorrecta = usuarioService.verificarRespuestaSeguridad(correo, respuesta);
        if (esCorrecta) {
            return ResponseEntity.ok(Map.of("message", "Respuesta correcta."));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("La respuesta es incorrecta.");
        }
    }

    @PostMapping("/actualizar-contrasena")
    public ResponseEntity<?> actualizarContrasena(@RequestBody Map<String, String> payload) {
        String correo = payload.get("correo");
        String nuevaContrasena = payload.get("nuevaContrasena");
        boolean exito = usuarioService.actualizarContrasena(correo, nuevaContrasena);
        if (exito) {
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada con éxito."));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("No se pudo actualizar la contraseña.");
        }
    }

    // --- Endpoints CRUD para Usuarios ---

    /**
     * Endpoint para CREAR un nuevo usuario. Acepta JSON.
     */
    @PostMapping
    public ResponseEntity<?> createUsuario(@RequestBody Usuario usuario) {
        try {
            // Validaciones básicas
            if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty() ||
                usuario.getCorreo() == null || usuario.getCorreo().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nombre y correo son campos obligatorios");
            }

            if (usuario.getFechaIngreso() == null) {
                usuario.setFechaIngreso(LocalDate.now());
            }
            
            if (usuario.getFirma() == null || usuario.getFirma().isEmpty()) {
                usuario.setFirma("default_firma.png");
            }

            // Asegurar que campos opcionales no sean null
            if (usuario.getApellidoPaterno() == null) usuario.setApellidoPaterno("");
            if (usuario.getApellidoMaterno() == null) usuario.setApellidoMaterno("");
            if (usuario.getPreguntaRecuperacion() == null) usuario.setPreguntaRecuperacion("");
            if (usuario.getRespuestaRecuperacion() == null) usuario.setRespuestaRecuperacion("");
            if (!usuario.isActivo()) usuario.setActivo(true);

            boolean exito = usuarioService.crearUsuario(usuario);
            if (exito) {
                Usuario savedUser = usuarioService.buscarUsuarioPorCorreo(usuario.getCorreo());
                return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
            } else {
                return ResponseEntity.badRequest().body("No se pudo crear el usuario.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al procesar la petición: " + e.getMessage());
        }
    }

        /**
         * Endpoint para SUBIR la firma de un usuario existente.
         */
        @PostMapping("/{id}/firma")
        public ResponseEntity<?> uploadFirma(@PathVariable int id, @RequestParam("firmaFile") MultipartFile file) {
            try {
                // No es necesario buscar el usuario completo, solo necesitamos el ID
                String filePath = saveFile(file); // saveFile es tu método para guardar el archivo
                
                // --- CORRECCIÓN AQUÍ: Llama al nuevo método del servicio ---
                boolean exito = usuarioService.actualizarFirma(id, filePath);

                if (exito) {
                    return ResponseEntity.ok().body(Map.of("message", "Firma subida con éxito", "filePath", filePath));
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("No se pudo actualizar la firma en la base de datos.");
                }
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al subir el archivo.");
            }
        }

        private String saveFile(MultipartFile file) throws Exception {
            String uploadDir = "uploads/firmas/";
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                uploadDirFile.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path filePath = Paths.get(uploadDir + uniqueFilename);
            Files.write(filePath, file.getBytes());

            return filePath.toString();
        }

        @GetMapping
        public List<Usuario> getAllUsuarios() {
            return usuarioService.listarUsuarios();
        }

        @GetMapping("/{id}")
        public ResponseEntity<Usuario> getUsuarioById(@PathVariable int id) {
            Usuario usuario = usuarioService.buscarUsuarioPorId(id);
            if (usuario != null) {
                return ResponseEntity.ok(usuario);
            } else {
                return ResponseEntity.notFound().build();
            }
        }

    /**
     * Endpoint para ACTUALIZAR un usuario existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUsuario(@PathVariable int id, @RequestBody Usuario usuarioDetails) {
        try {
            Usuario usuarioExistente = usuarioService.buscarUsuarioPorId(id);
            if (usuarioExistente == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Validar campos obligatorios
            if (usuarioDetails.getNombre() == null || usuarioDetails.getNombre().trim().isEmpty() ||
                usuarioDetails.getCorreo() == null || usuarioDetails.getCorreo().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nombre y correo son campos obligatorios");
            }
            
            // Actualizar todos los campos del objeto existente con los detalles recibidos
            usuarioExistente.setNombre(usuarioDetails.getNombre());
            usuarioExistente.setApellidoPaterno(usuarioDetails.getApellidoPaterno() != null ? usuarioDetails.getApellidoPaterno() : "");
            usuarioExistente.setApellidoMaterno(usuarioDetails.getApellidoMaterno() != null ? usuarioDetails.getApellidoMaterno() : "");
            usuarioExistente.setCorreo(usuarioDetails.getCorreo());
            usuarioExistente.setIdRol(usuarioDetails.getIdRol());
            usuarioExistente.setActivo(usuarioDetails.isActivo()); // Actualiza el estado activo
            
            if (usuarioDetails.getFechaIngreso() != null) {
                usuarioExistente.setFechaIngreso(usuarioDetails.getFechaIngreso());
            }
            
            usuarioExistente.setPreguntaRecuperacion(usuarioDetails.getPreguntaRecuperacion() != null ? usuarioDetails.getPreguntaRecuperacion() : "");
            usuarioExistente.setRespuestaRecuperacion(usuarioDetails.getRespuestaRecuperacion() != null ? usuarioDetails.getRespuestaRecuperacion() : "");
            
            if (usuarioDetails.getFirma() != null && !usuarioDetails.getFirma().trim().isEmpty()) {
                usuarioExistente.setFirma(usuarioDetails.getFirma());
            }

            // --- CORRECCIÓN AQUÍ ---
            // Pasa la nueva contraseña (si existe) para que el servicio la procese
            if (usuarioDetails.getContrasena() != null && !usuarioDetails.getContrasena().trim().isEmpty()) {
                usuarioExistente.setContrasena(usuarioDetails.getContrasena());
            } else {
                // Asegurarse de no enviar una contraseña vacía si no se quiere cambiar
                usuarioExistente.setContrasena(null);
            }

            // Llamar al método de actualización unificado
            boolean exito = usuarioService.actualizarUsuario(usuarioExistente);
            
            if (exito) {
                // Devolver el objeto actualizado para que el frontend refresque la fila
                return ResponseEntity.ok(usuarioService.buscarUsuarioPorId(id));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error al actualizar el usuario en la base de datos");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno del servidor: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
        public ResponseEntity<?> deleteUsuario(@PathVariable int id) {
            try {
                boolean exito = usuarioService.eliminarUsuario(id);
                if (exito) {
                    // 204 No Content: Se eliminó (o desactivó) correctamente
                    return ResponseEntity.noContent().build();
                } else {
                    // 404 Not Found: El usuario con ese ID no existía
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado.");
                }
            } catch (SQLException e) {
                // 409 Conflict: Captura el error específico (ej. "tiene cursos asignados")
                // y devuelve un mensaje claro al frontend.
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
    }
}