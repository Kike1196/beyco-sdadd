package com.beyco.app.controllers;

import com.beyco.app.models.EmpresaDTO;
import com.beyco.app.services.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping
    public ResponseEntity<List<EmpresaDTO>> getAllEmpresas() {
        System.out.println("🎯 ===== GET /api/empresas LLAMADO =====");
        try {
            List<EmpresaDTO> empresas = empresaService.listarTodas();
            System.out.println("✅ Enviando " + empresas.size() + " empresas al frontend");
            System.out.println("📋 Empresas: " + empresas);
            return ResponseEntity.ok(empresas);
        } catch (Exception e) {
            System.err.println("❌ Error en EmpresaController: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}