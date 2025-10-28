'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

// Modal de Confirmación
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.confirmModal}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className={styles.modalButtons}>
                    <button onClick={onConfirm} className={styles.btnEliminar}>
                        Aceptar
                    </button>
                    <button onClick={onClose} className={styles.btnCancelar}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function InstructorDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('cursos');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    // Estados para las diferentes secciones
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [alumnosCurso, setAlumnosCurso] = useState([]);
    const [cursoEvidencia, setCursoEvidencia] = useState('');
    const [archivos, setArchivos] = useState([]);

    const router = useRouter();

    // Función para mostrar notificaciones
    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
    };
    
    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    // Obtener datos del usuario logueado
    const getUserData = () => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            console.log('👤 Datos del usuario:', userData);
            return userData;
        } catch (error) {
            console.error('Error obteniendo datos del usuario:', error);
            return null;
        }
    };

    useEffect(() => {
        cargarDashboard();
        cargarCursosInstructor();
    }, []);

    const cargarDashboard = async () => {
        try {
            const userData = getUserData();
            
            if (!userData) {
                showNotification('No se encontraron datos de usuario. Redirigiendo al login...', 'error');
                setTimeout(() => router.push('/'), 2000);
                return;
            }

            console.log('📊 Cargando dashboard para:', userData.name);
            
            // Usar datos mock para el dashboard
            const datosDashboard = obtenerDatosEjemplo(userData);
            setDashboard(datosDashboard);
            
        } catch (error) {
            console.error('Error cargando dashboard:', error);
            const userData = getUserData();
            setDashboard(obtenerDatosEjemplo(userData));
        } finally {
            setLoading(false);
        }
    };

    const cargarCursosInstructor = async () => {
        try {
            const userData = getUserData();
            
            if (!userData) {
                showNotification('No se pudo identificar al instructor', 'error');
                return;
            }

            const instructorId = userData.id || userData.num_empleado;
            console.log('📚 Cargando cursos para instructor ID:', instructorId);

            // Simular carga de cursos (modo desarrollo)
            setTimeout(() => {
                const cursosInstructor = obtenerCursosPorInstructor(instructorId);
                setCursos(cursosInstructor);
                console.log('✅ Cursos cargados:', cursosInstructor);
            }, 1000);

        } catch (error) {
            console.error('Error cargando cursos:', error);
            const userData = getUserData();
            const cursosInstructor = obtenerCursosPorInstructor(userData?.id);
            setCursos(cursosInstructor);
        }
    };

    const cargarAlumnosPorCurso = async (cursoId) => {
        try {
            console.log('🎓 Cargando alumnos para curso ID:', cursoId);
            
            // Simular carga de alumnos
            setTimeout(() => {
                const alumnos = obtenerAlumnosPorCurso(cursoId);
                setAlumnosCurso(alumnos);
                console.log('✅ Alumnos cargados:', alumnos);
            }, 1000);

        } catch (error) {
            console.error('Error cargando alumnos:', error);
            setAlumnosCurso(obtenerAlumnosPorCurso(cursoId));
        }
    };

    // Datos de ejemplo basados en el instructor
    const obtenerDatosEjemplo = (userData) => {
        const cursosInstructor = obtenerCursosPorInstructor(userData?.id);
        const cursosActivos = cursosInstructor.filter(c => c.estado === 'Activo').length;
        const cursosProgramados = cursosInstructor.filter(c => c.estado === 'Programado').length;
        const totalEstudiantes = cursosInstructor.reduce((acc, cur) => acc + (cur.alumnosInscritos || 0), 0);

        return {
            estadisticas: { 
                cursosActivos, 
                totalEstudiantes, 
                cursosCompletados: 0, 
                proximaSesion: cursosProgramados 
            },
            instructor: { 
                id: userData?.id,
                nombre: userData?.name || 'Instructor',
                especialidad: "Seguridad Industrial", 
                email: userData?.email, 
                telefono: "+52 55 1234 5678" 
            }
        };
    };

    // Cursos específicos por instructor
    const obtenerCursosPorInstructor = (instructorId) => {
        // Cursos para Ana Solis (ID 3)
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
                    tieneExamenPractico: true
                },
                { 
                    id: 3, 
                    nombre: "Seguridad Industrial", 
                    fechaIngreso: "2025-04-22", 
                    lugar: "Area de simulacion",
                    estado: "Activo", 
                    alumnosInscritos: 7,
                    stps: "STPS-IC-003",
                    tieneExamenPractico: true
                },
                { 
                    id: 19, 
                    nombre: "Trabajos en Espacios Confinados (NOM-033)", 
                    fechaIngreso: "2025-11-05", 
                    lugar: "Cocina",
                    estado: "Programado",
                    alumnosInscritos: 0,
                    stps: "BEYCO-NOM33-2015",
                    tieneExamenPractico: false
                }
            ];
        }
        
        // Cursos para otros instructores (ejemplo)
        return [
            { 
                id: 17, 
                nombre: "Trabajos en Alturas (NOM-009)", 
                fechaIngreso: "2025-10-25", 
                lugar: "Planta de Ensamblaje, Ramos Arizpe",
                estado: "Activo",
                alumnosInscritos: 1,
                stps: "BEYCO-NOM09-2011",
                tieneExamenPractico: true
            },
            { 
                id: 18, 
                nombre: "Seguridad Industrial", 
                fechaIngreso: "2025-10-28", 
                lugar: "Almacen Principal, Saltillo",
                estado: "Activo",
                alumnosInscritos: 0,
                stps: "BEYCO-LOTO-001",
                tieneExamenPractico: false
            }
        ];
    };

    const obtenerAlumnosPorCurso = (cursoId) => {
        // Base de datos real de alumnos por curso según tu estructura
        const alumnosPorCurso = {
            2: [ // Manejo de Materiales y Residuos Peligrosos
                {
                    curp: 'AGSA940214TSLAS06',
                    nombre: 'Alejandra',
                    apellidoPaterno: 'Aguirre',
                    apellidoMaterno: 'Soto',
                    calificacion: 0,
                    asistencia: '85%'
                },
                {
                    curp: 'AGSA940214TSLAS12',
                    nombre: 'Enrique',
                    apellidoPaterno: 'Vazque',
                    apellidoMaterno: 'Garcia',
                    calificacion: 0,
                    asistencia: '90%'
                },
                {
                    curp: 'GAMA991208CHLVF10',
                    nombre: 'Monica',
                    apellidoPaterno: 'Garcia',
                    apellidoMaterno: 'Mena',
                    calificacion: 0,
                    asistencia: '92%'
                },
                {
                    curp: 'GUER890125HCSLS07',
                    nombre: 'Rosa',
                    apellidoPaterno: 'Gutierrez',
                    apellidoMaterno: 'Estrada',
                    calificacion: 0,
                    asistencia: '88%'
                },
                {
                    curp: 'LEOL960718HCMCC03',
                    nombre: 'Laura',
                    apellidoPaterno: 'Leon',
                    apellidoMaterno: 'Mendoza',
                    calificacion: 0,
                    asistencia: '95%'
                },
                {
                    curp: 'MAJA930510HCASR09',
                    nombre: 'Javier',
                    apellidoPaterno: 'Martinez',
                    apellidoMaterno: 'Alvarado',
                    calificacion: 0,
                    asistencia: '78%'
                },
                {
                    curp: 'ROBH850402HCALC01',
                    nombre: 'Hector',
                    apellidoPaterno: 'Rodriguez',
                    apellidoMaterno: 'Baez',
                    calificacion: 0,
                    asistencia: '82%'
                }
            ],
            3: [ // Seguridad Industrial
                {
                    curp: 'AGSA940214TSLAS06',
                    nombre: 'Alejandra',
                    apellidoPaterno: 'Aguirre',
                    apellidoMaterno: 'Soto',
                    calificacion: 0,
                    asistencia: '85%'
                },
                {
                    curp: 'AJSFDSJKAFJK',
                    nombre: 'sdfdjsbsfjk',
                    apellidoPaterno: 'sdfajkdbfjkaebk',
                    apellidoMaterno: 'fsdajksdab',
                    calificacion: 0,
                    asistencia: '70%'
                },
                {
                    curp: 'CRUB750305JLMCC02',
                    nombre: 'Benito',
                    apellidoPaterno: 'Cruz',
                    apellidoMaterno: 'Robles',
                    calificacion: 0,
                    asistencia: '100%'
                },
                {
                    curp: 'DIPL910908MNLRR04',
                    nombre: 'Pablo',
                    apellidoPaterno: 'Diaz',
                    apellidoMaterno: 'Luna',
                    calificacion: 0,
                    asistencia: '95%'
                },
                {
                    curp: 'GAMA991208CHLVF10',
                    nombre: 'Monica',
                    apellidoPaterno: 'Garcia',
                    apellidoMaterno: 'Mena',
                    calificacion: 0,
                    asistencia: '90%'
                },
                {
                    curp: 'GUER890125HCSLS07',
                    nombre: 'Rosa',
                    apellidoPaterno: 'Gutierrez',
                    apellidoMaterno: 'Estrada',
                    calificacion: 0,
                    asistencia: '88%'
                },
                {
                    curp: 'MAJA930510HCASR09',
                    nombre: 'Javier',
                    apellidoPaterno: 'Martinez',
                    apellidoMaterno: 'Alvarado',
                    calificacion: 0,
                    asistencia: '92%'
                }
            ],
            17: [ // Trabajos en Alturas
                {
                    curp: 'vsadsfv,flj',
                    nombre: 'Juan',
                    apellidoPaterno: 'Pérez',
                    apellidoMaterno: 'García',
                    calificacion: 0,
                    asistencia: '0%'
                }
            ],
            18: [], // Seguridad Industrial - sin alumnos
            19: [], // Trabajos en Espacios Confinados - sin alumnos
            20: [], // Trabajos en Espacios Confinados - sin alumnos
            24: []  // Bloqueo y Etiquetado - sin alumnos
        };

        return alumnosPorCurso[cursoId] || [];
    };

    const handleCalificarAlumno = (alumnoCurp, calificacion) => {
        console.log(`📝 Calificando alumno ${alumnoCurp}:`, calificacion);
        
        // Aquí deberías hacer la llamada a tu API para guardar en la base de datos
        // Por ahora simulamos el guardado
        showNotification(`Calificación guardada para ${alumnoCurp}: ${calificacion.resultado}`, 'success');
        
        // En una implementación real, aquí harías:
        // await api.guardarCalificacion(alumnoCurp, cursoSeleccionado, calificacion);
    };

    const handleSubirEvidencia = (cursoId, archivos) => {
        console.log(`📷 Subiendo evidencia para curso ${cursoId}:`, archivos);
        showNotification('Evidencia subida correctamente', 'success');
    };

    const handleCerrarSesion = () => {
        console.log('🚪 Cerrando sesión...');
        
        // Limpiar datos de sesión
        localStorage.removeItem('userData');
        localStorage.removeItem('instructorId');
        
        // Mostrar notificación
        showNotification('Sesión cerrada correctamente', 'success');
        
        // Redirigir inmediatamente al login (que está en la raíz '/')
        setTimeout(() => {
            console.log('🔀 Redirigiendo a / (login)');
            window.location.href = '/';
        }, 1000);
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Notificaciones */}
            {notification.show && (
                <NotificationToast 
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}

            {/* Modal de Confirmación */}
            <ConfirmModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                onConfirm={confirmation.onConfirm}
                title={confirmation.title}
                message={confirmation.message}
            />

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.userInfo}>
                    <h1>¡Bienvenido, {dashboard?.instructor?.nombre}!</h1>
                    <p>{dashboard?.instructor?.especialidad}</p>
                    <small>{dashboard?.instructor?.email}</small>
                </div>
                <div className={styles.logo}>
                    <h2>BEYCO</h2>
                    <span>Consultores</span>
                </div>
            </header>

            {/* Navegación */}
            <nav className={styles.tabs}>
                <button 
                    className={activeTab === 'cursos' ? styles.active : ''} 
                    onClick={() => setActiveTab('cursos')}
                >
                    📚 Cursos
                </button>
                <button 
                    className={activeTab === 'evaluaciones' ? styles.active : ''} 
                    onClick={() => setActiveTab('evaluaciones')}
                >
                    📝 Evaluaciones
                </button>
                <button 
                    className={activeTab === 'evidencia' ? styles.active : ''} 
                    onClick={() => setActiveTab('evidencia')}
                >
                    📷 Evidencia
                </button>
                <button 
                    className={activeTab === 'honorarios' ? styles.active : ''} 
                    onClick={() => setActiveTab('honorarios')}
                >
                    💰 Honorarios
                </button>
                <button 
                    className={styles.btnCerrarSesion} 
                    onClick={handleCerrarSesion}
                >
                    🚪 Cerrar Sesión
                </button>
            </nav>

            {/* Contenido Principal */}
            <main className={styles.mainContent}>
                {activeTab === 'cursos' && (
                    <VistaCursos 
                        cursos={cursos} 
                        dashboard={dashboard}
                    />
                )}
                {activeTab === 'evaluaciones' && (
                    <VistaEvaluaciones 
                        cursos={cursos}
                        cursoSeleccionado={cursoSeleccionado}
                        setCursoSeleccionado={setCursoSeleccionado}
                        alumnosCurso={alumnosCurso}
                        cargarAlumnosPorCurso={cargarAlumnosPorCurso}
                        onCalificarAlumno={handleCalificarAlumno}
                    />
                )}
                {activeTab === 'evidencia' && (
                    <VistaEvidencia 
                        cursos={cursos}
                        cursoEvidencia={cursoEvidencia}
                        setCursoEvidencia={setCursoEvidencia}
                        archivos={archivos}
                        onSubirEvidencia={handleSubirEvidencia}
                    />
                )}
                {activeTab === 'honorarios' && (
                    <VistaHonorarios />
                )}
            </main>
        </div>
    );
}

// Componente para la vista de Cursos
function VistaCursos({ cursos, dashboard }) {
    const formatFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleDateString('es-ES');
    };

    return (
        <div className={styles.vistaCursos}>
            <div className={styles.welcome}>
                <h2>Mis Cursos Activos</h2>
                <h3>Gestión de cursos asignados</h3>
            </div>

            {/* Estadísticas */}
            <div className={styles.estadisticasGrid}>
                <div className={styles.tarjetaEstadistica}>
                    <h3>Cursos Activos</h3>
                    <div className={styles.numero}>{dashboard?.estadisticas?.cursosActivos || 0}</div>
                </div>
                <div className={styles.tarjetaEstadistica}>
                    <h3>Total Estudiantes</h3>
                    <div className={styles.numero}>{dashboard?.estadisticas?.totalEstudiantes || 0}</div>
                </div>
                <div className={styles.tarjetaEstadistica}>
                    <h3>Próximos Cursos</h3>
                    <div className={styles.numero}>{dashboard?.estadisticas?.proximaSesion || 0}</div>
                </div>
            </div>

            {/* Tabla de Cursos */}
            <div className={styles.tableContainer}>
                <table className={styles.cursosTable}>
                    <thead>
                        <tr>
                            <th>Nombre del Curso</th>
                            <th>Fecha</th>
                            <th>Lugar</th>
                            <th>Alumnos Inscritos</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cursos.length > 0 ? (
                            cursos.map(curso => (
                                <tr key={curso.id}>
                                    <td>
                                        <strong>{curso.nombre}</strong>
                                        <br />
                                        <small>Clave: {curso.stps || 'N/A'}</small>
                                    </td>
                                    <td>{formatFecha(curso.fechaIngreso)}</td>
                                    <td>{curso.lugar}</td>
                                    <td>{curso.alumnosInscritos || 0}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[curso.estado?.toLowerCase() || 'activo']}`}>
                                            {curso.estado || 'Activo'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                    No hay cursos asignados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Componente para la vista de Evaluaciones
// Componente para la vista de Evaluaciones
function VistaEvaluaciones({ 
    cursos, 
    cursoSeleccionado, 
    setCursoSeleccionado, 
    alumnosCurso, 
    cargarAlumnosPorCurso,
    onCalificarAlumno 
}) {
    const [calificaciones, setCalificaciones] = useState({});
    const [calificacionesGuardadas, setCalificacionesGuardadas] = useState({});

    const handleSeleccionarCurso = (cursoId) => {
        setCursoSeleccionado(cursoId);
        cargarAlumnosPorCurso(cursoId);
        // Reiniciar calificaciones cuando se cambia de curso
        setCalificaciones({});
        setCalificacionesGuardadas({});
    };

    const handleCalificacionChange = (alumnoCurp, campo, valor) => {
        // Validar que los números estén entre 0 y 100
        if (campo !== 'observaciones') {
            const numValue = parseInt(valor);
            if (numValue > 100) {
                valor = '100'; // Limitar a 100
            } else if (numValue < 0) {
                valor = '0'; // Limitar a 0
            } else if (isNaN(numValue)) {
                valor = ''; // Si no es número, vacío
            }
        }

        setCalificaciones(prev => ({
            ...prev,
            [alumnoCurp]: {
                ...prev[alumnoCurp],
                [campo]: campo === 'observaciones' ? valor : valor
            }
        }));
    };

    // Función para calcular el promedio basado en evaluación final y práctica
    const calcularPromedio = (evalFinal, evalPractica) => {
        const final = parseFloat(evalFinal) || 0;
        const practica = parseFloat(evalPractica) || 0;
        
        if (final > 0 || practica > 0) {
            return (final + practica) / 2;
        }
        return 0;
    };

    // Función para determinar si es APTO basado en el promedio y examen práctico
    const determinarResultado = (promedio, evalPractica, observaciones) => {
        // El examen práctico debe ser al menos 80% según las notas
        const practicoAprobado = (parseFloat(evalPractica) || 0) >= 80;
        const promedioAprobado = promedio >= 70; // Suponiendo 70 como mínimo para aprobar
        
        if (observaciones && observaciones.toLowerCase().includes('sin licencia')) {
            return 'NO APTO';
        }
        
        return practicoAprobado && promedioAprobado ? 'APTO' : 'NO APTO';
    };

    const guardarCalificaciones = () => {
        const calificacionesCompletas = {};
        let calificacionesGuardadasCount = 0;

        Object.entries(calificaciones).forEach(([curp, calif]) => {
            if (calif && (calif.evaluacionFinal !== undefined || calif.examenPractico !== undefined)) {
                const evalFinal = parseFloat(calif.evaluacionFinal) || 0;
                const evalPractica = parseFloat(calif.examenPractico) || 0;
                const promedio = calcularPromedio(evalFinal, evalPractica);
                const resultado = determinarResultado(promedio, evalPractica, calif.observaciones);
                
                const calificacionCompleta = {
                    evaluacionInicial: parseFloat(calif.evaluacionInicial) || 0,
                    evaluacionFinal: evalFinal,
                    examenPractico: evalPractica,
                    promedio,
                    resultado,
                    observaciones: calif.observaciones || ''
                };
                
                calificacionesCompletas[curp] = calificacionCompleta;
                onCalificarAlumno(curp, calificacionCompleta);
                calificacionesGuardadasCount++;
            }
        });

        if (calificacionesGuardadasCount > 0) {
            setCalificacionesGuardadas(prev => ({ ...prev, ...calificacionesCompletas }));
            setCalificaciones({});
        }
    };

    const guardarCalificacionIndividual = (alumnoCurp) => {
        const calif = calificaciones[alumnoCurp];
        if (calif && (calif.evaluacionFinal !== undefined || calif.examenPractico !== undefined)) {
            const evalFinal = parseFloat(calif.evaluacionFinal) || 0;
            const evalPractica = parseFloat(calif.examenPractico) || 0;
            const promedio = calcularPromedio(evalFinal, evalPractica);
            const resultado = determinarResultado(promedio, evalPractica, calif.observaciones);
            
            const calificacionCompleta = {
                evaluacionInicial: parseFloat(calif.evaluacionInicial) || 0,
                evaluacionFinal: evalFinal,
                examenPractico: evalPractica,
                promedio,
                resultado,
                observaciones: calif.observaciones || ''
            };
            
            onCalificarAlumno(alumnoCurp, calificacionCompleta);
            setCalificacionesGuardadas(prev => ({
                ...prev,
                [alumnoCurp]: calificacionCompleta
            }));
            
            // Limpiar la calificación temporal
            setCalificaciones(prev => {
                const nuevasCalificaciones = { ...prev };
                delete nuevasCalificaciones[alumnoCurp];
                return nuevasCalificaciones;
            });
        }
    };

    // Obtener el curso seleccionado para verificar si tiene examen práctico
    const cursoActual = cursos.find(curso => curso.id === parseInt(cursoSeleccionado));
    const tieneExamenPractico = cursoActual ? cursoActual.tieneExamenPractico : true;

    // Función para obtener el valor a mostrar en los inputs (usa calificaciones temporales o guardadas)
    const obtenerValorCampo = (alumnoCurp, campo) => {
        // Primero busca en calificaciones temporales (no guardadas)
        if (calificaciones[alumnoCurp] && calificaciones[alumnoCurp][campo] !== undefined) {
            const valor = calificaciones[alumnoCurp][campo];
            return campo === 'observaciones' ? valor : (valor === '' ? '' : valor);
        }
        // Luego busca en calificaciones guardadas
        if (calificacionesGuardadas[alumnoCurp] && calificacionesGuardadas[alumnoCurp][campo] !== undefined) {
            const valor = calificacionesGuardadas[alumnoCurp][campo];
            return campo === 'observaciones' ? valor : (valor === 0 ? '' : valor.toString());
        }
        return '';
    };

    // Función para verificar si un alumno tiene calificación pendiente de guardar
    const tieneCambiosPendientes = (alumnoCurp) => {
        return calificaciones[alumnoCurp] !== undefined;
    };

    // Función para verificar si un alumno puede ser calificado
    const puedeCalificar = (alumnoCurp) => {
        const calif = calificaciones[alumnoCurp];
        if (!calif) return false;
        
        // Requerimos evaluación final y examen práctico (si aplica)
        const tieneEvaluacionFinal = calif.evaluacionFinal !== undefined && calif.evaluacionFinal !== '';
        const tieneExamenPracticoRequerido = !tieneExamenPractico || (calif.examenPractico !== undefined && calif.examenPractico !== '');
        
        return tieneEvaluacionFinal && tieneExamenPracticoRequerido;
    };

    // Función para manejar el evento onBlur y validar el valor
    const handleBlur = (alumnoCurp, campo, valor) => {
        if (campo !== 'observaciones') {
            const numValue = parseInt(valor);
            if (isNaN(numValue)) {
                // Si no es un número, limpiar el campo
                handleCalificacionChange(alumnoCurp, campo, '');
            } else if (numValue > 100) {
                // Si es mayor a 100, establecer a 100
                handleCalificacionChange(alumnoCurp, campo, '100');
            } else if (numValue < 0) {
                // Si es menor a 0, establecer a 0
                handleCalificacionChange(alumnoCurp, campo, '0');
            }
        }
    };

    return (
        <div className={styles.vistaEvaluaciones}>
            <div className={styles.formularioHeader}>
                <h2>FORMULARIO DE TRASPASO DE CALIFICACIONES</h2>
                <div className={styles.empresaInfo}>
                    <h3>BEYCO Consultores</h3>
                </div>
            </div>

            {/* Selector de Curso */}
            <div className={styles.selectorSection}>
                <label>Seleccionar Curso:</label>
                <select 
                    value={cursoSeleccionado} 
                    onChange={(e) => handleSeleccionarCurso(e.target.value)}
                    className={styles.selector}
                >
                    <option value="">-- Selecciona un curso --</option>
                    {cursos.map(curso => (
                        <option key={curso.id} value={curso.id}>
                            {curso.nombre} - {new Date(curso.fechaIngreso).toLocaleDateString('es-ES')}
                        </option>
                    ))}
                </select>
            </div>

            {cursoSeleccionado && (
                <div className={styles.tableContainer}>
                    <div className={styles.tableHeader}>
                        <h3>Calificaciones del Curso</h3>
                        <div className={styles.accionesHeader}>
                            <span className={styles.contadorCambios}>
                                {Object.keys(calificaciones).length > 0 && 
                                    `${Object.keys(calificaciones).length} calificación(es) pendiente(s)`
                                }
                            </span>
                            <button 
                                className={styles.btnGuardar} 
                                onClick={guardarCalificaciones}
                                disabled={Object.keys(calificaciones).length === 0}
                            >
                                💾 Guardar Todas las Calificaciones
                            </button>
                        </div>
                    </div>
                    
                    {/* Notas importantes */}
                    <div className={styles.notasImportantes}>
                        <p>***El examen más importante es el práctico y el final, el práctico hay que acreditarlo con un 80%</p>
                        <p>***Los promedios se obtienen con el final y el práctico</p>
                        <p>***El curso se acredita principalmente con el examen práctico y algunas observaciones con el instructor</p>
                    </div>

                    <table className={styles.cursosTable}>
                        <thead>
                            <tr>
                                <th>NOMBRE</th>
                                <th>EVALUACIÓN INICIAL</th>
                                <th>EVALUACIÓN FINAL</th>
                                {tieneExamenPractico && <th>EXAMEN PRÁCTICO</th>}
                                <th>PROMEDIO</th>
                                <th>RESULTADO</th>
                                <th>OBSERVACIONES</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumnosCurso.length > 0 ? (
                                alumnosCurso.map(alumno => {
                                    const califAlumno = calificaciones[alumno.curp] || calificacionesGuardadas[alumno.curp] || {};
                                    const evalFinal = parseFloat(califAlumno.evaluacionFinal) || 0;
                                    const evalPractica = parseFloat(califAlumno.examenPractico) || 0;
                                    const promedio = califAlumno.promedio || calcularPromedio(evalFinal, evalPractica);
                                    const resultado = califAlumno.resultado || determinarResultado(promedio, evalPractica, califAlumno.observaciones);
                                    const tieneCambios = tieneCambiosPendientes(alumno.curp);
                                    const puedeGuardar = puedeCalificar(alumno.curp);
                                    
                                    return (
                                        <tr key={alumno.curp} className={tieneCambios ? styles.filaConCambios : ''}>
                                            <td>
                                                <strong>{alumno.nombre} {alumno.apellidoPaterno} {alumno.apellidoMaterno}</strong>
                                                {tieneCambios && <span className={styles.indicatorCambios}> *</span>}
                                            </td>
                                            <td>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    value={obtenerValorCampo(alumno.curp, 'evaluacionInicial')}
                                                    onChange={(e) => handleCalificacionChange(alumno.curp, 'evaluacionInicial', e.target.value)}
                                                    onBlur={(e) => handleBlur(alumno.curp, 'evaluacionInicial', e.target.value)}
                                                    className={styles.calificacionInput}
                                                    placeholder="0-100"
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    value={obtenerValorCampo(alumno.curp, 'evaluacionFinal')}
                                                    onChange={(e) => handleCalificacionChange(alumno.curp, 'evaluacionFinal', e.target.value)}
                                                    onBlur={(e) => handleBlur(alumno.curp, 'evaluacionFinal', e.target.value)}
                                                    className={styles.calificacionInput}
                                                    placeholder="0-100"
                                                    required
                                                />
                                            </td>
                                            {tieneExamenPractico && (
                                                <td>
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        value={obtenerValorCampo(alumno.curp, 'examenPractico')}
                                                        onChange={(e) => handleCalificacionChange(alumno.curp, 'examenPractico', e.target.value)}
                                                        onBlur={(e) => handleBlur(alumno.curp, 'examenPractico', e.target.value)}
                                                        className={styles.calificacionInput}
                                                        placeholder="0-100"
                                                        required
                                                    />
                                                </td>
                                            )}
                                            <td>
                                                <span className={styles.promedio}>
                                                    {promedio > 0 ? promedio.toFixed(1) : '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`${styles.resultado} ${resultado === 'APTO' ? styles.apto : styles.noApto}`}>
                                                    {resultado || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <input 
                                                    type="text"
                                                    value={obtenerValorCampo(alumno.curp, 'observaciones')}
                                                    onChange={(e) => handleCalificacionChange(alumno.curp, 'observaciones', e.target.value)}
                                                    className={styles.observacionesInput}
                                                    placeholder="Observaciones..."
                                                />
                                            </td>
                                            <td>
                                                <button 
                                                    className={styles.btnGuardarIndividual}
                                                    onClick={() => guardarCalificacionIndividual(alumno.curp)}
                                                    disabled={!puedeGuardar}
                                                    title={puedeGuardar ? "Guardar calificación" : "Complete evaluación final y examen práctico"}
                                                >
                                                    GUARDAR
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={tieneExamenPractico ? "8" : "7"} style={{ textAlign: 'center', padding: '2rem' }}>
                                        No hay alumnos inscritos en este curso
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// Componente para la vista de Evidencia
function VistaEvidencia({ 
    cursos, 
    cursoEvidencia, 
    setCursoEvidencia, 
    archivos, 
    onSubirEvidencia 
}) {
    const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);

    const handleFileChange = (e) => {
        setArchivosSeleccionados(Array.from(e.target.files));
    };

    const handleSubirArchivos = () => {
        if (archivosSeleccionados.length > 0 && cursoEvidencia) {
            onSubirEvidencia(cursoEvidencia, archivosSeleccionados);
            setArchivosSeleccionados([]);
        }
    };

    return (
        <div className={styles.vistaEvidencia}>
            <div className={styles.welcome}>
                <h2>Evidencia Fotográfica</h2>
                <h3>Subir evidencia de cursos</h3>
            </div>

            {/* Selector de Curso */}
            <div className={styles.selectorSection}>
                <label>Seleccionar Curso:</label>
                <select 
                    value={cursoEvidencia} 
                    onChange={(e) => setCursoEvidencia(e.target.value)}
                    className={styles.selector}
                >
                    <option value="">-- Selecciona un curso --</option>
                    {cursos.map(curso => (
                        <option key={curso.id} value={curso.id}>
                            {curso.nombre} - {new Date(curso.fechaIngreso).toLocaleDateString('es-ES')}
                        </option>
                    ))}
                </select>
            </div>

            {cursoEvidencia && (
                <div className={styles.uploadSection}>
                    <div className={styles.uploadArea}>
                        <h3>Subir Evidencia</h3>
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*,video/*,.pdf"
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                        <div className={styles.fileList}>
                            {archivosSeleccionados.map((file, index) => (
                                <div key={index} className={styles.fileItem}>
                                    📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </div>
                            ))}
                        </div>
                        <button 
                            className={styles.btnGuardar} 
                            onClick={handleSubirArchivos}
                            disabled={archivosSeleccionados.length === 0}
                        >
                            📤 Subir Evidencia
                        </button>
                    </div>

                    {/* Archivos subidos */}
                    <div className={styles.archivosSubidos}>
                        <h3>Archivos Subidos</h3>
                        <div className={styles.archivosGrid}>
                            {archivos.length > 0 ? (
                                archivos.map((archivo, index) => (
                                    <div key={index} className={styles.archivoItem}>
                                        <span>📷 {archivo.nombre}</span>
                                        <small>Subido: {archivo.fecha}</small>
                                    </div>
                                ))
                            ) : (
                                <p>No hay archivos subidos</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Componente para la vista de Honorarios
function VistaHonorarios() {
    const [honorarios, setHonorarios] = useState([]);

    useEffect(() => {
        // Simular carga de honorarios
        setHonorarios([
            { id: 1, mes: 'Octubre 2025', cursos: 3, total: 15000, estatus: 'Pagado' },
            { id: 2, mes: 'Septiembre 2025', cursos: 2, total: 10000, estatus: 'Pagado' },
            { id: 3, mes: 'Agosto 2025', cursos: 4, total: 20000, estatus: 'Pagado' }
        ]);
    }, []);

    return (
        <div className={styles.vistaHonorarios}>
            <div className={styles.welcome}>
                <h2>Consultar Honorarios</h2>
                <h3>Historial de pagos y honorarios</h3>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.cursosTable}>
                    <thead>
                        <tr>
                            <th>Mes</th>
                            <th>Cursos Impartidos</th>
                            <th>Total Honorarios</th>
                            <th>Estatus</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {honorarios.map(honorario => (
                            <tr key={honorario.id}>
                                <td>
                                    <strong>{honorario.mes}</strong>
                                </td>
                                <td>{honorario.cursos} cursos</td>
                                <td>${honorario.total.toLocaleString()}</td>
                                <td>
                                    <span className={`${styles.status} ${styles[honorario.estatus.toLowerCase()]}`}>
                                        {honorario.estatus}
                                    </span>
                                </td>
                                <td>
                                    <button className={styles.btnInscribir}>
                                        📄 Ver Detalles
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.resumenHonorarios}>
                <div className={styles.tarjetaEstadistica}>
                    <h3>Total Este Mes</h3>
                    <div className={styles.numero}>$15,000</div>
                </div>
                <div className={styles.tarjetaEstadistica}>
                    <h3>Cursos Este Mes</h3>
                    <div className={styles.numero}>3</div>
                </div>
                <div className={styles.tarjetaEstadistica}>
                    <h3>Próximo Pago</h3>
                    <div className={styles.numero}>30 Nov</div>
                </div>
            </div>
        </div>
    );
}