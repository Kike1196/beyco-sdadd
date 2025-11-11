package com.beyco.app.controllers;

import com.beyco.app.services.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/estadisticas")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.0.55:3000", 
                       "http://10.0.46.106:3000", "http://10.0.47.108:3000", 
                       "http://10.0.45.30:3000", "http://10.0.43.190:3000"})
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/sistema")
    public ResponseEntity<?> obtenerEstadisticasSistema() {
        try {
            System.out.println("📊 Solicitando estadísticas del sistema");
            
            Map<String, Object> estadisticas = statisticsService.obtenerEstadisticasSistema();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", estadisticas);
            
            System.out.println("✅ Estadísticas obtenidas:");
            System.out.println("   - Usuarios activos: " + estadisticas.get("totalUsuarios"));
            System.out.println("   - Cursos activos: " + estadisticas.get("totalCursos"));
            System.out.println("   - Empresas: " + estadisticas.get("totalEmpresas"));
            System.out.println("   - Pagos pendientes: " + estadisticas.get("pagosPendientes"));
            System.out.println("   - Instructores: " + estadisticas.get("totalInstructores"));
            System.out.println("   - Cursos este mes: " + estadisticas.get("cursosEsteMes"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Error al obtener estadísticas: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al obtener estadísticas del sistema");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}