'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Evaluaciones.module.css';

export default function Evaluaciones() {
    const router = useRouter();
    const [selectedCourse, setSelectedCourse] = useState('');
    const [grades, setGrades] = useState([]);

    const courses = [
        { id: 'seguridad-industrial', name: 'Seguridad Industrial' },
        { id: 'primeros-auxilios', name: 'Primeros Auxilios' },
        { id: 'gestion-ambiental', name: 'Gestión Ambiental' }
    ];

    const students = [
        { id: 1, name: 'Juan Pérez', grade: '' },
        { id: 2, name: 'María García', grade: '' },
        { id: 3, name: 'Carlos López', grade: '' }
    ];

    const handleGradeChange = (studentId, grade) => {
        setGrades(prev => ({
            ...prev,
            [studentId]: grade
        }));
    };

    const handleSaveGrades = () => {
        alert('Calificaciones guardadas exitosamente');
        // Lógica para guardar calificaciones
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <button 
                        onClick={() => router.push('/secretaria')}
                        className={styles.backButton}
                    >
                        ← Volver al Dashboard
                    </button>
                    <div className={styles.titleSection}>
                        <h1>📊 Gestión de Evaluaciones</h1>
                        <p>Administra evaluaciones y calificaciones</p>
                    </div>
                    <div className={styles.logoSection}>
                        <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.controlsSection}>
                    <div className={styles.courseSelector}>
                        <label htmlFor="course">Seleccionar Curso:</label>
                        <select 
                            id="course"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">Seleccione un curso</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button 
                        onClick={handleSaveGrades}
                        disabled={!selectedCourse}
                        className={styles.saveButton}
                    >
                        Guardar Calificaciones
                    </button>
                </div>

                {selectedCourse && (
                    <div className={styles.gradesSection}>
                        <h2>Calificaciones - {courses.find(c => c.id === selectedCourse)?.name}</h2>
                        
                        <div className={styles.gradesTable}>
                            <div className={styles.tableHeader}>
                                <span>Alumno</span>
                                <span>Calificación (0-100)</span>
                                <span>Estado</span>
                            </div>
                            
                            {students.map(student => (
                                <div key={student.id} className={styles.tableRow}>
                                    <span className={styles.studentName}>{student.name}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={grades[student.id] || ''}
                                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                        className={styles.gradeInput}
                                    />
                                    <span className={styles.status}>
                                        {grades[student.id] >= 70 ? '✅ Aprobado' : 
                                         grades[student.id] ? '❌ Reprobado' : '⏳ Pendiente'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.statsSection}>
                    <h3>Estadísticas del Curso</h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>
                                {students.filter(s => grades[s.id] >= 70).length}
                            </span>
                            <span className={styles.statLabel}>Aprobados</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>
                                {students.filter(s => grades[s.id] && grades[s.id] < 70).length}
                            </span>
                            <span className={styles.statLabel}>Reprobados</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>
                                {students.filter(s => !grades[s.id]).length}
                            </span>
                            <span className={styles.statLabel}>Pendientes</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>
                                {Object.values(grades).filter(g => g).length > 0 ? 
                                 Math.round(Object.values(grades).filter(g => g).reduce((a, b) => parseInt(a) + parseInt(b), 0) / 
                                 Object.values(grades).filter(g => g).length) : 0}
                            </span>
                            <span className={styles.statLabel}>Promedio General</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}