// app/instructor/cursos/page.js - PÁGINA SIMPLIFICADA DE CURSOS
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Cursos.module.css';

// Componente de Notificación
const NotificationToast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icon = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

    return (
        <div className={`${styles.notification} ${styles[type]}`}>
            <span className={styles.notificationIcon}>{icon[type]}</span>
            <span className={styles.notificationMessage}>{message}</span>
            <button onClick={onClose} className={styles.notificationClose}>×</button>
            <div className={styles.notificationProgress}></div>
        </div>
    );
};

export default function CursosPage() {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const router = useRouter();

    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
    };
    
    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    const getUserData = () => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            return userData;
        } catch (error) {
            console.error('Error obteniendo datos del usuario:', error);
            return null;
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '';
        try {
            return new Date(fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return fecha;
        }
    };

    const determinarEstadoCurso = (fechaIngreso) => {
        if (!fechaIngreso) return 'Programado';
        
        const hoy = new Date();
        const fechaCurso = new Date(fechaIngreso);
        
        if (fechaCurso < hoy) return 'Finalizado';
        
        const unaSemanaDespues = new Date();
        unaSemanaDespues.setDate(hoy.getDate() + 7);
        
        if (fechaCurso <= unaSemanaDespues) return 'Activo';
        
        return 'Programado';
    };

    const obtenerCursosPorInstructor = (instructorId) => {
        if (instructorId === 3) {
            return [
                { 
                    id: 2, 
                    nombre: "Manejo de Materiales y Residuos Peligrosos", 
                    fechaIngreso: "2025-04-02", 
                    lugar: "Patio de Maniobras",
                    estado: "Activo",
                    alumnosInscritos: 7,
                    stps: "STPS-MP-004",
                    horas: 8,
                    empresa: "Industrias PEMEX",
                    instructor: "Ana Solis"
                },
                { 
                    id: 3, 
                    nombre: "Seguridad Industrial", 
                    fechaIngreso: "2025-04-22", 
                    lugar: "Area de simulacion",
                    estado: "Activo", 
                    alumnosInscritos: 7,
                    stps: "STPS-IC-003",
                    horas: 16,
                    empresa: "Grupo Modelo",
                    instructor: "Ana Solis"
                },
                { 
                    id: 19, 
                    nombre: "Trabajos en Espacios Confinados (NOM-033)", 
                    fechaIngreso: "2025-11-05", 
                    lugar: "Planta Principal",
                    estado: "Programado",
                    alumnosInscritos: 0,
                    stps: "BEYCO-NOM33-2015",
                    horas: 8,
                    empresa: "Cementos Mexicanos",
                    instructor: "Ana Solis"
                },
                { 
                    id: 17, 
                    nombre: "Trabajos en Alturas (NOM-009)", 
                    fechaIngreso: "2025-03-15", 
                    lugar: "Torre de Prácticas",
                    estado: "Finalizado",
                    alumnosInscritos: 12,
                    stps: "BEYCO-NOM09-2011",
                    horas: 24,
                    empresa: "Constructora ALFA",
                    instructor: "Ana Solis"
                }
            ];
        }
        return [];
    };

    const cargarDatos = async () => {
        try {
            const userData = getUserData();
            if (!userData) {
                router.push('/');
                return;
            }

            // Simular carga de datos
            setTimeout(() => {
                const cursosCargados = obtenerCursosPorInstructor(userData?.id);
                // Procesar estados de los cursos
                const cursosProcesados = cursosCargados.map(curso => ({
                    ...curso,
                    estado: determinarEstadoCurso(curso.fechaIngreso)
                }));
                setCursos(cursosProcesados);
                setLoading(false);
            }, 1000);
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            showNotification('Error al cargar los cursos', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    return (
        <div className={styles.pageContainer}>
            {/* Notificaciones */}
            {notification.show && (
                <NotificationToast 
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Mis Cursos</h1>
                    <p>Consulta tus cursos asignados</p>
                </div>
                <div className={styles.logoSection}>
                    <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
                    <div className={styles.logoText}>
                        <span className={styles.logoTitle}></span>
                        <span className={styles.logoSubtitle}></span>
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
  

                {/* Tabla de Cursos */}
                <div className={styles.tableContainer}>
                    <div className={styles.tableHeader}>
                        <h3>Cursos Asignados</h3>
                        <div className={styles.tableActions}>
                            <span className={styles.totalCursos}>
                                {cursos.length} curso(s) encontrado(s)
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Cargando cursos...</p>
                        </div>
                    ) : (
                        <table className={styles.cursosTable}>
                            <thead>
                                <tr>
                                    <th>Curso</th>
                                    <th>Fecha</th>
                                    <th>Lugar</th>
                                    <th>Empresa</th>
                                    <th>Estudiantes</th>
                                    <th>Horas</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursos.length > 0 ? (
                                    cursos.map(curso => (
                                        <tr key={curso.id}>
                                            <td>
                                                <div className={styles.cursoInfo}>
                                                    <strong className={styles.cursoNombre}>{curso.nombre}</strong>
                                                    <div className={styles.cursoDetalles}>
                                                        <span className={styles.cursoClave}>Clave: {curso.stps}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.fechaInfo}>
                                                    <span className={styles.fechaPrincipal}>{formatFecha(curso.fechaIngreso)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.lugar}>{curso.lugar}</span>
                                            </td>
                                            <td>
                                                <span className={styles.empresa}>{curso.empresa}</span>
                                            </td>
                                            <td>
                                                <div className={styles.estudiantesInfo}>
                                                    <span className={styles.cantidadEstudiantes}>{curso.alumnosInscritos}</span>
                                                    <span className={styles.estudiantesLabel}>estudiantes</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.horas}>{curso.horas}h</span>
                                            </td>
                                            <td>
                                                <span className={`${styles.status} ${styles[curso.estado?.toLowerCase()]}`}>
                                                    {curso.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className={styles.noData}>
                                            <div className={styles.noDataContent}>
                                                <div className={styles.noDataIcon}>📚</div>
                                                <h4>No hay cursos asignados</h4>
                                                <p>Actualmente no tienes cursos asignados.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Botón volver */}
                <div className={styles.actionsSection}>
                    <Link href="/instructor/dashboard" className={styles.btnVolver}>
                        ← Volver 
                    </Link>
                </div>
            </main>
        </div>
    );
}