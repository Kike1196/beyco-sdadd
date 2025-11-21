// app/secretaria/evaluaciones/page.js - VERSIÓN SOLO LECTURA PARA SECRETARÍA
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Evaluaciones.module.css';

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

export default function EvaluacionesSecretariaPage() {
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [alumnosCurso, setAlumnosCurso] = useState([]);
    const [calificacionesGuardadas, setCalificacionesGuardadas] = useState({});
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const router = useRouter();

    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
    };
    
    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    // Obtener todos los cursos (sin filtrar por instructor)
    const obtenerTodosLosCursos = async () => {
        try {
            console.log('🔍 Obteniendo todos los cursos...');
            
            const response = await fetch('http://localhost:8080/api/cursos');
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Todos los cursos obtenidos:', data);
                
                const cursosUnicos = eliminarDuplicados(data || []);
                console.log(`🔄 Cursos después de eliminar duplicados: ${cursosUnicos.length}`);
                
                return cursosUnicos;
            } else {
                console.error('❌ Error obteniendo cursos:', response.status);
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
        } catch (error) {
            console.error('Error obteniendo cursos:', error);
            showNotification('Error al cargar los cursos: ' + error.message, 'error');
            return [];
        }
    };

    // Función para eliminar cursos duplicados
    const eliminarDuplicados = (cursosArray) => {
        const cursosUnicos = [];
        const idsVistos = new Set();
        
        cursosArray.forEach(curso => {
            const id = curso.Id_Curso || curso.id_curso || curso.id;
            
            if (id && !idsVistos.has(id)) {
                idsVistos.add(id);
                
                const cursoNormalizado = {
                    Id_Curso: id,
                    Nombre: curso.Nombre || curso.nombre || curso.Nombre_curso || 'Curso sin nombre',
                    FechaIngreso: curso.FechaIngreso || curso.fechaIngreso || curso.Fecha_Imparticion || new Date(),
                    Examen_practico: curso.Examen_practico || curso.examen_practico || false,
                    Lugar: curso.Lugar || curso.lugar || 'Lugar no especificado',
                    Clave_STPS: curso.Clave_STPS || curso.clave_stps || 'STPS-ND',
                    Horas: curso.Horas || curso.horas || 8,
                    Empresa: curso.Empresa || curso.empresa || 'Empresa no especificada',
                    Instructor: curso.Instructor || curso.instructor || 'Instructor no especificado'
                };
                
                cursosUnicos.push(cursoNormalizado);
            }
        });
        
        console.log(`📊 Eliminados ${cursosArray.length - cursosUnicos.length} cursos duplicados`);
        return cursosUnicos;
    };

    // Normalizar datos del alumno para asegurar consistencia
    const normalizarAlumno = (alumno) => {
        return {
            Curp: alumno.Curp || alumno.curp || '',
            Nombre: alumno.Nombre || alumno.nombre || '',
            Apellido_paterno: alumno.Apellido_paterno || alumno.apellidoPaterno || alumno.apellido_paterno || '',
            Apellido_materno: alumno.Apellido_materno || alumno.apellidoMaterno || alumno.apellido_materno || '',
            Puesto: alumno.Puesto || alumno.puesto || '',
            Fecha_Nacimiento: alumno.Fecha_Nacimiento || alumno.fechaNacimiento || null
        };
    };

    // Obtener alumnos inscritos en un curso
    const obtenerAlumnosPorCurso = async (cursoId) => {
        try {
            console.log(`🔍 Obteniendo alumnos para curso: ${cursoId}`);
            
            const response = await fetch(`http://localhost:8080/api/instructor-cursos/${cursoId}/alumnos`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Respuesta de alumnos:', data);
                
                if (data.success && data.alumnos) {
                    // Normalizar cada alumno
                    const alumnosNormalizados = data.alumnos.map(alumno => normalizarAlumno(alumno));
                    console.log('📋 Alumnos normalizados:', alumnosNormalizados);
                    return alumnosNormalizados;
                } else {
                    console.warn('⚠️ Respuesta de alumnos sin datos:', data);
                    return [];
                }
            } else {
                console.error('❌ Error obteniendo alumnos:', response.status);
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
        } catch (error) {
            console.error('Error obteniendo alumnos:', error);
            showNotification('Error al cargar los alumnos: ' + error.message, 'error');
            return [];
        }
    };

    // Obtener calificación individual de un alumno
    const obtenerCalificacionAlumno = async (alumnoCurp, cursoId) => {
        try {
            console.log(`🔍 Obteniendo calificación para ${alumnoCurp} en curso ${cursoId}`);
            
            const response = await fetch(`http://localhost:8080/api/calificaciones/curso/${cursoId}/alumno/${alumnoCurp}`);
            
            if (!response.ok) {
                console.log(`⚠️ No se pudo obtener calificación para ${alumnoCurp} (status: ${response.status})`);
                return null;
            }
            
            const responseText = await response.text();
            if (!responseText || responseText.trim() === '' || responseText === 'null') {
                console.log(`ℹ️ No hay calificación guardada para ${alumnoCurp}`);
                return null;
            }
            
            const calificacion = JSON.parse(responseText);
            console.log(`✅ Calificación obtenida para ${alumnoCurp}:`, calificacion);
            return calificacion;
            
        } catch (error) {
            console.error(`❌ Error obteniendo calificación para ${alumnoCurp}:`, error);
            return null;
        }
    };

    // Cargar todas las calificaciones del curso
    const cargarCalificacionesCurso = async (cursoId, alumnos) => {
        try {
            const calificacionesMap = {};
            
            if (alumnos.length === 0) {
                console.log('ℹ️ No hay alumnos en este curso');
                return {};
            }
            
            console.log(`📊 Cargando calificaciones para ${alumnos.length} alumnos`);
            
            const promesasCalificaciones = alumnos.map(async (alumno) => {
                const calificacion = await obtenerCalificacionAlumno(alumno.Curp, cursoId);
                if (calificacion) {
                    calificacionesMap[alumno.Curp] = {
                        evaluacionInicial: calificacion.evaluacionInicial || 0,
                        evaluacionFinal: calificacion.evaluacionFinal || 0,
                        examenPractico: calificacion.examenPractico || 0,
                        promedio: calificacion.promedio || 0,
                        resultado: calificacion.resultado || '',
                        observaciones: calificacion.observaciones || ''
                    };
                }
            });
            
            await Promise.all(promesasCalificaciones);
            console.log(`✅ Calificaciones cargadas para ${Object.keys(calificacionesMap).length} alumnos`);
            return calificacionesMap;
            
        } catch (error) {
            console.error('Error cargando calificaciones del curso:', error);
            return {};
        }
    };

    // Cargar datos iniciales
    const cargarDatos = async () => {
        try {
            console.log('🚀 Cargando todos los cursos para secretaría...');
            
            const cursosCargados = await obtenerTodosLosCursos();
            setCursos(cursosCargados);
            
            if (cursosCargados.length === 0) {
                showNotification('No se encontraron cursos en el sistema', 'info');
            } else {
                console.log(`✅ ${cursosCargados.length} cursos cargados`);
                showNotification(`${cursosCargados.length} cursos cargados correctamente`, 'success');
            }
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            showNotification('Error al cargar los datos: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Cargar alumnos y calificaciones cuando se selecciona un curso
    const cargarAlumnosPorCurso = async (cursoId) => {
        try {
            setLoading(true);
            console.log(`📚 Cargando datos para curso: ${cursoId}`);
            
            const alumnos = await obtenerAlumnosPorCurso(cursoId);
            const calificacionesExistentes = await cargarCalificacionesCurso(cursoId, alumnos);

            setAlumnosCurso(alumnos);
            setCalificacionesGuardadas(calificacionesExistentes);
            
            console.log(`✅ Datos cargados: ${alumnos.length} alumnos, ${Object.keys(calificacionesExistentes).length} calificaciones`);
            
            if (alumnos.length === 0) {
                showNotification('No hay alumnos inscritos en este curso', 'info');
            } else {
                showNotification(`${alumnos.length} alumnos cargados para este curso`, 'success');
            }
            
        } catch (error) {
            console.error('Error cargando datos del curso:', error);
            showNotification('Error al cargar los datos del curso: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Función para imprimir la tabla de calificaciones
    const imprimirCalificaciones = () => {
        const cursoActual = cursos.find(curso => curso.Id_Curso === parseInt(cursoSeleccionado));
        if (!cursoActual) return;
        
        const ventanaImpresion = window.open('', '_blank');
        ventanaImpresion.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Calificaciones - ${cursoActual.Nombre}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        color: #000;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 30px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 20px;
                    }
                    .header h1 { 
                        margin: 0; 
                        color: #001f3f;
                        font-size: 24px;
                    }
                    .header h2 {
                        margin: 5px 0;
                        color: #003366;
                        font-size: 18px;
                    }
                    .curso-info {
                        display: flex;
                        justify-content: space-between;
                        margin: 15px 0;
                        font-size: 14px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 20px 0;
                        font-size: 12px;
                    }
                    th, td { 
                        border: 1px solid #000; 
                        padding: 8px; 
                        text-align: left;
                    }
                    th { 
                        background-color: #f0f0f0; 
                        font-weight: bold;
                    }
                    .apto { 
                        background-color: #d4edda; 
                        color: #155724;
                        font-weight: bold;
                        text-align: center;
                    }
                    .no-apto { 
                        background-color: #f8d7da; 
                        color: #721c24;
                        font-weight: bold;
                        text-align: center;
                    }
                    .promedio-apto { color: #155724; font-weight: bold; }
                    .promedio-no-apto { color: #721c24; font-weight: bold; }
                    .firma-area {
                        margin-top: 50px;
                        display: flex;
                        justify-content: space-between;
                    }
                    .firma {
                        text-align: center;
                        border-top: 1px solid #000;
                        width: 200px;
                        padding-top: 5px;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 10px;
                        color: #666;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>BEYCO CONSULTORES</h1>
                    <h2>REPORTE DE CALIFICACIONES</h2>
                    <div class="curso-info">
                        <div><strong>Curso:</strong> ${cursoActual.Nombre}</div>
                        <div><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</div>
                    </div>
                    <div class="curso-info">
                        <div><strong>Instructor:</strong> ${cursoActual.Instructor}</div>
                        <div><strong>Empresa:</strong> ${cursoActual.Empresa}</div>
                    </div>
                    <div class="curso-info">
                        <div><strong>Clave STPS:</strong> ${cursoActual.Clave_STPS}</div>
                        <div><strong>Horas:</strong> ${cursoActual.Horas}</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>ALUMNO</th>
                            <th>CURP</th>
                            <th>EVALUACIÓN INICIAL</th>
                            <th>EVALUACIÓN FINAL</th>
                            ${cursoActual.Examen_practico ? '<th>EXAMEN PRÁCTICO</th>' : ''}
                            <th>PROMEDIO</th>
                            <th>RESULTADO</th>
                            <th>OBSERVACIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${alumnosCurso.map(alumno => {
                            const calif = calificacionesGuardadas[alumno.Curp] || {};
                            const evalInicial = calif.evaluacionInicial || 0;
                            const evalFinal = calif.evaluacionFinal || 0;
                            const evalPractica = calif.examenPractico || 0;
                            const promedio = calif.promedio || 0;
                            const resultado = calif.resultado || '';
                            const observaciones = calif.observaciones || '';
                            
                            return `
                                <tr>
                                    <td>${alumno.Nombre} ${alumno.Apellido_paterno} ${alumno.Apellido_materno}</td>
                                    <td>${alumno.Curp}</td>
                                    <td>${evalInicial > 0 ? evalInicial : '-'}</td>
                                    <td>${evalFinal > 0 ? evalFinal : '-'}</td>
                                    ${cursoActual.Examen_practico ? `<td>${evalPractica > 0 ? evalPractica : '-'}</td>` : ''}
                                    <td class="${promedio >= 70 ? 'promedio-apto' : 'promedio-no-apto'}">
                                        ${promedio > 0 ? promedio.toFixed(1) : '-'}
                                    </td>
                                    <td class="${resultado === 'APTO' ? 'apto' : 'no-apto'}">
                                        ${resultado || '-'}
                                    </td>
                                    <td>${observaciones}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                
                <div class="firma-area">
                    <div class="firma">
                        <div>_________________________</div>
                        <div>Instructor</div>
                        <div>${cursoActual.Instructor}</div>
                    </div>
                    <div class="firma">
                        <div>_________________________</div>
                        <div>Coordinador Académico</div>
                        <div>BEYCO Consultores</div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Documento generado automáticamente por el Sistema BEYCO Consultores - ${new Date().toLocaleString('es-ES')}</p>
                </div>
                
                <div class="no-print">
                    <button onclick="window.print()" style="padding: 10px 20px; margin: 20px; background: #001f3f; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Imprimir Documento
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; margin: 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Cerrar Ventana
                    </button>
                </div>
                
                <script>
                    // Auto-imprimir al cargar
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        ventanaImpresion.document.close();
    };

    const handleSeleccionarCurso = (cursoId) => {
        setCursoSeleccionado(cursoId);
        setCalificacionesGuardadas({});
        cargarAlumnosPorCurso(cursoId);
    };

    const obtenerValorCampo = (alumnoCurp, campo) => {
        if (calificacionesGuardadas[alumnoCurp] && calificacionesGuardadas[alumnoCurp][campo] !== undefined) {
            const valor = calificacionesGuardadas[alumnoCurp][campo];
            return campo === 'observaciones' ? valor : (valor === 0 ? '' : valor.toString());
        }
        return '';
    };

    const cursoActual = cursos.find(curso => curso.Id_Curso === parseInt(cursoSeleccionado));
    const tieneExamenPractico = cursoActual ? cursoActual.Examen_practico : true;

    useEffect(() => {
        cargarDatos();
    }, []);

    if (loading && !cursoSeleccionado) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Cargando evaluaciones...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {notification.show && (
                <NotificationToast 
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}

            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Sistema de Evaluaciones - Secretaría</h1>
                    <p>Consulta y visualización de calificaciones registradas</p>
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
                <div className={styles.breadcrumb}>
                    <Link href="/secretaria" className={styles.breadcrumbLink}> </Link>
                    <span className={styles.breadcrumbSeparator}></span>
                    <span className={styles.breadcrumbCurrent}></span>
                </div>

                <div className={styles.selectorSection}>
                    <label>Seleccionar Curso:</label>
                    <select 
                        value={cursoSeleccionado} 
                        onChange={(e) => handleSeleccionarCurso(e.target.value)}
                        className={styles.selector}
                    >
                        <option value="">-- Selecciona un curso --</option>
                        {cursos.map(curso => (
                            <option key={`curso-${curso.Id_Curso}`} value={curso.Id_Curso}>
                                {curso.Nombre} - {new Date(curso.FechaIngreso).toLocaleDateString('es-ES')}
                                {curso.Examen_practico ? ' (Con Práctico)' : ' (Solo Teórico)'}
                            </option>
                        ))}
                    </select>
                </div>

                {cursoSeleccionado && (
                    <div className={styles.tableContainer}>
                        <div className={styles.tableHeader}>
                            <h3>
                                Calificaciones del Curso: {cursoActual?.Nombre}
                                {cursoActual && (
                                    <span className={styles.tipoCurso}>
                                        {cursoActual.Examen_practico ? ' - Con Examen Práctico' : ' - Solo Exámenes Teóricos'}
                                    </span>
                                )}
                            </h3>
                            <div className={styles.accionesHeader}>
                                <button 
                                    className={styles.btnImprimir}
                                    onClick={imprimirCalificaciones}
                                    disabled={alumnosCurso.length === 0}
                                >
                                    🖨️ Imprimir Calificaciones
                                </button>
                            </div>
                        </div>
                        
                        <div className={styles.notasImportantes}>
                            <p>*** MODO CONSULTA: Solo visualización de calificaciones ya registradas ***</p>
                            <p>*** {tieneExamenPractico 
                                ? 'El examen práctico debe acreditarse con mínimo 80% y el promedio general con 70%' 
                                : 'El curso se acredita con promedio mínimo de 70% en los exámenes teóricos'
                            }</p>
                            <p>*** Para ser APTO: {tieneExamenPractico 
                                ? 'Mínimo 70 de promedio Y 80 en examen práctico' 
                                : 'Mínimo 70 de promedio general'
                            }</p>
                        </div>

                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner}></div>
                                <p>Cargando alumnos y calificaciones...</p>
                            </div>
                        ) : (
                            <table className={styles.cursosTable}>
                                <thead>
                                    <tr>
                                        <th>ALUMNO</th>
                                        <th>EVALUACIÓN INICIAL</th>
                                        <th>EVALUACIÓN FINAL</th>
                                        {tieneExamenPractico && <th>EXAMEN PRÁCTICO</th>}
                                        <th>PROMEDIO</th>
                                        <th>RESULTADO</th>
                                        <th>OBSERVACIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alumnosCurso.length > 0 ? (
                                        alumnosCurso.map((alumno, index) => {
                                            if (!alumno.Curp) {
                                                console.error('❌ Alumno sin CURP:', alumno);
                                                return null;
                                            }

                                            const califAlumno = calificacionesGuardadas[alumno.Curp] || {};
                                            
                                            const evalInicial = parseFloat(califAlumno.evaluacionInicial) || 0;
                                            const evalFinal = parseFloat(califAlumno.evaluacionFinal) || 0;
                                            const evalPractica = parseFloat(califAlumno.examenPractico) || 0;
                                            const promedio = parseFloat(califAlumno.promedio) || 0;
                                            const resultado = califAlumno.resultado || '';
                                            const observaciones = califAlumno.observaciones || '';
                                            
                                            return (
                                                <tr key={`alumno-${alumno.Curp}-${index}`}>
                                                    <td>
                                                        <div className={styles.infoAlumno}>
                                                            <strong>{alumno.Nombre} {alumno.Apellido_paterno} {alumno.Apellido_materno}</strong>
                                                            <small>CURP: {alumno.Curp}</small>
                                                            {alumno.Puesto && <small>Puesto: {alumno.Puesto}</small>}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={styles.calificacionLectura}>
                                                            {evalInicial > 0 ? evalInicial : '-'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={styles.calificacionLectura}>
                                                            {evalFinal > 0 ? evalFinal : '-'}
                                                        </span>
                                                    </td>
                                                    {tieneExamenPractico && (
                                                        <td>
                                                            <span className={styles.calificacionLectura}>
                                                                {evalPractica > 0 ? evalPractica : '-'}
                                                            </span>
                                                        </td>
                                                    )}
                                                    <td>
                                                        <span className={`${styles.promedio} ${promedio >= 70 ? styles.promedioApto : styles.promedioNoApto}`}>
                                                            {promedio > 0 ? promedio.toFixed(1) : '-'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`${styles.resultado} ${resultado === 'APTO' ? styles.apto : styles.noApto}`}>
                                                            {resultado || '-'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={styles.observacionesLectura}>
                                                            {observaciones}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={tieneExamenPractico ? "7" : "6"} className={styles.noData}>
                                                No hay alumnos inscritos en este curso
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                <div className={styles.actionsSection}>
                    <Link href="/secretaria/" className={styles.btnVolver}>
                        ← Volver 
                    </Link>
                </div>
            </main>
        </div>
    );
}