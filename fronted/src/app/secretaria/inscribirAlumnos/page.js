'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './InscribirAlumnos.module.css';

export default function InscribirAlumnos() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        curso: '',
        fechaInscripcion: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica para guardar la inscripción
        console.log('Datos de inscripción:', formData);
        alert('Alumno inscrito exitosamente');
        // Redirigir al dashboard o limpiar el formulario
        router.push('/secretaria');
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
                        <h1>📋 Inscribir Alumnos</h1>
                        <p>Gestiona las inscripciones de nuevos alumnos</p>
                    </div>
                    <div className={styles.logoSection}>
                        <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h2>Formulario de Inscripción</h2>
                        <p>Complete los datos del alumno para la inscripción</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.inscriptionForm}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="nombre">Nombre</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="apellido">Apellido</label>
                                <input
                                    type="text"
                                    id="apellido"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="telefono">Teléfono</label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="curso">Curso</label>
                                <select
                                    id="curso"
                                    name="curso"
                                    value={formData.curso}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione un curso</option>
                                    <option value="seguridad-industrial">Seguridad Industrial</option>
                                    <option value="primeros-auxilios">Primeros Auxilios</option>
                                    <option value="gestion-ambiental">Gestión Ambiental</option>
                                    <option value="prevencion-riesgos">Prevención de Riesgos</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="fechaInscripcion">Fecha de Inscripción</label>
                                <input
                                    type="date"
                                    id="fechaInscripcion"
                                    name="fechaInscripcion"
                                    value={formData.fechaInscripcion}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button 
                                type="button" 
                                onClick={() => router.push('/secretaria')}
                                className={styles.cancelButton}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                className={styles.submitButton}
                            >
                                Inscribir Alumno
                            </button>
                        </div>
                    </form>
                </div>

                <div className={styles.quickStats}>
                    <h3>Inscripciones del Mes</h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>24</span>
                            <span className={styles.statLabel}>Nuevas Inscripciones</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>156</span>
                            <span className={styles.statLabel}>Total Alumnos</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>89%</span>
                            <span className={styles.statLabel}>Tasa de Completación</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}