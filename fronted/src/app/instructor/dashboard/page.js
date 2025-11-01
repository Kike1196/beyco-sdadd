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

    // Función para determinar el estado del curso basado en la fecha
    const determinarEstadoCurso = (fechaIngreso) => {
        if (!fechaIngreso) return 'Programado';
        
        const hoy = new Date();
        const fechaCurso = new Date(fechaIngreso);
        
        // Si la fecha ya pasó, es "Finalizado"
        if (fechaCurso < hoy) return 'Finalizado';
        
        // Si es hoy o dentro de los próximos 7 días, es "Activo"
        const unaSemanaDespues = new Date();
        unaSemanaDespues.setDate(hoy.getDate() + 7);
        
        if (fechaCurso <= unaSemanaDespues) return 'Activo';
        
        // Si es más de una semana en el futuro, es "Programado"
        return 'Programado';
    };

    // Función para formatear fecha
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

    // Función MEJORADA para test de conexión con manejo de errores CORS
    const testBackendConnection = async () => {
        try {
            console.log('🔍 Probando conexión con backend...');
            
            // Probar conexión con timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            try {
                const test1 = await fetch(`/api/instructor-cursos/instructor/3`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                console.log('✅ Test Proxy - Status:', test1.status);
                
                if (test1.ok) {
                    const contentType = test1.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await test1.json();
                        console.log('✅ Test Proxy - Datos recibidos:', data);
                        return true;
                    } else {
                        const text = await test1.text();
                        console.log('⚠️ Test Proxy - Respuesta no JSON:', text);
                        return false;
                    }
                }
                return false;
            } catch (fetchError) {
                clearTimeout(timeoutId);
                if (fetchError.name === 'AbortError') {
                    console.log('❌ Test Proxy - Timeout');
                } else {
                    throw fetchError;
                }
                return false;
            }
            
        } catch (error) {
            console.error('❌ Error en test de conexión:', error);
            return false;
        }
    };

    // =================================================================
    // DATOS SIMULADOS (FALLBACK)
    // =================================================================

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

    // Datos de ejemplo basados en el instructor (fallback)
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
                    alumnosInscritos: obtenerAlumnosPorCurso(2)?.length || 0,
                    stps: "STPS-MP-004",
                    tieneExamenPractico: true
                },
                { 
                    id: 3, 
                    nombre: "Seguridad Industrial", 
                    fechaIngreso: "2025-04-22", 
                    lugar: "Area de simulacion",
                    estado: "Activo", 
                    alumnosInscritos: obtenerAlumnosPorCurso(3)?.length || 0,
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
                alumnosInscritos: obtenerAlumnosPorCurso(17)?.length || 0,
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

    // =================================================================
    // FIN DATOS SIMULADOS
    // =================================================================

    // Función MEJORADA para cargar cursos con manejo de errores CORS
    const cargarCursosInstructor = async () => {
        try {
            const userData = getUserData();
            
            if (!userData) {
                showNotification('No se pudo identificar al instructor', 'error');
                return [];
            }

            const instructorId = userData.id || userData.num_empleado;
            console.log('📚 Cargando cursos REALES para instructor ID:', instructorId);

            // LLAMADA REAL A LA API - CON MANEJO ROBUSTO DE ERRORES
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            try {
                const response = await fetch(`/api/instructor-cursos/instructor/${instructorId}`, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                // Verificar que la respuesta sea JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const textResponse = await response.text();
                    console.warn('⚠️ Respuesta no JSON recibida:', textResponse.substring(0, 100));
                    throw new Error('Respuesta del servidor no es JSON válido');
                }

                const cursosReales = await response.json();
                console.log('✅ Cursos REALES cargados desde BD:', cursosReales);
                
                // Procesar los cursos para el frontend
                const cursosProcesados = cursosReales.map(curso => ({
                    id: curso.id,
                    nombre: curso.nombre,
                    fechaIngreso: curso.fechaIngreso,
                    lugar: curso.lugar,
                    estado: determinarEstadoCurso(curso.fechaIngreso),
                    alumnosInscritos: obtenerAlumnosPorCurso(curso.id)?.length || 0,
                    stps: curso.stps,
                    tieneExamenPractico: curso.examenPractico || false,
                    horas: curso.horas || 8,
                    empresa: curso.empresa,
                    instructor: curso.instructor
                }));
                
                setCursos(cursosProcesados);
                return cursosProcesados;

            } catch (fetchError) {
                clearTimeout(timeoutId);
                if (fetchError.name === 'AbortError') {
                    throw new Error('Timeout: El servidor no respondió a tiempo');
                } else {
                    throw fetchError;
                }
            }

        } catch (error) {
            console.error('❌ Error cargando cursos reales:', error);
            
            // Mostrar mensaje específico según el tipo de error
            let mensajeError = 'Error al conectar con el servidor. ';
            if (error.message.includes('Timeout')) {
                mensajeError += 'El servidor está tardando demasiado en responder.';
            } else if (error.message.includes('CORS')) {
                mensajeError += 'Problema de configuración CORS.';
            } else if (error.message.includes('JSON')) {
                mensajeError += 'Respuesta inválida del servidor.';
            } else {
                mensajeError += 'Usando datos de ejemplo.';
            }
            
            showNotification(mensajeError, 'warning');
            
            // Fallback a datos simulados si hay error
            const userData = getUserData();
            const cursosInstructor = obtenerCursosPorInstructor(userData?.id);
            setCursos(cursosInstructor);
            return cursosInstructor;
        }
    };

    // Datos de ejemplo para el dashboard
    const obtenerDatosEjemplo = (userData, cursosReales = []) => {
        // Usar cursos reales si están disponibles, si no usar simulados
        const cursosParaEstadisticas = cursosReales.length > 0 ? cursosReales : obtenerCursosPorInstructor(userData?.id);
        
        const cursosActivos = cursosParaEstadisticas.filter(c => c.estado === 'Activo').length;
        const cursosProgramados = cursosParaEstadisticas.filter(c => c.estado === 'Programado').length;
        const totalEstudiantes = cursosParaEstadisticas.reduce((acc, cur) => acc + (cur.alumnosInscritos || 0), 0);

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

    // Función MEJORADA para cargar evidencia con manejo de errores
    const cargarEvidenciaCurso = async (cursoId) => {
        try {
            console.log('📷 Cargando evidencia para curso ID:', cursoId);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            try {
                const response = await fetch(`/api/evidencia/subir?cursoId=${cursoId}`, {
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const evidenciaData = await response.json();
                    setArchivos(evidenciaData);
                    console.log('✅ Evidencia cargada:', evidenciaData.length, 'archivos');
                } else {
                    console.log('ℹ️ No hay evidencia para este curso o error del servidor');
                    setArchivos([]);
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
                if (fetchError.name === 'AbortError') {
                    console.log('⚠️ Timeout cargando evidencia');
                } else {
                    console.log('⚠️ Error cargando evidencia:', fetchError.message);
                }
                // En caso de error, mostrar datos de ejemplo
                setArchivos([
                    { 
                        id: 1, 
                        nombre: 'foto_grupo.jpg', 
                        fecha: '2025-01-15', 
                        tipo: 'image/jpeg',
                        ruta: '/uploads/evidencia/curso-2/foto_grupo.jpg',
                        tamanio: 2048576
                    },
                    { 
                        id: 2, 
                        nombre: 'practica_equipos.jpg', 
                        fecha: '2025-01-15', 
                        tipo: 'image/jpeg',
                        ruta: '/uploads/evidencia/curso-2/practica_equipos.jpg',
                        tamanio: 3048576
                    }
                ]);
            }
        } catch (error) {
            console.error('❌ Error en cargarEvidenciaCurso:', error);
            setArchivos([]);
        }
    };

    const cargarDashboard = async () => {
        try {
            const userData = getUserData();
            
            if (!userData) {
                showNotification('No se encontraron datos de usuario. Redirigiendo al login...', 'error');
                setTimeout(() => router.push('/'), 2000);
                return;
            }

            console.log('📊 Cargando dashboard para:', userData.name);
            
            // Test de conexión primero
            const conexionExitosa = await testBackendConnection();
            
            if (!conexionExitosa) {
                console.log('🔄 Usando datos locales - conexión falló');
                const datosLocales = obtenerDatosEjemplo(userData);
                setDashboard(datosLocales);
                setCursos(obtenerCursosPorInstructor(userData?.id));
                setLoading(false);
                return;
            }
            
            // Cargar cursos primero para usar en el dashboard
            const cursosCargados = await cargarCursosInstructor();
            
            // Usar datos del dashboard con cursos reales
            const datosDashboard = obtenerDatosEjemplo(userData, cursosCargados);
            setDashboard(datosDashboard);
            
        } catch (error) {
            console.error('Error cargando dashboard:', error);
            const userData = getUserData();
            const datosLocales = obtenerDatosEjemplo(userData);
            setDashboard(datosLocales);
            setCursos(obtenerCursosPorInstructor(userData?.id));
        } finally {
            setLoading(false);
        }
    };

    const cargarAlumnosPorCurso = async (cursoId) => {
        try {
            console.log('🎓 Cargando alumnos para curso ID:', cursoId);
            
            // Por ahora usar datos simulados, luego implementar API real
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

    const handleCalificarAlumno = (alumnoCurp, calificacion) => {
        console.log(`📝 Calificando alumno ${alumnoCurp}:`, calificacion);
        
        // Aquí deberías hacer la llamada a tu API para guardar en la base de datos
        // Por ahora simulamos el guardado
        showNotification(`Calificación guardada para ${alumnoCurp}: ${calificacion.resultado}`, 'success');
        
        // En una implementación real, aquí harías:
        // await api.guardarCalificacion(alumnoCurp, cursoSeleccionado, calificacion);
    };

    // Función MEJORADA para subir evidencia con manejo robusto de errores
    const handleSubirEvidencia = async (cursoId, archivos) => {
        try {
            console.log(`📷 Subiendo evidencia para curso ${cursoId}:`, archivos);
            
            if (!cursoId || archivos.length === 0) {
                showNotification('Selecciona un curso y al menos un archivo', 'error');
                return;
            }

            const userData = getUserData();
            if (!userData) {
                showNotification('No se pudo identificar al instructor', 'error');
                return;
            }

            // Validar tamaño de archivos (límite 10MB por archivo)
            const archivosDemasiadoGrandes = archivos.filter(file => file.size > 10 * 1024 * 1024);
            if (archivosDemasiadoGrandes.length > 0) {
                showNotification(`Algunos archivos superan 10MB: ${archivosDemasiadoGrandes.map(f => f.name).join(', ')}`, 'error');
                return;
            }

            // Crear FormData para enviar múltiples archivos
            const formData = new FormData();
            
            // Agregar cada archivo al FormData
            archivos.forEach((archivo) => {
                formData.append(`archivos`, archivo);
            });
            
            // Agregar metadatos
            formData.append('cursoId', cursoId);
            formData.append('instructorId', userData.id || userData.num_empleado);
            formData.append('instructorNombre', userData.name);

            // Mostrar loading
            showNotification('Subiendo evidencia...', 'info');

            // Llamar a la API para subir evidencia con timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seg timeout para archivos grandes

            try {
                console.log('🔄 Enviando solicitud a /api/evidencia/subir...');
                
                const response = await fetch('/api/evidencia/subir', {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                    // No incluir Content-Type header - se establece automáticamente con FormData
                });

                clearTimeout(timeoutId);

                console.log('📨 Respuesta recibida, status:', response.status);

                if (!response.ok) {
                    // Manejar errores de forma segura sin leer el stream múltiples veces
                    let errorMessage = `Error ${response.status}: ${response.statusText}`;
                    
                    try {
                        // Intentar obtener detalles del error
                        const errorText = await response.text();
                        if (errorText) {
                            try {
                                const errorData = JSON.parse(errorText);
                                errorMessage = errorData.error || errorData.message || errorMessage;
                                if (errorData.details) {
                                    errorMessage += ` - ${errorData.details}`;
                                }
                            } catch {
                                errorMessage = errorText.substring(0, 100); // Limitar longitud
                            }
                        }
                    } catch (textError) {
                        console.error('Error leyendo respuesta de error:', textError);
                        // Usar el mensaje por defecto si no se puede leer la respuesta
                    }
                    
                    throw new Error(errorMessage);
                }

                // Procesar respuesta exitosa
                const resultado = await response.json();
                console.log('✅ Evidencia subida correctamente:', resultado);
                
                // Actualizar la lista de archivos
                await cargarEvidenciaCurso(cursoId);
                
                showNotification(`✅ ${resultado.totalSubidos || archivos.length} archivo(s) subido(s) correctamente`, 'success');
                
            } catch (fetchError) {
                clearTimeout(timeoutId);
                
                if (fetchError.name === 'AbortError') {
                    throw new Error('Timeout: La subida tardó demasiado tiempo. Intenta con archivos más pequeños o verifica tu conexión.');
                } else if (fetchError.message.includes('CORS') || fetchError.message.includes('Network Error')) {
                    throw new Error('Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet.');
                } else {
                    throw fetchError;
                }
            }
            
        } catch (error) {
            console.error('❌ Error subiendo evidencia:', error);
            
            let mensajeError = 'Error al subir evidencia: ';
            
            if (error.message.includes('Timeout')) {
                mensajeError += 'La subida tardó demasiado tiempo. Intenta con archivos más pequeños.';
            } else if (error.message.includes('CORS') || error.message.includes('Network Error')) {
                mensajeError += 'Problema de conexión con el servidor. Verifica tu conexión a internet.';
            } else if (error.message.includes('Failed to fetch')) {
                mensajeError += 'No se pudo conectar con el servidor. El servidor puede estar caído.';
            } else {
                mensajeError += error.message;
            }
            
            showNotification(mensajeError, 'error');
        }
    };

    // Función para descargar archivos de evidencia
    const handleDescargarArchivo = async (archivo) => {
        try {
            // Si el archivo tiene una ruta, descargarlo
            if (archivo.ruta) {
                const response = await fetch(archivo.ruta);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = archivo.nombre;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                // Si no tiene ruta, intentar descargar desde la API
                const response = await fetch(`/api/evidencia/descargar/${archivo.id}`);
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = archivo.nombre;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            }
        } catch (error) {
            console.error('Error descargando archivo:', error);
            showNotification('Error al descargar el archivo', 'error');
        }
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
                        formatFecha={formatFecha}
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
                        cargarEvidenciaCurso={cargarEvidenciaCurso}
                        onDescargarArchivo={handleDescargarArchivo}
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
function VistaCursos({ cursos, dashboard, formatFecha }) {
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
                                        {curso.horas && <br />}
                                        {curso.horas && <small>Horas: {curso.horas}</small>}
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

    // Función para calcular el promedio basado en los exámenes disponibles
    const calcularPromedio = (evalInicial, evalFinal, evalPractica, tieneExamenPractico) => {
        const inicial = parseFloat(evalInicial) || 0;
        const final = parseFloat(evalFinal) || 0;
        const practica = parseFloat(evalPractica) || 0;
        
        let suma = 0;
        let cantidadExamenes = 0;
        
        // Incluir evaluación inicial si tiene valor
        if (inicial > 0) {
            suma += inicial;
            cantidadExamenes++;
        }
        
        // Incluir evaluación final si tiene valor
        if (final > 0) {
            suma += final;
            cantidadExamenes++;
        }
        
        // Incluir examen práctico si tiene valor y el curso lo requiere
        if (tieneExamenPractico && practica > 0) {
            suma += practica;
            cantidadExamenes++;
        }
        
        // Si no hay exámenes con valor, retornar 0
        if (cantidadExamenes === 0) return 0;
        
        return suma / cantidadExamenes;
    };

    // Función para determinar si es APTO basado en el promedio y examen práctico
    const determinarResultado = (promedio, evalPractica, tieneExamenPractico, observaciones) => {
        // Si hay observaciones que indiquen "sin licencia", es NO APTO
        if (observaciones && observaciones.toLowerCase().includes('sin licencia')) {
            return 'NO APTO';
        }
        
        // Si el curso tiene examen práctico, debe sacar al menos 80%
        if (tieneExamenPractico) {
            const practicoAprobado = (parseFloat(evalPractica) || 0) >= 80;
            const promedioAprobado = promedio >= 70; // 70 como mínimo para aprobar
            return practicoAprobado && promedioAprobado ? 'APTO' : 'NO APTO';
        } else {
            // Si no tiene examen práctico, solo verificar el promedio
            return promedio >= 70 ? 'APTO' : 'NO APTO';
        }
    };

    const guardarCalificaciones = () => {
        const calificacionesCompletas = {};
        let calificacionesGuardadasCount = 0;

        Object.entries(calificaciones).forEach(([curp, calif]) => {
            if (calif && (calif.evaluacionFinal !== undefined || calif.examenPractico !== undefined)) {
                const evalInicial = parseFloat(calif.evaluacionInicial) || 0;
                const evalFinal = parseFloat(calif.evaluacionFinal) || 0;
                const evalPractica = parseFloat(calif.examenPractico) || 0;
                
                // Obtener información del curso actual
                const cursoActual = cursos.find(curso => curso.id === parseInt(cursoSeleccionado));
                const tieneExamenPractico = cursoActual ? cursoActual.tieneExamenPractico : true;
                
                const promedio = calcularPromedio(evalInicial, evalFinal, evalPractica, tieneExamenPractico);
                const resultado = determinarResultado(promedio, evalPractica, tieneExamenPractico, calif.observaciones);
                
                const calificacionCompleta = {
                    evaluacionInicial: evalInicial,
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
            const evalInicial = parseFloat(calif.evaluacionInicial) || 0;
            const evalFinal = parseFloat(calif.evaluacionFinal) || 0;
            const evalPractica = parseFloat(calif.examenPractico) || 0;
            
            // Obtener información del curso actual
            const cursoActual = cursos.find(curso => curso.id === parseInt(cursoSeleccionado));
            const tieneExamenPractico = cursoActual ? cursoActual.tieneExamenPractico : true;
            
            const promedio = calcularPromedio(evalInicial, evalFinal, evalPractica, tieneExamenPractico);
            const resultado = determinarResultado(promedio, evalPractica, tieneExamenPractico, calif.observaciones);
            
            const calificacionCompleta = {
                evaluacionInicial: evalInicial,
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
        
        // Requerimos evaluación final como mínimo
        const tieneEvaluacionFinal = calif.evaluacionFinal !== undefined && calif.evaluacionFinal !== '';
        
        // Si el curso tiene examen práctico, también lo requerimos
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
                        <p>***Los promedios se obtienen con todos los exámenes disponibles (inicial, final y práctico si aplica)</p>
                        <p>***El curso se acredita principalmente con el examen práctico (si aplica) y algunas observaciones con el instructor</p>
                        <p>***Para ser APTO: Mínimo 70 de promedio y 80 en examen práctico (si aplica)</p>
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
                                    const evalInicial = parseFloat(califAlumno.evaluacionInicial) || 0;
                                    const evalFinal = parseFloat(califAlumno.evaluacionFinal) || 0;
                                    const evalPractica = parseFloat(califAlumno.examenPractico) || 0;
                                    
                                    const promedio = califAlumno.promedio || calcularPromedio(evalInicial, evalFinal, evalPractica, tieneExamenPractico);
                                    const resultado = califAlumno.resultado || determinarResultado(promedio, evalPractica, tieneExamenPractico, califAlumno.observaciones);
                                    
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
                                                    title={puedeGuardar ? "Guardar calificación" : "Complete evaluación final" + (tieneExamenPractico ? " y examen práctico" : "")}
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

// Componente MEJORADO para la vista de Evidencia
function VistaEvidencia({ 
    cursos, 
    cursoEvidencia, 
    setCursoEvidencia, 
    archivos, 
    onSubirEvidencia,
    cargarEvidenciaCurso,
    onDescargarArchivo
}) {
    const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);
    const [subiendo, setSubiendo] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Validar tipos de archivo
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'application/pdf'];
        const archivosValidos = files.filter(file => tiposPermitidos.includes(file.type));
        
        if (archivosValidos.length !== files.length) {
            console.warn('Algunos archivos no son válidos');
        }
        
        setArchivosSeleccionados(archivosValidos);
    };

    const handleSubirArchivos = async () => {
        if (archivosSeleccionados.length === 0 || !cursoEvidencia) {
            return;
        }

        setSubiendo(true);
        try {
            await onSubirEvidencia(cursoEvidencia, archivosSeleccionados);
            setArchivosSeleccionados([]);
            // Limpiar el input de archivos
            const fileInput = document.querySelector(`.${styles.fileInput}`);
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error('Error en handleSubirArchivos:', error);
        } finally {
            setSubiendo(false);
        }
    };

    const handleEliminarArchivoSeleccionado = (index) => {
        setArchivosSeleccionados(prev => prev.filter((_, i) => i !== index));
    };

    const handleSeleccionarCurso = (cursoId) => {
        setCursoEvidencia(cursoId);
        if (cursoId) {
            cargarEvidenciaCurso(cursoId);
        } else {
            setArchivos([]);
        }
    };

    // Función para obtener el icono según el tipo de archivo
    const getIconoArchivo = (tipo) => {
        if (tipo.includes('image')) return '🖼️';
        if (tipo.includes('video')) return '🎥';
        if (tipo === 'application/pdf') return '📄';
        return '📎';
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

            {cursoEvidencia && (
                <div className={styles.uploadSection}>
                    <div className={styles.uploadArea}>
                        <h3>Subir Evidencia</h3>
                        <p className={styles.instrucciones}>
                            Puedes seleccionar múltiples archivos (fotos, videos, PDF). 
                            Tamaño máximo por archivo: 10MB
                        </p>
                        
                        <div className={styles.fileInputContainer}>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*,video/*,.pdf"
                                onChange={handleFileChange}
                                className={styles.fileInput}
                                id="evidenciaInput"
                                disabled={subiendo}
                            />
                            <label htmlFor="evidenciaInput" className={styles.fileInputLabel}>
                                📁 Seleccionar Archivos
                            </label>
                        </div>

                        {/* Lista de archivos seleccionados */}
                        {archivosSeleccionados.length > 0 && (
                            <div className={styles.fileList}>
                                <h4>Archivos seleccionados ({archivosSeleccionados.length}):</h4>
                                {archivosSeleccionados.map((file, index) => (
                                    <div key={index} className={styles.fileItem}>
                                        <span className={styles.fileIcon}>
                                            {getIconoArchivo(file.type)}
                                        </span>
                                        <span className={styles.fileInfo}>
                                            <strong>{file.name}</strong>
                                            <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                                        </span>
                                        <button 
                                            onClick={() => handleEliminarArchivoSeleccionado(index)}
                                            className={styles.btnEliminarArchivo}
                                            disabled={subiendo}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button 
                            className={styles.btnGuardar} 
                            onClick={handleSubirArchivos}
                            disabled={archivosSeleccionados.length === 0 || subiendo}
                        >
                            {subiendo ? '📤 Subiendo...' : `📤 Subir ${archivosSeleccionados.length} Archivo(s)`}
                        </button>
                    </div>

                    {/* Archivos subidos */}
                    <div className={styles.archivosSubidos}>
                        <h3>Archivos Subidos</h3>
                        {archivos.length > 0 ? (
                            <div className={styles.archivosGrid}>
                                {archivos.map((archivo, index) => (
                                    <div key={archivo.id || index} className={styles.archivoItem}>
                                        <div className={styles.archivoIcono}>
                                            {getIconoArchivo(archivo.tipo || '')}
                                        </div>
                                        <div className={styles.archivoInfo}>
                                            <span className={styles.archivoNombre}>{archivo.nombre}</span>
                                            <small className={styles.archivoFecha}>
                                                Subido: {new Date(archivo.fecha).toLocaleDateString('es-ES')}
                                            </small>
                                            {archivo.tamanio && (
                                                <small className={styles.archivoTamanio}>
                                                    {(archivo.tamanio / 1024 / 1024).toFixed(2)} MB
                                                </small>
                                            )}
                                        </div>
                                        <div className={styles.archivoAcciones}>
                                            <button 
                                                className={styles.btnDescargar}
                                                onClick={() => onDescargarArchivo(archivo)}
                                                title="Descargar archivo"
                                            >
                                                ⬇️
                                            </button>
                                            <button 
                                                className={styles.btnEliminar}
                                                title="Eliminar archivo"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.sinArchivos}>No hay archivos subidos para este curso</p>
                        )}
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