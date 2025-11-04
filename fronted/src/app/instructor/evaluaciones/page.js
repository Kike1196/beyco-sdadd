// app/instructor/evaluaciones/page.js - PÁGINA INDEPENDIENTE DE EVALUACIONES
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

export default function EvaluacionesPage() {
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [alumnosCurso, setAlumnosCurso] = useState([]);
    const [calificaciones, setCalificaciones] = useState({});
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

    const getUserData = () => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            return userData;
        } catch (error) {
            console.error('Error obteniendo datos del usuario:', error);
            return null;
        }
    };

    // Datos de ejemplo
    const obtenerAlumnosPorCurso = (cursoId) => {
        const alumnosPorCurso = {
            2: [
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
                }
            ],
            3: [
                {
                    curp: 'AGSA940214TSLAS06',
                    nombre: 'Alejandra',
                    apellidoPaterno: 'Aguirre',
                    apellidoMaterno: 'Soto',
                    calificacion: 0,
                    asistencia: '85%'
                },
                {
                    curp: 'CRUB750305JLMCC02',
                    nombre: 'Benito',
                    apellidoPaterno: 'Cruz',
                    apellidoMaterno: 'Robles',
                    calificacion: 0,
                    asistencia: '100%'
                }
            ]
        };
        return alumnosPorCurso[cursoId] || [];
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

            const cursosCargados = obtenerCursosPorInstructor(userData?.id);
            setCursos(cursosCargados);
            
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarAlumnosPorCurso = async (cursoId) => {
        try {
            setLoading(true);
            setTimeout(() => {
                const alumnos = obtenerAlumnosPorCurso(cursoId);
                setAlumnosCurso(alumnos);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error cargando alumnos:', error);
            setAlumnosCurso(obtenerAlumnosPorCurso(cursoId));
            setLoading(false);
        }
    };

    const handleCalificarAlumno = (alumnoCurp, calificacion) => {
        console.log(`📝 Calificando alumno ${alumnoCurp}:`, calificacion);
        showNotification(`Calificación guardada para ${alumnoCurp}: ${calificacion.resultado}`, 'success');
    };

    const handleCalificacionChange = (alumnoCurp, campo, valor) => {
        if (campo !== 'observaciones') {
            const numValue = parseInt(valor);
            if (numValue > 100) {
                valor = '100';
            } else if (numValue < 0) {
                valor = '0';
            } else if (isNaN(numValue)) {
                valor = '';
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

    const calcularPromedio = (evalInicial, evalFinal, evalPractica, tieneExamenPractico) => {
        const inicial = parseFloat(evalInicial) || 0;
        const final = parseFloat(evalFinal) || 0;
        const practica = parseFloat(evalPractica) || 0;
        
        let suma = 0;
        let cantidadExamenes = 0;
        
        if (inicial > 0) {
            suma += inicial;
            cantidadExamenes++;
        }
        
        if (final > 0) {
            suma += final;
            cantidadExamenes++;
        }
        
        if (tieneExamenPractico && practica > 0) {
            suma += practica;
            cantidadExamenes++;
        }
        
        if (cantidadExamenes === 0) return 0;
        
        return suma / cantidadExamenes;
    };

    const determinarResultado = (promedio, evalPractica, tieneExamenPractico, observaciones) => {
        if (observaciones && observaciones.toLowerCase().includes('sin licencia')) {
            return 'NO APTO';
        }
        
        if (tieneExamenPractico) {
            const practicoAprobado = (parseFloat(evalPractica) || 0) >= 80;
            const promedioAprobado = promedio >= 70;
            return practicoAprobado && promedioAprobado ? 'APTO' : 'NO APTO';
        } else {
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
                handleCalificarAlumno(curp, calificacionCompleta);
                calificacionesGuardadasCount++;
            }
        });

        if (calificacionesGuardadasCount > 0) {
            setCalificacionesGuardadas(prev => ({ ...prev, ...calificacionesCompletas }));
            setCalificaciones({});
            showNotification(`${calificacionesGuardadasCount} calificación(es) guardada(s) correctamente`, 'success');
        }
    };

    const guardarCalificacionIndividual = (alumnoCurp) => {
        const calif = calificaciones[alumnoCurp];
        if (calif && (calif.evaluacionFinal !== undefined || calif.examenPractico !== undefined)) {
            const evalInicial = parseFloat(calif.evaluacionInicial) || 0;
            const evalFinal = parseFloat(calif.evaluacionFinal) || 0;
            const evalPractica = parseFloat(calif.examenPractico) || 0;
            
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
            
            handleCalificarAlumno(alumnoCurp, calificacionCompleta);
            setCalificacionesGuardadas(prev => ({
                ...prev,
                [alumnoCurp]: calificacionCompleta
            }));
            
            setCalificaciones(prev => {
                const nuevasCalificaciones = { ...prev };
                delete nuevasCalificaciones[alumnoCurp];
                return nuevasCalificaciones;
            });
        }
    };

    const handleSeleccionarCurso = (cursoId) => {
        setCursoSeleccionado(cursoId);
        setCalificaciones({});
        setCalificacionesGuardadas({});
        cargarAlumnosPorCurso(cursoId);
    };

    const handleBlur = (alumnoCurp, campo, valor) => {
        if (campo !== 'observaciones') {
            const numValue = parseInt(valor);
            if (isNaN(numValue)) {
                handleCalificacionChange(alumnoCurp, campo, '');
            } else if (numValue > 100) {
                handleCalificacionChange(alumnoCurp, campo, '100');
            } else if (numValue < 0) {
                handleCalificacionChange(alumnoCurp, campo, '0');
            }
        }
    };

    const obtenerValorCampo = (alumnoCurp, campo) => {
        if (calificaciones[alumnoCurp] && calificaciones[alumnoCurp][campo] !== undefined) {
            const valor = calificaciones[alumnoCurp][campo];
            return campo === 'observaciones' ? valor : (valor === '' ? '' : valor);
        }
        if (calificacionesGuardadas[alumnoCurp] && calificacionesGuardadas[alumnoCurp][campo] !== undefined) {
            const valor = calificacionesGuardadas[alumnoCurp][campo];
            return campo === 'observaciones' ? valor : (valor === 0 ? '' : valor.toString());
        }
        return '';
    };

    const tieneCambiosPendientes = (alumnoCurp) => {
        return calificaciones[alumnoCurp] !== undefined;
    };

    const puedeCalificar = (alumnoCurp) => {
        const calif = calificaciones[alumnoCurp];
        if (!calif) return false;
        
        const tieneEvaluacionFinal = calif.evaluacionFinal !== undefined && calif.evaluacionFinal !== '';
        const cursoActual = cursos.find(curso => curso.id === parseInt(cursoSeleccionado));
        const tieneExamenPractico = cursoActual ? cursoActual.tieneExamenPractico : true;
        const tieneExamenPracticoRequerido = !tieneExamenPractico || (calif.examenPractico !== undefined && calif.examenPractico !== '');
        
        return tieneEvaluacionFinal && tieneExamenPracticoRequerido;
    };

    const cursoActual = cursos.find(curso => curso.id === parseInt(cursoSeleccionado));
    const tieneExamenPractico = cursoActual ? cursoActual.tieneExamenPractico : true;

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
                    <h1>Sistema de Evaluaciones</h1>
                    <p>Calificación de estudiantes y registro de resultados</p>
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
                {/* Breadcrumb */}
                <div className={styles.breadcrumb}>
                    <Link href="/instructor" className={styles.breadcrumbLink}>Dashboard</Link>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    <span className={styles.breadcrumbCurrent}>Evaluaciones</span>
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
                            <h3>Calificaciones del Curso: {cursoActual?.nombre}</h3>
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

                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner}></div>
                                <p>Cargando alumnos...</p>
                            </div>
                        ) : (
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
                                            <td colSpan={tieneExamenPractico ? "8" : "7"} className={styles.noData}>
                                                No hay alumnos inscritos en este curso
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

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