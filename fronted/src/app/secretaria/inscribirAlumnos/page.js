'use client';

import { useState, useEffect } from 'react';
import styles from './InscribirAlumnos.module.css';

// --- Componente de Notificación ---
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

// --- Componente de Modal de Confirmación ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'delete' }) => {
    if (!isOpen) return null;

    const getButtonStyle = () => {
        switch (type) {
            case 'delete':
                return styles.btnEliminar;
            case 'warning':
                return styles.btnWarning;
            default:
                return styles.btnEliminar;
        }
    };

    const getButtonText = () => {
        switch (type) {
            case 'delete':
                return 'Eliminar Definitivamente';
            case 'warning':
                return 'Eliminar del Curso';
            default:
                return 'Confirmar';
        }
    };

    return (
        <div className={styles.confirmModalOverlay}>
            <div className={styles.confirmModal}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className={styles.modalButtons}>
                    <button onClick={onConfirm} className={getButtonStyle()}>
                        {getButtonText()}
                    </button>
                    <button onClick={onClose} className={styles.btnCancelar}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function InscribirAlumnos({ onClose }) {
    const [instructores, setInstructores] = useState([]);
    const [instructorSeleccionado, setInstructorSeleccionado] = useState('');
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [alumnosInscritos, setAlumnosInscritos] = useState([]);
    const [todosLosAlumnos, setTodosLosAlumnos] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Estados para notificaciones
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'delete'
    });

    // Estados para nuevo alumno
    const [nuevoAlumno, setNuevoAlumno] = useState({
        curp: '',
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        fechaNacimiento: '',
        puesto: '',
        estadoNacimiento: '',
        rfc: ''
    });

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoBuscarExistente, setModoBuscarExistente] = useState(false);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [buscandoAlumnos, setBuscandoAlumnos] = useState(false);

    // Función para mostrar notificaciones
    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
    };
    
    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    // Datos de ejemplo de alumnos (basados en tu BD)
    const alumnosEjemplo = [
        {
            curp: 'AGSA940214TSLAS06',
            nombre: 'Alejandra',
            apellidoPaterno: 'Aguirre',
            apellidoMaterno: 'Soto',
            fechaNacimiento: '1994-02-14',
            puesto: 'Jefa de Logistica y Distribucion',
            estadoNacimiento: 'Tamaulipas',
            rfc: 'AASA940214C77'
        },
        {
            curp: 'GUER890125HCSLS07',
            nombre: 'Rosa',
            apellidoPaterno: 'Gutierrez',
            apellidoMaterno: 'Estrada',
            fechaNacimiento: '1989-01-25',
            puesto: 'Supervisor de Calidad',
            estadoNacimiento: 'Coahuila',
            rfc: 'GUER890125R32'
        },
        {
            curp: 'LEOL960718HCMCC03',
            nombre: 'Laura',
            apellidoPaterno: 'Leon',
            apellidoMaterno: 'Mendoza',
            fechaNacimiento: '1996-07-18',
            puesto: 'Tecnica de Mantenimiento',
            estadoNacimiento: 'Coahuila',
            rfc: 'LELM960718L44'
        },
        {
            curp: 'MAJA930510HCASR09',
            nombre: 'Javier',
            apellidoPaterno: 'Martinez',
            apellidoMaterno: 'Alvarado',
            fechaNacimiento: '1993-05-10',
            puesto: 'Jefe de Linea de Produccion',
            estadoNacimiento: 'Coahuila',
            rfc: 'MAAJ930510R91'
        },
        {
            curp: 'ROBH850402HCALC01',
            nombre: 'Hector',
            apellidoPaterno: 'Rodriguez',
            apellidoMaterno: 'Baez',
            fechaNacimiento: '1985-04-02',
            puesto: 'Encargado de Seguridad Patrimonial',
            estadoNacimiento: 'Coahuila',
            rfc: 'ROBH850402Z55'
        },
        {
            curp: 'DIPL910908MNLRR04',
            nombre: 'Pablo',
            apellidoPaterno: 'Diaz',
            apellidoMaterno: 'Luna',
            fechaNacimiento: '1991-09-08',
            puesto: 'Operador de Grua Industrial',
            estadoNacimiento: 'Nuevo Leon',
            rfc: 'DILP910908L66'
        },
        {
            curp: 'GAMA991208CHLVF10',
            nombre: 'Monica',
            apellidoPaterno: 'Garcia',
            apellidoMaterno: 'Mena',
            fechaNacimiento: '1999-12-08',
            puesto: 'Asistente de Recursos Humanos',
            estadoNacimiento: 'Chiapas',
            rfc: 'GAMA991208W11'
        }
    ];

    useEffect(() => {
        cargarInstructores();
    }, []);

    useEffect(() => {
        if (instructorSeleccionado) {
            cargarCursosPorInstructor(instructorSeleccionado);
            setCursoSeleccionado(''); // Resetear curso cuando cambia instructor
            setAlumnosInscritos([]); // Limpiar alumnos inscritos
        }
    }, [instructorSeleccionado]);

    useEffect(() => {
        if (cursoSeleccionado) {
            cargarAlumnosInscritos(cursoSeleccionado);
        }
    }, [cursoSeleccionado]);

    const cargarInstructores = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('http://localhost:8080/api/usuarios/instructores');
            
            if (response.ok) {
                const data = await response.json();
                setInstructores(data);
                showNotification(`${data.length} instructores cargados`, 'success');
            } else {
                throw new Error(`Error ${response.status}: No se pudieron cargar los instructores`);
            }
            
        } catch (error) {
            console.error('Error cargando instructores:', error);
            showNotification("Usando datos de ejemplo - " + error.message, 'warning');
            
            // Datos de ejemplo robustos
            const instructoresEjemplo = [
                {
                    numEmpleado: 1,
                    nombre: 'Armando',
                    apellidoPaterno: 'Becerra',
                    apellidoMaterno: 'Campos'
                },
                {
                    numEmpleado: 3,
                    nombre: 'Ana',
                    apellidoPaterno: 'Garcia',
                    apellidoMaterno: 'Solis'
                }
            ];
            setInstructores(instructoresEjemplo);
        } finally {
            setLoading(false);
        }
    };

    const cargarCursosPorInstructor = async (instructorId) => {
        try {
            setLoading(true);
            console.log(`🔍 Cargando cursos para instructor ID: ${instructorId}`);
            
            const response = await fetch(`http://localhost:8080/api/inscripciones/instructores/${instructorId}/cursos`);
            
            if (response.ok) {
                const data = await response.json();
                setCursos(data);
                console.log(`✅ ${data.length} cursos cargados para instructor ${instructorId}`);
                
                if (data.length > 0) {
                    showNotification(`${data.length} cursos encontrados para este instructor`, 'success');
                } else {
                    showNotification("Este instructor no tiene cursos asignados", 'info');
                }
            } else if (response.status === 404) {
                // Endpoint no existe aún, usar datos de ejemplo
                console.warn('Endpoint de cursos por instructor no disponible, usando datos de ejemplo');
                cargarCursosEjemplo(instructorId);
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Error cargando cursos:', error);
            // En caso de error, cargar datos de ejemplo
            cargarCursosEjemplo(instructorId);
            showNotification("Error al cargar cursos del instructor. Usando datos de ejemplo.", 'warning');
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar cursos de ejemplo
    const cargarCursosEjemplo = (instructorId) => {
        const cursosEjemplo = [
            {
                id: 2,
                nombre: 'Manejo de Materiales y Residuos Peligrosos',
                stps: 'STPS-MP-004',
                horas: 8,
                fechaIngreso: '2025-04-02',
                empresa: 'Empresa Ejemplo SA',
                instructor: 'Instructor Demo',
                lugar: 'Patio de Maniobras'
            },
            {
                id: 3,
                nombre: 'Seguridad Industrial',
                stps: 'STPS-IC-003', 
                horas: 16,
                fechaIngreso: '2025-04-22',
                empresa: 'Constructora XYZ',
                instructor: 'Instructor Demo',
                lugar: 'Area de simulacion'
            }
        ];
        
        setCursos(cursosEjemplo);
        showNotification(`Cursos de ejemplo cargados para instructor ${instructorId}`, 'info');
    };

    const cargarAlumnosInscritos = async (cursoId) => {
        try {
            setLoading(true);
            console.log(`👥 Cargando alumnos inscritos para curso ID: ${cursoId}`);
            
            const response = await fetch(`http://localhost:8080/api/inscripciones/cursos/${cursoId}/alumnos`);
            
            if (response.ok) {
                const data = await response.json();
                setAlumnosInscritos(data);
                console.log(`✅ ${data.length} alumnos inscritos cargados para curso ${cursoId}`);
                
                if (data.length > 0) {
                    showNotification(`${data.length} alumnos inscritos cargados`, 'success');
                }
            } else if (response.status === 404) {
                // Endpoint no existe, usar datos de ejemplo
                console.warn('Endpoint de alumnos inscritos no disponible, usando datos de ejemplo');
                cargarAlumnosInscritosEjemplo(cursoId);
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Error cargando alumnos inscritos:', error);
            cargarAlumnosInscritosEjemplo(cursoId);
            showNotification("Error al cargar alumnos inscritos. Usando datos de ejemplo.", 'warning');
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar alumnos de ejemplo
    const cargarAlumnosInscritosEjemplo = (cursoId) => {
        // Filtrar alumnos según el curso (esto es solo un ejemplo)
        let alumnosFiltrados = [];
        if (cursoId === 2) {
            alumnosFiltrados = alumnosEjemplo.slice(0, 5); // Primeros 5 alumnos para curso 2
        } else if (cursoId === 3) {
            alumnosFiltrados = alumnosEjemplo.slice(2, 6); // Otros alumnos para curso 3
        } else {
            alumnosFiltrados = alumnosEjemplo.slice(0, 2); // Para otros cursos
        }
        
        setAlumnosInscritos(alumnosFiltrados);
        showNotification(`${alumnosFiltrados.length} alumnos de ejemplo cargados`, 'info');
    };

    // Función para buscar alumnos por apellidos - CON MANEJO MEJORADO
    const buscarAlumnosPorApellido = async (apellido) => {
        if (!apellido.trim()) {
            setTodosLosAlumnos([]);
            return;
        }

        try {
            setBuscandoAlumnos(true);
            console.log(`🔍 Buscando alumnos con apellido: "${apellido}"`);
            
            const response = await fetch(`http://localhost:8080/api/inscripciones/alumnos/buscar?apellido=${encodeURIComponent(apellido)}`);
            
            if (response.ok) {
                const data = await response.json();
                setTodosLosAlumnos(data);
                console.log(`✅ ${data.length} alumnos encontrados con apellido "${apellido}"`);
                
                if (data.length === 0) {
                    showNotification(`No se encontraron alumnos con el apellido "${apellido}"`, 'info');
                } else {
                    showNotification(`Se encontraron ${data.length} alumnos`, 'success');
                }
            } else if (response.status === 404) {
                // Endpoint no existe, usar búsqueda en datos de ejemplo
                console.warn('Endpoint de búsqueda no disponible, usando búsqueda en datos de ejemplo');
                buscarEnAlumnosEjemplo(apellido);
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Error buscando alumnos:', error);
            // En caso de error, buscar en datos de ejemplo
            buscarEnAlumnosEjemplo(apellido);
            showNotification("Error al buscar alumnos. Usando datos de ejemplo.", 'warning');
        } finally {
            setBuscandoAlumnos(false);
        }
    };

    // Búsqueda en datos de ejemplo
    const buscarEnAlumnosEjemplo = (apellido) => {
        const apellidoLower = apellido.toLowerCase();
        const resultados = alumnosEjemplo.filter(alumno => 
            alumno.apellidoPaterno.toLowerCase().includes(apellidoLower) ||
            alumno.apellidoMaterno.toLowerCase().includes(apellidoLower)
        );
        
        setTodosLosAlumnos(resultados);
        
        if (resultados.length === 0) {
            showNotification(`No se encontraron alumnos con el apellido "${apellido}" en datos de ejemplo`, 'info');
        } else {
            showNotification(`${resultados.length} alumnos encontrados en datos de ejemplo`, 'warning');
        }
    };

    // --- FUNCIONES PARA ELIMINAR (SOLO ENDPOINTS REALES) ---

    // Eliminar alumno del curso (solo de la inscripción)
    const eliminarAlumnoDelCurso = async (alumnoCurp) => {
        if (!cursoSeleccionado) {
            showNotification("No hay curso seleccionado", 'error');
            return;
        }

        try {
            setLoading(true);
            console.log(`🗑️ Eliminando alumno ${alumnoCurp} del curso ${cursoSeleccionado}`);
            
            const response = await fetch(`http://localhost:8080/api/inscripciones/cursos/${cursoSeleccionado}/alumnos/${alumnoCurp}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showNotification("✅ Alumno eliminado del curso correctamente", 'success');
                // Recargar la lista de alumnos inscritos
                cargarAlumnosInscritos(cursoSeleccionado);
            } else {
                const errorMsg = await response.text();
                throw new Error(errorMsg || 'Error al eliminar alumno del curso');
            }

        } catch (error) {
            console.error('Error eliminando alumno del curso:', error);
            showNotification("Error: " + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Eliminar alumno definitivamente de la base de datos
    const eliminarAlumnoDefinitivamente = async (alumnoCurp) => {
        try {
            setLoading(true);
            console.log(`⚠️ Eliminando alumno ${alumnoCurp} del sistema`);
            
            const response = await fetch(`http://localhost:8080/api/inscripciones/alumnos/${alumnoCurp}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showNotification("✅ Alumno eliminado definitivamente del sistema", 'success');
                // Recargar la lista de alumnos inscritos
                cargarAlumnosInscritos(cursoSeleccionado);
                // Actualizar la lista de búsqueda si está activa
                if (terminoBusqueda) {
                    buscarAlumnosPorApellido(terminoBusqueda);
                }
            } else {
                const errorMsg = await response.text();
                throw new Error(errorMsg || 'Error al eliminar alumno del sistema');
            }

        } catch (error) {
            console.error('Error eliminando alumno del sistema:', error);
            showNotification("Error: " + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Función para mostrar modal de confirmación
    const showConfirmation = (title, message, onConfirm, type = 'delete') => {
        setConfirmation({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                setConfirmation(prev => ({ ...prev, isOpen: false }));
                onConfirm();
            },
            type
        });
    };

    // Confirmación para eliminar del curso
    const confirmarEliminarDelCurso = (alumno) => {
        showConfirmation(
            "Eliminar del Curso",
            `¿Estás seguro de que deseas eliminar a ${alumno.nombre} ${alumno.apellidoPaterno} de este curso? Esta acción no elimina al alumno del sistema.`,
            () => eliminarAlumnoDelCurso(alumno.curp),
            'warning'
        );
    };

    // Confirmación para eliminar definitivamente
    const confirmarEliminarDefinitivo = (alumno) => {
        showConfirmation(
            "Eliminar Definitivamente",
            `⚠️ ADVERTENCIA: ¿Estás seguro de que deseas eliminar definitivamente a ${alumno.nombre} ${alumno.apellidoPaterno} del sistema? Esta acción es irreversible y eliminará todos los registros del alumno.`,
            () => eliminarAlumnoDefinitivamente(alumno.curp),
            'delete'
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoAlumno(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const crearYInscribirAlumno = async () => {
        if (!nuevoAlumno.curp.trim() || !nuevoAlumno.nombre.trim() || !nuevoAlumno.apellidoPaterno.trim()) {
            showNotification("CURP, Nombre y Apellido Paterno son requeridos", 'error');
            return;
        }

        if (!cursoSeleccionado) {
            showNotification("Por favor selecciona un curso primero", 'warning');
            return;
        }

        try {
            setLoading(true);

            // 1. Crear el alumno
            const crearResponse = await fetch('http://localhost:8080/api/inscripciones/alumnos/nuevo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    curp: nuevoAlumno.curp.toUpperCase(),
                    nombre: nuevoAlumno.nombre.trim(),
                    apellidoPaterno: nuevoAlumno.apellidoPaterno.trim(),
                    apellidoMaterno: nuevoAlumno.apellidoMaterno?.trim() || '',
                    fechaNacimiento: nuevoAlumno.fechaNacimiento || null,
                    puesto: nuevoAlumno.puesto?.trim() || 'Operario',
                    estadoNacimiento: nuevoAlumno.estadoNacimiento?.trim() || 'Coahuila',
                    rfc: nuevoAlumno.rfc?.toUpperCase() || ''
                })
            });

            if (!crearResponse.ok) {
                const errorText = await crearResponse.text();
                if (errorText.includes("ya existe")) {
                    showNotification("El alumno con este CURP ya existe en el sistema", 'warning');
                } else {
                    throw new Error(errorText || 'Error al crear alumno');
                }
                return;
            }

            // 2. Inscribir al curso
            const inscribirResponse = await fetch('http://localhost:8080/api/inscripciones/inscribir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    alumnoCurp: nuevoAlumno.curp.toUpperCase(),
                    cursoId: parseInt(cursoSeleccionado)
                })
            });

            if (inscribirResponse.ok) {
                showNotification("✅ Alumno creado e inscrito correctamente", 'success');
                // Recargar la lista de alumnos inscritos
                cargarAlumnosInscritos(cursoSeleccionado);
                // Limpiar formulario
                setNuevoAlumno({
                    curp: '',
                    nombre: '',
                    apellidoPaterno: '',
                    apellidoMaterno: '',
                    fechaNacimiento: '',
                    puesto: '',
                    estadoNacimiento: '',
                    rfc: ''
                });
                setMostrarFormulario(false);
            } else {
                const errorMsg = await inscribirResponse.text();
                throw new Error(errorMsg);
            }

        } catch (error) {
            console.error('Error:', error);
            showNotification("Error: " + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const inscribirAlumnoExistente = async (alumnoCurp) => {
        if (!cursoSeleccionado) {
            showNotification("Por favor selecciona un curso primero", 'warning');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch('http://localhost:8080/api/inscripciones/inscribir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    alumnoCurp: alumnoCurp,
                    cursoId: parseInt(cursoSeleccionado)
                })
            });

            if (response.ok) {
                showNotification("✅ Alumno inscrito correctamente", 'success');
                // Recargar la lista de alumnos inscritos
                cargarAlumnosInscritos(cursoSeleccionado);
                // Actualizar la lista de búsqueda
                buscarAlumnosPorApellido(terminoBusqueda);
            } else {
                const errorMsg = await response.text();
                if (errorMsg.includes("ya está inscrito")) {
                    showNotification("Este alumno ya está inscrito en el curso", 'warning');
                } else {
                    throw new Error(errorMsg);
                }
            }

        } catch (error) {
            console.error('Error:', error);
            showNotification("Error: " + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar la búsqueda de alumnos
    const handleBuscarAlumnos = (apellido) => {
        setTerminoBusqueda(apellido);
        if (apellido.trim().length >= 2) {
            buscarAlumnosPorApellido(apellido);
        } else {
            setTodosLosAlumnos([]);
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleDateString('es-ES');
    };

    const instructorActual = instructores.find(i => i.numEmpleado == instructorSeleccionado);
    const cursoActual = cursos.find(c => c.id == cursoSeleccionado);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
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
                    onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmation.onConfirm}
                    title={confirmation.title}
                    message={confirmation.message}
                    type={confirmation.type}
                />

                <div className={styles.modalHeader}>
                    <h2>Inscripción de Alumnos</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>

                <div className={styles.modalBody}>
                    {loading && (
                        <div className={styles.loading}>
                            Cargando...
                        </div>
                    )}

                    {/* Selector de Instructor */}
                    <div className={styles.selectorSection}>
                        <div className={styles.selectorGroup}>
                            <label htmlFor="instructorSelect">👨‍🏫 Seleccionar Instructor:</label>
                            <select 
                                id="instructorSelect"
                                value={instructorSeleccionado} 
                                onChange={(e) => setInstructorSeleccionado(e.target.value)}
                                className={styles.selector}
                                disabled={loading}
                            >
                                <option value="">-- Selecciona un instructor --</option>
                                {instructores.map(instructor => (
                                    <option key={instructor.numEmpleado} value={instructor.numEmpleado}>
                                        {instructor.nombre} {instructor.apellidoPaterno} {instructor.apellidoMaterno}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selector de Curso - Solo visible si hay instructor seleccionado */}
                        {instructorSeleccionado && (
                            <div className={styles.selectorGroup}>
                                <label htmlFor="cursoSelect">📚 Seleccionar Curso:</label>
                                <select 
                                    id="cursoSelect"
                                    value={cursoSeleccionado} 
                                    onChange={(e) => setCursoSeleccionado(e.target.value)}
                                    className={styles.selector}
                                    disabled={loading || cursos.length === 0}
                                >
                                    <option value="">-- Selecciona un curso --</option>
                                    {cursos.map(curso => (
                                        <option key={curso.id} value={curso.id}>
                                            {curso.nombre} | {curso.empresa} | {curso.lugar} | {formatFecha(curso.fechaIngreso)}
                                        </option>
                                    ))}
                                </select>
                                {cursos.length === 0 && (
                                    <p className={styles.sinCursos}>Este instructor no tiene cursos asignados</p>
                                )}
                            </div>
                        )}
                    </div>

                    {cursoSeleccionado && (
                        <>
                            {/* Información del curso seleccionado */}
                            <div className={styles.cursoInfo}>
                                <h3>📚 {cursoActual?.nombre}</h3>
                                <div className={styles.cursoDetalles}>
                                    <p><strong>👨‍🏫 Instructor:</strong> {instructorActual?.nombre} {instructorActual?.apellidoPaterno}</p>
                                    <p><strong>🏢 Empresa:</strong> {cursoActual?.empresa}</p>
                                    <p><strong>📍 Lugar:</strong> {cursoActual?.lugar}</p>
                                    <p><strong>🔑 Clave STPS:</strong> {cursoActual?.stps}</p>
                                    <p><strong>📅 Fecha:</strong> {formatFecha(cursoActual?.fechaIngreso)}</p>
                                </div>
                            </div>

                            {/* Opciones para agregar alumnos */}
                            <div className={styles.opcionesAgregar}>
                                <button 
                                    onClick={() => {
                                        setMostrarFormulario(true);
                                        setModoBuscarExistente(false);
                                        setTerminoBusqueda('');
                                    }}
                                    className={styles.btnOpcion}
                                >
                                    📝 Nuevo Alumno
                                </button>
                                <button 
                                    onClick={() => {
                                        setModoBuscarExistente(true);
                                        setMostrarFormulario(false);
                                        setTodosLosAlumnos([]);
                                    }}
                                    className={styles.btnOpcion}
                                >
                                    🔍 Buscar Alumno Existente
                                </button>
                            </div>

                            {/* Formulario para nuevo alumno */}
                            {mostrarFormulario && (
                                <div className={styles.formSection}>
                                    <h3>Agregar Nuevo Alumno</h3>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label>CURP * (18 caracteres)</label>
                                            <input
                                                type="text"
                                                name="curp"
                                                value={nuevoAlumno.curp}
                                                onChange={handleInputChange}
                                                placeholder="Ej: BEGA030821HCLCRRA0"
                                                maxLength="18"
                                                className={styles.curpInput}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Nombre *</label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                value={nuevoAlumno.nombre}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Juan"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Apellido Paterno *</label>
                                            <input
                                                type="text"
                                                name="apellidoPaterno"
                                                value={nuevoAlumno.apellidoPaterno}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Pérez"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Apellido Materno</label>
                                            <input
                                                type="text"
                                                name="apellidoMaterno"
                                                value={nuevoAlumno.apellidoMaterno}
                                                onChange={handleInputChange}
                                                placeholder="Ej: García"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Fecha de Nacimiento</label>
                                            <input
                                                type="date"
                                                name="fechaNacimiento"
                                                value={nuevoAlumno.fechaNacimiento}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Puesto</label>
                                            <input
                                                type="text"
                                                name="puesto"
                                                value={nuevoAlumno.puesto}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Operario"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Estado de Nacimiento</label>
                                            <input
                                                type="text"
                                                name="estadoNacimiento"
                                                value={nuevoAlumno.estadoNacimiento}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Coahuila"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>RFC (13 caracteres)</label>
                                            <input
                                                type="text"
                                                name="rfc"
                                                value={nuevoAlumno.rfc}
                                                onChange={handleInputChange}
                                                placeholder="Ej: PEGF800101ABC"
                                                maxLength="13"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formActions}>
                                        <button 
                                            onClick={crearYInscribirAlumno} 
                                            className={styles.btnGuardar}
                                            disabled={loading}
                                        >
                                            {loading ? 'Guardando...' : 'Crear e Inscribir'}
                                        </button>
                                        <button 
                                            onClick={() => setMostrarFormulario(false)} 
                                            className={styles.btnCancelar}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Búsqueda de alumnos existentes */}
                            {modoBuscarExistente && (
                                <div className={styles.busquedaSection}>
                                    <h3>🔍 Buscar Alumno Existente</h3>
                                    <div className={styles.busquedaInput}>
                                        <input
                                            type="text"
                                            placeholder="Buscar por apellido paterno o materno..."
                                            value={terminoBusqueda}
                                            onChange={(e) => handleBuscarAlumnos(e.target.value)}
                                            className={styles.searchInput}
                                        />
                                        {buscandoAlumnos && (
                                            <div className={styles.buscando}>Buscando...</div>
                                        )}
                                    </div>
                                    {terminoBusqueda && (
                                        <div className={styles.resultadosBusqueda}>
                                            <h4>Resultados de búsqueda para "{terminoBusqueda}":</h4>
                                            {todosLosAlumnos.length > 0 ? (
                                                <div className={styles.listaAlumnos}>
                                                    {todosLosAlumnos.map(alumno => (
                                                        <div key={alumno.curp} className={styles.alumnoItem}>
                                                            <div className={styles.alumnoInfo}>
                                                                <strong>{alumno.nombre} {alumno.apellidoPaterno} {alumno.apellidoMaterno}</strong>
                                                                <span>📧 CURP: {alumno.curp}</span>
                                                                <span>💼 Puesto: {alumno.puesto}</span>
                                                                <span>🎂 Fecha Nac: {formatFecha(alumno.fechaNacimiento)}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => inscribirAlumnoExistente(alumno.curp)}
                                                                className={styles.btnInscribir}
                                                                disabled={loading}
                                                            >
                                                                {loading ? 'Inscribiendo...' : 'Inscribir'}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : !buscandoAlumnos ? (
                                                <p className={styles.noResultados}>No se encontraron alumnos con ese apellido</p>
                                            ) : null}
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => {
                                            setModoBuscarExistente(false);
                                            setTerminoBusqueda('');
                                            setTodosLosAlumnos([]);
                                        }} 
                                        className={styles.btnCancelar}
                                    >
                                        Cancelar Búsqueda
                                    </button>
                                </div>
                            )}

                            {/* Tabla de Alumnos Inscritos */}
                            <div className={styles.tableSection}>
                                <div className={styles.tableHeader}>
                                    <h3>👥 Alumnos Inscritos en el Curso ({alumnosInscritos.length})</h3>
                                </div>

                                <div className={styles.tableContainer}>
                                    <table className={styles.alumnosTable}>
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>Nombre Completo</th>
                                                <th>Fecha de Nacimiento</th>
                                                <th>Puesto</th>
                                                <th>Estado de Nacimiento</th>
                                                <th>CURP</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alumnosInscritos.length > 0 ? (
                                                alumnosInscritos.map((alumno, index) => (
                                                    <tr key={alumno.curp}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <strong>{alumno.nombreCompleto || `${alumno.nombre} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno}`}</strong>
                                                        </td>
                                                        <td>{formatFecha(alumno.fechaNacimiento)}</td>
                                                        <td>{alumno.puesto}</td>
                                                        <td>{alumno.estadoNacimiento}</td>
                                                        <td className={styles.curpCell}>{alumno.curp}</td>
                                                        <td>
                                                            <div className={styles.acciones}>
                                                                <button
                                                                    onClick={() => confirmarEliminarDelCurso(alumno)}
                                                                    className={styles.btnEliminarCurso}
                                                                    title="Eliminar solo de este curso"
                                                                    disabled={loading}
                                                                >
                                                                    🗑️ Curso
                                                                </button>
                                                                <button
                                                                    onClick={() => confirmarEliminarDefinitivo(alumno)}
                                                                    className={styles.btnEliminarDefinitivo}
                                                                    title="Eliminar definitivamente del sistema"
                                                                    disabled={loading}
                                                                >
                                                                    ⚠️ Sistema
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className={styles.noData}>
                                                        No hay alumnos inscritos en este curso
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.btnVolver}>
                        ← Salir
                    </button>
                </div>
            </div>
        </div>
    );
}