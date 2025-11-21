// app/instructor/page.js - CON CURSOS REALES DEL INSTRUCTOR
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Dashboard.module.css';

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

export default function InstructorDashboard() {
    const [dashboard, setDashboard] = useState(null);
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

    const obtenerCursosPorInstructor = (instructorId) => {
        if (instructorId === 3) {
            return [
                { 
                    id: 2, 
                    nombre: "Manejo de Materiales y Residuos Peligrosos", 
                    fechaIngreso: "2025-04-02", 
                    lugar: "Patio de Maniobras",
                    estado: "Activo",
                    stps: "STPS-MP-004",
                    empresa: "Empresa Asignada",
                    horaInicio: "09:00",
                    horaFin: "17:00",
                    duracion: "8 horas",
                    cantidadEstudiantes: 7,
                    pago: 2000.00
                },
                { 
                    id: 19, 
                    nombre: "Trabajos en Espacios Confinados (NOM-033)", 
                    fechaIngreso: "2025-11-05", 
                    lugar: "Cocina",
                    estado: "Activo", 
                    stps: "BEYCO-NOM33-2015",
                    empresa: "Empresa Asignada",
                    horaInicio: "08:00",
                    horaFin: "16:00",
                    duracion: "8 horas",
                    cantidadEstudiantes: 0,
                    pago: 2000.00
                },
                { 
                    id: 25, 
                    nombre: "Soporte Vital Básico (BLS)", 
                    fechaIngreso: "2025-11-20", 
                    lugar: "Auditorio B, Servicios Corporativos",
                    estado: "Activo", 
                    stps: "BEY-SOP-001",
                    empresa: "Empresa Asignada",
                    horaInicio: "10:00",
                    horaFin: "14:00",
                    duracion: "4 horas",
                    cantidadEstudiantes: 5,
                    pago: 1200.00
                },
                { 
                    id: 26, 
                    nombre: "Manejo de Materiales y Residuos Peligrosos", 
                    fechaIngreso: "2025-11-02", 
                    lugar: "sdfbcfxdas",
                    estado: "Activo", 
                    stps: "STPS-MP-004",
                    empresa: "Empresa Asignada",
                    horaInicio: "09:00",
                    horaFin: "17:00",
                    duracion: "8 horas",
                    cantidadEstudiantes: 0,
                    pago: 1800.00
                }
            ];
        }
        return [];
    };

    const cargarDashboard = async () => {
        try {
            const userData = getUserData();
            
            if (!userData) {
                showNotification('No se encontraron datos de usuario. Redirigiendo al login...', 'error');
                setTimeout(() => router.push('/'), 2000);
                return;
            }

            const cursosCargados = obtenerCursosPorInstructor(userData?.id);
            
            // Convertir los cursos asignados a formato de "próximos cursos"
            const proximosCursos = cursosCargados.map(curso => ({
                id: curso.id,
                nombre: curso.nombre,
                fecha: curso.fechaIngreso,
                horaInicio: curso.horaInicio || "09:00",
                horaFin: curso.horaFin || "17:00",
                lugar: curso.lugar,
                empresa: curso.empresa || "Por asignar",
                cantidadEstudiantes: curso.cantidadEstudiantes || 0,
                duracion: curso.duracion || "8 horas",
                estado: curso.estado === "Activo" ? "Confirmado" : "Programado",
                stps: curso.stps,
                pago: curso.pago
            }));
            
            const datosDashboard = {
                estadisticas: { 
                    cursosActivos: cursosCargados.filter(c => c.estado === 'Activo').length, 
                    totalEstudiantes: cursosCargados.reduce((acc, cur) => acc + (cur.cantidadEstudiantes || 0), 0), 
                    cursosCompletados: 2, 
                    proximosCursos: proximosCursos.length 
                },
                instructor: { 
                    id: userData?.id,
                    nombre: userData?.name || 'Instructor',
                    especialidad: "Seguridad Industrial", 
                    email: userData?.email
                },
                proximosCursos: proximosCursos,
                cursosAsignados: cursosCargados
            };
            
            setDashboard(datosDashboard);
            
        } catch (error) {
            console.error('Error cargando dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCerrarSesion = () => {
        localStorage.removeItem('userData');
        showNotification('Sesión cerrada correctamente', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '';
        try {
            return new Date(fecha).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return fecha;
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado.toLowerCase()) {
            case 'confirmado':
            case 'activo':
                return styles.estadoConfirmado;
            case 'programado':
                return styles.estadoProgramado;
            case 'pendiente':
                return styles.estadoPendiente;
            default:
                return styles.estadoProgramado;
        }
    };

    useEffect(() => {
        cargarDashboard();
    }, []);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Cargando dashboard...</p>
            </div>
        );
    }

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
                    <h1>Panel del Instructor</h1>
                    <p>Gestiona tus cursos y actividades</p>
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
                {/* Mensaje de bienvenida */}
                <div className={styles.welcomeSection}>
                    <div className={styles.welcomeCard}>
                        <div className={styles.welcomeIcon}>👋</div>
                        <div className={styles.welcomeText}>
                            <h2>¡Bienvenido de nuevo, {dashboard?.instructor?.nombre}!</h2>
                            <p>{dashboard?.instructor?.especialidad} | {dashboard?.instructor?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navegación principal */}
                <div className={styles.navigationGrid}>
                    <Link href="/instructor/cursos" className={styles.navCard}>
                        <div className={styles.cardIcon}>📚</div>
                        <div className={styles.cardContent}>
                            <h3>Mis Cursos</h3>
                            <p>Consulta todos tus cursos asignados</p>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                    </Link>

                    <Link href="/instructor/evaluaciones" className={styles.navCard}>
                        <div className={styles.cardIcon}>📝</div>
                        <div className={styles.cardContent}>
                            <h3>Evaluaciones</h3>
                            <p>Califica estudiantes y registra resultados</p>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                    </Link>

                    <Link href="/instructor/evidencia" className={styles.navCard}>
                        <div className={styles.cardIcon}>📷</div>
                        <div className={styles.cardContent}>
                            <h3>Evidencia</h3>
                            <p>Sube fotos y documentos de las sesiones</p>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                    </Link>

                    <Link href="/instructor/honorarios" className={styles.navCard}>
                        <div className={styles.cardIcon}>💰</div>
                        <div className={styles.cardContent}>
                            <h3>Mis Honorarios</h3>
                            <p>Consulta tus pagos y estados de cuenta</p>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                    </Link>
                </div>

                {/* Estadísticas rápidas */}
                <div className={styles.statsSection}>
                    <h3>Resumen de Actividades</h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📚</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>{dashboard?.estadisticas?.cursosActivos || 0}</span>
                                <span className={styles.statLabel}>Cursos Activos</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>👥</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>{dashboard?.estadisticas?.totalEstudiantes || 0}</span>
                                <span className={styles.statLabel}>Estudiantes</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📝</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>{dashboard?.estadisticas?.totalEstudiantes || 0}</span>
                                <span className={styles.statLabel}>Por Evaluar</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📷</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>{dashboard?.proximosCursos?.length * 3 || 0}</span>
                                <span className={styles.statLabel}>Evidencias</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Próximos cursos - CON CURSOS REALES */}
                <div className={styles.upcomingSection}>
                    <div className={styles.sectionHeader}>
                        <h3>📅 Mis Cursos Asignados</h3>
                        <p>Cursos activos y programados</p>
                    </div>
                    
                    {dashboard?.proximosCursos && dashboard.proximosCursos.length > 0 ? (
                        <div className={styles.upcomingGrid}>
                            {dashboard.proximosCursos.map((curso) => (
                                <div key={curso.id} className={styles.cursoCard}>
                                    <div className={styles.cursoHeader}>
                                        <h4 className={styles.cursoTitulo}>{curso.nombre}</h4>
                                        <span className={`${styles.cursoEstado} ${getEstadoColor(curso.estado)}`}>
                                            {curso.estado}
                                        </span>
                                    </div>
                                    
                                    <div className={styles.cursoInfo}>
                                        {curso.stps && (
                                            <div className={styles.infoRow}>
                                                <span className={styles.infoIcon}>📋</span>
                                                <div className={styles.infoContent}>
                                                    <strong>Código STPS:</strong>
                                                    <span>{curso.stps}</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoIcon}>📅</span>
                                            <div className={styles.infoContent}>
                                                <strong>{formatFecha(curso.fecha)}</strong>
                                                <span>{curso.horaInicio} - {curso.horaFin} ({curso.duracion})</span>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoIcon}>📍</span>
                                            <div className={styles.infoContent}>
                                                <strong>Lugar:</strong>
                                                <span>{curso.lugar}</span>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoIcon}>🏢</span>
                                            <div className={styles.infoContent}>
                                                <strong>Empresa:</strong>
                                                <span>{curso.empresa}</span>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoIcon}>👥</span>
                                            <div className={styles.infoContent}>
                                                <strong>Estudiantes:</strong>
                                                <span>{curso.cantidadEstudiantes} inscritos</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.cursoActions}>

                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noCursos}>
                            <div className={styles.noCursosIcon}>📅</div>
                            <h4>No hay cursos asignados</h4>
                            <p>Actualmente no tienes cursos asignados. Contacta al administrador para más información.</p>
                        </div>
                    )}
                </div>

                {/* Botón de cerrar sesión */}
                <div className={styles.actionsSection}>
                    <button onClick={handleCerrarSesion} className={styles.logoutButton}>
                        <span className={styles.logoutIcon}>🚪</span>
                        Cerrar Sesión
                    </button>
                </div>
            </main>
        </div>
    );
}