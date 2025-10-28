package com.beyco.app.controllers;

import com.beyco.app.models.Instructor;
import com.beyco.app.services.InstructorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.0.55:3000", 
                       "http://10.0.46.106:3000", "http://10.0.47.108:3000", 
                       "http://10.0.45.30:3000", "http://10.0.43.190:3000"})
public class InstructorController {
    
    @Autowired
    private InstructorService instructorService;

    @GetMapping("/instructores")
    public ResponseEntity<List<Instructor>> getAllInstructores() {
        try {
            List<Instructor> instructores = instructorService.listarTodosLosInstructores();
            return ResponseEntity.ok(instructores);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}