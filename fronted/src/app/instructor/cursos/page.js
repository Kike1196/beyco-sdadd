// app/instructor/cursos/page.js - VERSIÓN COMPLETA Y CORREGIDA
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

// Modal para ver alumnos
const ModalAlumnos = ({ curso, onClose }) => {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarAlumnos = async () => {
            try {
                console.log(`👨‍🎓 Intentando cargar alumnos para curso ${curso.id}`);
                
                // Intentar con el endpoint de alumnos
                const response = await fetch(`http://localhost:8080/api/instructor-cursos/${curso.id}/alumnos`);
                
                console.log('🔍 Response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Alumnos cargados del endpoint:', data);
                    if (data.success) {
                        setAlumnos(data.alumnos || []);
                    } else {
                        throw new Error(data.error || 'Error en la respuesta');
                    }
                } else if (response.status === 404) {
                    // Si el endpoint no existe, mostrar mensaje
                    console.log('⚠️ Endpoint de alumnos no encontrado');
                    setError('El endpoint de alumnos no está disponible aún.');
                    setAlumnos([]);
                } else {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                console.error('❌ Error cargando alumnos:', error);
                setError('No se pudieron cargar los alumnos: ' + error.message);
                setAlumnos([]);
            } finally {
                setLoading(false);
            }
        };

        if (curso.id) {
            cargarAlumnos();
        } else {
            setLoading(false);
        }
    }, [curso.id]);

    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return 'N/A';
        try {
            const hoy = new Date();
            const nacimiento = new Date(fechaNacimiento);
            let edad = hoy.getFullYear() - nacimiento.getFullYear();
            const mes = hoy.getMonth() - nacimiento.getMonth();
            if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                edad--;
            }
            return edad;
        } catch (error) {
            return 'N/A';
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'No especificada';
        try {
            return new Date(fecha).toLocaleDateString('es-ES');
        } catch (error) {
            return fecha;
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div>
                        <h3>Alumnos inscritos</h3>
                        <p className={styles.cursoNombreModal}>{curso.nombre}</p>
                    </div>
                    <button className={styles.modalClose} onClick={onClose}>×</button>
                </div>
                <div className={styles.modalBody}>
                    {error && (
                        <div className={styles.errorMessage}>
                            ⚠️ {error}
                        </div>
                    )}
                    
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Cargando lista de alumnos...</p>
                        </div>
                    ) : alumnos.length > 0 ? (
                        <div className={styles.alumnosList}>
                            <div className={styles.alumnosHeader}>
                                <span className={styles.totalAlumnos}>
                                    Total: {alumnos.length} alumno(s) inscrito(s)
                                </span>
                            </div>
                            <div className={styles.tableContainer}>
                                <table className={styles.alumnosTable}>
                                    <thead>
                                        <tr>
                                            <th>Nombre completo</th>
                                            <th>Puesto</th>
                                            <th>Edad</th>
                                            <th>CURP</th>
                                            <th>RFC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alumnos.map((alumno, index) => (
                                            <tr key={alumno.curp || index}>
                                                <td>
                                                    <div className={styles.alumnoNombre}>
                                                        <strong>{alumno.nombre} {alumno.apellidoPaterno} {alumno.apellidoMaterno}</strong>
                                                        {alumno.estadoNacimiento && (
                                                            <div className={styles.estadoNacimiento}>
                                                                {alumno.estadoNacimiento}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={styles.puesto}>
                                                        {alumno.puesto || 'No especificado'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={styles.edad}>
                                                        {calcularEdad(alumno.fechaNacimiento)} años
                                                    </span>
                                                    {alumno.fechaNacimiento && (
                                                        <div className={styles.fechaNacimiento}>
                                                            {formatFecha(alumno.fechaNacimiento)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <code className={styles.curp}>
                                                        {alumno.curp || 'N/A'}
                                                    </code>
                                                </td>
                                                <td>
                                                    <code className={styles.rfc}>
                                                        {alumno.rfc || 'N/A'}
                                                    </code>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noAlumnos}>
                            <div className={styles.noDataIcon}>👨‍🎓</div>
                            <h4>No hay alumnos inscritos</h4>
                            <p>{error ? 'Error al cargar los datos' : 'Este curso no tiene alumnos registrados actualmente.'}</p>
                            <div className={styles.sugerencia}>
                                <small>Los alumnos pueden ser inscritos desde el módulo de administración.</small>
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.btnCerrar}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CursosPage() {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [modalAlumnos, setModalAlumnos] = useState({ show: false, curso: null });

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
            console.log('👤 Datos de usuario:', userData);
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

    // FUNCIÓN PRINCIPAL - USA EL ENDPOINT COMPLETO QUE INCLUYE ALUMNOS
    const cargarCursosDesdeBackend = async (instructorId) => {
        try {
            console.log('🔄 Cargando cursos COMPLETOS para instructor ID:', instructorId);
            
            // USAR EL ENDPOINT COMPLETO QUE SÍ INCLUYE ALUMNOS
            const response = await fetch(`http://localhost:8080/api/instructor-cursos/instructor/${instructorId}/completo`);
            
            console.log('🔍 Status de respuesta:', response.status);
            console.log('🔍 URL llamada:', `http://localhost:8080/api/instructor-cursos/instructor/${instructorId}/completo`);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Datos completos cargados del backend:', data);
                
                if (data.success) {
                    return data.cursos || [];
                } else {
                    throw new Error(data.error || 'Error en la respuesta del servidor');
                }
            } else {
                console.error('❌ Error en respuesta:', response.status, response.statusText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

        } catch (error) {
            console.error('❌ Error en cargarCursosDesdeBackend:', error);
            throw error;
        }
    };

    // FUNCIÓN PARA PROCESAR LOS DATOS DEL CURSO
    const procesarCurso = (curso) => {
        console.log('🔧 Procesando curso:', curso);
        
        // Mapear diferentes nombres de campos que podrían venir del backend
        const fechaIngreso = curso.fechaIngreso || curso.Fecha_Imparticion;
        const horas = curso.horas || 8; // Valor por defecto
        const alumnosInscritos = curso.alumnosInscritos || 0; // AHORA SÍ TENEMOS EL CONTEO REAL
        const lugar = curso.lugar || curso.Lugar || 'Por definir';
        const empresa = curso.empresa || 'Empresa no especificada';
        const nombre = curso.nombre || curso.Nombre_curso;
        const stps = curso.stps || curso.Clave_STPS;
        
        return {
            id: curso.id || curso.Id_Curso,
            nombre: nombre,
            fechaIngreso: fechaIngreso,
            lugar: lugar,
            empresa: empresa,
            instructor: curso.instructor || 'Instructor no asignado',
            stps: stps,
            horas: horas,
            alumnosInscritos: alumnosInscritos, // AHORA SÍ TENEMOS EL NÚMERO REAL
            estado: determinarEstadoCurso(fechaIngreso),
            examenPractico: curso.examenPractico || false,
            precio: curso.precio || 0
        };
    };

    const cargarDatos = async () => {
        try {
            const userData = getUserData();
            if (!userData) {
                console.log('❌ No hay datos de usuario, redirigiendo...');
                router.push('/');
                return;
            }

            console.log('🎯 Cargando cursos para instructor:', userData);
            
            try {
                // Cargar desde el backend CON INFORMACIÓN DE ALUMNOS
                const cursosCargados = await cargarCursosDesdeBackend(userData.id);
                console.log('📊 Cursos recibidos del backend:', cursosCargados);
                
                const cursosProcesados = Array.isArray(cursosCargados) 
                    ? cursosCargados.map(curso => procesarCurso(curso))
                    : [];
                
                console.log('🎨 Cursos procesados:', cursosProcesados);
                
                // Calcular total de alumnos para mostrar en notificación
                const totalAlumnos = cursosProcesados.reduce((sum, curso) => sum + curso.alumnosInscritos, 0);
                
                setCursos(cursosProcesados);
                setLoading(false);
                
                if (cursosProcesados.length === 0) {
                    showNotification('No tienes cursos asignados actualmente', 'info');
                } else {
                    showNotification(
                        `Cargados ${cursosProcesados.length} cursos con ${totalAlumnos} alumnos inscritos`, 
                        'success'
                    );
                }
                
            } catch (backendError) {
                console.log('🔄 Falló conexión con backend, usando datos de ejemplo');
                throw new Error('modo-desarrollo');
            }
            
        } catch (error) {
            console.error('💥 Error en cargarDatos:', error);
            
            if (error.message === 'modo-desarrollo') {
                // Mostrar datos de ejemplo para desarrollo
                showNotification('Modo desarrollo: Mostrando datos de ejemplo', 'warning');
                const userData = getUserData();
                const cursosEjemplo = [
                    { 
                        Id_Curso: 2, 
                        Nombre_curso: "Manejo de Materiales y Residuos Peligrosos", 
                        Fecha_Imparticion: "2025-04-02", 
                        Lugar: "Patio de Maniobras",
                        empresa: "Industrias PEMEX",
                        instructor: userData?.nombre || "Ana Solis",
                        Clave_STPS: "STPS-MP-004",
                        horas: 8,
                        alumnosInscritos: 7 // DATO DE EJEMPLO
                    },
                    { 
                        Id_Curso: 25, 
                        Nombre_curso: "Soporte Vital Básico (BLS)", 
                        Fecha_Imparticion: "2025-11-20", 
                        Lugar: "Auditorio B", 
                        empresa: "Servicios Corporativos",
                        instructor: userData?.nombre || "Ana Solis",
                        Clave_STPS: "BEY-SOP-001",
                        horas: 8,
                        alumnosInscritos: 5 // DATO DE EJEMPLO
                    }
                ].map(curso => procesarCurso(curso));
                
                setCursos(cursosEjemplo);
                setLoading(false);
            } else {
                showNotification('Error al cargar los cursos: ' + error.message, 'error');
                setLoading(false);
            }
        }
    };

    // Función para recargar los cursos
    const handleRecargar = () => {
        setLoading(true);
        cargarDatos();
    };

    // Función para abrir modal de alumnos
    const handleVerAlumnos = (curso) => {
        setModalAlumnos({ show: true, curso });
    };

    // Función para cerrar modal
    const handleCerrarModal = () => {
        setModalAlumnos({ show: false, curso: null });
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

            {/* Modal de Alumnos */}
            {modalAlumnos.show && (
                <ModalAlumnos 
                    curso={modalAlumnos.curso} 
                    onClose={handleCerrarModal} 
                />
            )}

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Mis Cursos</h1>
                    <p>Consulta tus cursos asignados y alumnos inscritos</p>
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
                {/* Botón de recargar */}
                <div className={styles.actionsTop}>
                    <button onClick={handleRecargar} className={styles.btnRecargar} disabled={loading}>
                        {loading ? '🔄 Cargando...' : '🔄 Actualizar Cursos'}
                    </button>
                </div>

                {/* Tabla de Cursos */}
                <div className={styles.tableContainer}>
                    <div className={styles.tableHeader}>
                        <h3>Cursos Asignados</h3>
                        <div className={styles.tableActions}>
                            <span className={styles.totalCursos}>
                                {loading ? 'Cargando...' : `${cursos.length} curso(s)`}
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Conectando con el servidor...</p>
                            <small></small>
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
                                    <th>Acciones</th>
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
                                                        {curso.examenPractico && (
                                                            <span className={styles.examenPractico}>📝 Examen práctico</span>
                                                        )}
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
                                            <td>
                                                <button 
                                                    onClick={() => handleVerAlumnos(curso)}
                                                    className={styles.btnVerAlumnos}
                                                    title="Ver alumnos inscritos"
                                                >
                                                    👨‍🎓 Ver Alumnos
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className={styles.noData}>
                                            <div className={styles.noDataContent}>
                                                <div className={styles.noDataIcon}>📚</div>
                                                <h4>No hay cursos asignados</h4>
                                                <p>Actualmente no tienes cursos asignados en el sistema.</p>
                                                <div className={styles.noDataActions}>
                                                    <button onClick={handleRecargar} className={styles.btnRecargar}>
                                                        🔄 Reintentar conexión
                                                    </button>
                                                    <Link href="/instructor/dashboard" className={styles.btnVolverSmall}>
                                                        Volver
                                                    </Link>
                                                </div>
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