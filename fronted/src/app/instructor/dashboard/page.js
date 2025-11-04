// app/instructor/page.js - MEJORADA SECCIÓN PRÓXIMOS CURSOS
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

    // Datos de ejemplo mejorados para próximos cursos
    const obtenerProximosCursos = () => {
        return [
            {
                id: 19,
                nombre: "Trabajos en Espacios Confinados (NOM-033)",
                fecha: "2025-11-15",
                horaInicio: "09:00",
                horaFin: "17:00",
                lugar: "Planta Principal, Saltillo",
                empresa: "Cementos Mexicanos",
                estudiantes: 8,
                duracion: "8 horas",
                estado: "Confirmado"
            },
            {
                id: 24,
                nombre: "Bloqueo y Etiquetado (LOTO)",
                fecha: "2025-11-18",
                horaInicio: "08:00",
                horaFin: "16:00",
                lugar: "Area de Taller, Ramos Arizpe",
                empresa: "Automotriz GM",
                estudiantes: 12,
                duracion: "8 horas",
                estado: "Programado"
            },
            {
                id: 25,
                nombre: "Primeros Auxilios y RCP",
                fecha: "2025-11-22",
                horaInicio: "10:00",
                horaFin: "14:00",
                lugar: "Sala de Capacitación, Saltillo",
                empresa: "Hospital Regional",
                estudiantes: 15,
                duracion: "4 horas",
                estado: "Pendiente"
            }
        ];
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
                    stps: "STPS-MP-004"
                },
                { 
                    id: 3, 
                    nombre: "Seguridad Industrial", 
                    fechaIngreso: "2025-04-22", 
                    lugar: "Area de simulacion",
                    estado: "Activo", 
                    alumnosInscritos: 7,
                    stps: "STPS-IC-003"
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
            const proximosCursos = obtenerProximosCursos();
            
            const datosDashboard = {
                estadisticas: { 
                    cursosActivos: cursosCargados.filter(c => c.estado === 'Activo').length, 
                    totalEstudiantes: cursosCargados.reduce((acc, cur) => acc + (cur.alumnosInscritos || 0), 0), 
                    cursosCompletados: 2, 
                    proximosCursos: proximosCursos.length 
                },
                instructor: { 
                    id: userData?.id,
                    nombre: userData?.name || 'Instructor',
                    especialidad: "Seguridad Industrial", 
                    email: userData?.email
                },
                proximosCursos: proximosCursos
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
                                <span className={styles.statNumber}>18</span>
                                <span className={styles.statLabel}>Por Evaluar</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📷</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>24</span>
                                <span className={styles.statLabel}>Evidencias</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Próximos cursos - MEJORADO */}
                <div className={styles.upcomingSection}>
                    <div className={styles.sectionHeader}>
                        <h3>📅 Próximos Cursos</h3>
                        <p>Tu agenda de capacitaciones programadas</p>
                    </div>
                    
                    <div className={styles.upcomingGrid}>
                        {dashboard?.proximosCursos?.map((curso, index) => (
                            <div key={curso.id} className={styles.cursoCard}>
                                <div className={styles.cursoHeader}>
                                    <h4 className={styles.cursoTitulo}>{curso.nombre}</h4>
                                    <span className={`${styles.cursoEstado} ${getEstadoColor(curso.estado)}`}>
                                        {curso.estado}
                                    </span>
                                </div>
                                
                                <div className={styles.cursoInfo}>
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
                                            <span>{curso.estudiantes} inscritos</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={styles.cursoActions}>
                                    <Link 
                                        href={`/instructor/evaluaciones?curso=${curso.id}`}
                                        className={styles.btnPreparar}
                                    >
                                        📝 Preparar Evaluación
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {(!dashboard?.proximosCursos || dashboard.proximosCursos.length === 0) && (
                        <div className={styles.noCursos}>
                            <div className={styles.noCursosIcon}>📅</div>
                            <h4>No hay cursos programados</h4>
                            <p>No tienes cursos programados para las próximas semanas.</p>
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