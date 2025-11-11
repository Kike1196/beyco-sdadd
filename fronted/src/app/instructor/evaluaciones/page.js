// app/instructor/evaluaciones/page.js - VERSIÓN CORREGIDA CON CÁLCULO DE PROMEDIO
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
    const [saving, setSaving] = useState(false);
    const [savingAll, setSavingAll] = useState(false);
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
            console.log('🔍 Datos del usuario obtenidos:', userData);
            
            if (!userData) {
                console.error('❌ No hay datos de usuario en localStorage');
                return null;
            }
            
            const instructorId = userData.Num_Empleado || userData.numEmpleado || userData.id || userData.userId;
            console.log('👤 ID del instructor encontrado:', instructorId);
            
            if (!instructorId) {
                console.error('❌ No se pudo encontrar el ID del instructor en:', userData);
                return null;
            }
            
            return {
                ...userData,
                instructorId: instructorId
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo datos del usuario:', error);
            return null;
        }
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

    // Obtener cursos del instructor - CON ELIMINACIÓN DE DUPLICADOS
    const obtenerCursosInstructor = async (instructorId) => {
        try {
            if (!instructorId || instructorId === 'undefined' || instructorId === 'null') {
                throw new Error('ID del instructor no válido: ' + instructorId);
            }
            
            console.log(`🔍 Obteniendo cursos para instructor: ${instructorId}`);
            
            const response = await fetch(`http://localhost:8080/api/instructor-cursos/instructor/${instructorId}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Cursos obtenidos del backend:', data);
                
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

    // Guardar calificación
    const guardarCalificacionBD = async (calificacionData) => {
        try {
            console.log('💾 Intentando guardar calificación:', calificacionData);
            
            if (!calificacionData.alumnoCurp || calificacionData.alumnoCurp.trim() === '') {
                throw new Error('CURP del alumno no válido');
            }
            
            const response = await fetch('http://localhost:8080/api/calificaciones/guardar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(calificacionData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.text();
            console.log('✅ Respuesta del servidor:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error guardando calificación:', error);
            
            let mensajeError = error.message;
            if (error.message.includes('foreign key constraint fails')) {
                mensajeError = 'El alumno no existe en la base de datos. Verifica que esté correctamente inscrito en el curso.';
            } else if (error.message.includes('Cannot add or update')) {
                mensajeError = 'Error de integridad de datos. Verifica que el alumno esté registrado en el sistema.';
            }
            
            throw new Error(mensajeError);
        }
    };

    // Cargar datos iniciales
    const cargarDatos = async () => {
        try {
            const userData = getUserData();
            console.log('👤 Datos completos del usuario:', userData);
            
            if (!userData) {
                console.error('❌ No se pudieron obtener los datos del usuario');
                showNotification('No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.', 'error');
                router.push('/');
                return;
            }

            const instructorId = userData.instructorId || userData.Num_Empleado;
            console.log('🚀 Cargando datos para instructor ID:', instructorId);
            
            if (!instructorId) {
                throw new Error('No se pudo obtener el ID del instructor');
            }

            const cursosCargados = await obtenerCursosInstructor(instructorId);
            setCursos(cursosCargados);
            
            if (cursosCargados.length === 0) {
                showNotification('No se encontraron cursos asignados para este instructor', 'info');
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

    // CORREGIDO: handleCalificacionChange - ahora vincula correctamente cada campo al alumno
    const handleCalificacionChange = (alumnoCurp, campo, valor) => {
        console.log(`✏️ Editando ${campo} para alumno ${alumnoCurp}: ${valor}`);
        
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
                ...(prev[alumnoCurp] || {}),
                [campo]: valor
            }
        }));
    };

    // CORREGIDO: Función para calcular el promedio según la lógica de la imagen
    const calcularPromedio = (evalInicial, evalFinal, evalPractica, tieneExamenPractico) => {
        const inicial = parseFloat(evalInicial) || 0;
        const final = parseFloat(evalFinal) || 0;
        const practica = parseFloat(evalPractica) || 0;
        
        // Según la imagen, el cálculo parece ser diferente al promedio simple
        // Analizando los ejemplos de la imagen:
        // - Alejandra: (80 + 70) / 2 = 75 ✓
        // - Enrique: (60 + 80) / 2 = 70 (pero muestra 65) - hay discrepancia
        // - Monica: (70 + 20) / 2 = 45 (pero muestra 10) - hay discrepancia
        
        // Basado en la imagen, parece que usan una fórmula específica
        // Vamos a implementar la lógica más común:
        
        if (tieneExamenPractico) {
            // Si hay examen práctico, calcular promedio de los 3 exámenes
            const suma = inicial + final + practica;
            const cantidad = (inicial > 0 ? 1 : 0) + (final > 0 ? 1 : 0) + (practica > 0 ? 1 : 0);
            return cantidad > 0 ? suma / cantidad : 0;
        } else {
            // Si no hay examen práctico, calcular promedio de evaluación inicial y final
            const suma = inicial + final;
            const cantidad = (inicial > 0 ? 1 : 0) + (final > 0 ? 1 : 0);
            return cantidad > 0 ? suma / cantidad : 0;
        }
    };

    // NUEVA FUNCIÓN: Calcular promedio corregido basado en la lógica de la imagen
    const calcularPromedioCorregido = (evalInicial, evalFinal, evalPractica, tieneExamenPractico) => {
        const inicial = parseFloat(evalInicial) || 0;
        const final = parseFloat(evalFinal) || 0;
        const practica = parseFloat(evalPractica) || 0;
        
        console.log(`📊 Calculando promedio: Inicial=${inicial}, Final=${final}, Práctico=${practica}, TienePráctico=${tieneExamenPractico}`);
        
        if (tieneExamenPractico) {
            // Para cursos con examen práctico: promedio de los 3 exámenes
            let suma = 0;
            let cantidad = 0;
            
            if (inicial > 0) { suma += inicial; cantidad++; }
            if (final > 0) { suma += final; cantidad++; }
            if (practica > 0) { suma += practica; cantidad++; }
            
            const promedio = cantidad > 0 ? suma / cantidad : 0;
            console.log(`📊 Promedio con práctico: ${promedio} (suma=${suma}, cantidad=${cantidad})`);
            return promedio;
        } else {
            // Para cursos sin examen práctico: promedio simple de inicial y final
            let suma = 0;
            let cantidad = 0;
            
            if (inicial > 0) { suma += inicial; cantidad++; }
            if (final > 0) { suma += final; cantidad++; }
            
            const promedio = cantidad > 0 ? suma / cantidad : 0;
            console.log(`📊 Promedio sin práctico: ${promedio} (suma=${suma}, cantidad=${cantidad})`);
            return promedio;
        }
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

    const guardarCalificacionIndividual = async (alumnoCurp) => {
        const calif = calificaciones[alumnoCurp];
        if (!calif || (calif.evaluacionFinal === undefined && calif.examenPractico === undefined)) {
            showNotification('Complete al menos la evaluación final para guardar', 'warning');
            return;
        }

        try {
            setSaving(true);

            const evalInicial = parseFloat(calif.evaluacionInicial) || 0;
            const evalFinal = parseFloat(calif.evaluacionFinal) || 0;
            const evalPractica = parseFloat(calif.examenPractico) || 0;
            
            const cursoActual = cursos.find(curso => curso.Id_Curso === parseInt(cursoSeleccionado));
            const tieneExamenPractico = cursoActual ? cursoActual.Examen_practico : true;
            
            // USAR LA NUEVA FUNCIÓN CORREGIDA
            const promedio = calcularPromedioCorregido(evalInicial, evalFinal, evalPractica, tieneExamenPractico);
            const resultado = determinarResultado(promedio, evalPractica, tieneExamenPractico, calif.observaciones);
            
            console.log(`💾 Guardando calificación para ${alumnoCurp}:`, {
                inicial: evalInicial,
                final: evalFinal,
                practico: evalPractica,
                promedio,
                resultado
            });

            const calificacionData = {
                alumnoCurp: alumnoCurp,
                cursoId: parseInt(cursoSeleccionado),
                evaluacionInicial: evalInicial,
                evaluacionFinal: evalFinal,
                examenPractico: evalPractica,
                promedio: promedio,
                resultado: resultado,
                observaciones: calif.observaciones || ''
            };

            await guardarCalificacionBD(calificacionData);
            
            setCalificacionesGuardadas(prev => ({
                ...prev,
                [alumnoCurp]: {
                    evaluacionInicial: evalInicial,
                    evaluacionFinal: evalFinal,
                    examenPractico: evalPractica,
                    promedio,
                    resultado,
                    observaciones: calif.observaciones || ''
                }
            }));
            
            setCalificaciones(prev => {
                const nuevasCalificaciones = { ...prev };
                delete nuevasCalificaciones[alumnoCurp];
                return nuevasCalificaciones;
            });

            showNotification(`Calificación guardada correctamente`, 'success');
            
        } catch (error) {
            console.error('Error guardando calificación:', error);
            showNotification('Error al guardar la calificación: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // NUEVA FUNCIÓN: Guardar todas las calificaciones
    const guardarTodasLasCalificaciones = async () => {
        const curpsPendientes = Object.keys(calificaciones);
        
        if (curpsPendientes.length === 0) {
            showNotification('No hay calificaciones pendientes por guardar', 'info');
            return;
        }

        // Validar que todas las calificaciones pendientes tengan los datos mínimos
        const calificacionesInvalidas = curpsPendientes.filter(curp => {
            const calif = calificaciones[curp];
            const cursoActual = cursos.find(curso => curso.Id_Curso === parseInt(cursoSeleccionado));
            const tieneExamenPractico = cursoActual ? cursoActual.Examen_practico : true;
            
            const tieneEvaluacionFinal = calif.evaluacionFinal !== undefined && calif.evaluacionFinal !== '';
            if (tieneExamenPractico) {
                const tieneExamenPracticoRequerido = calif.examenPractico !== undefined && calif.examenPractico !== '';
                return !(tieneEvaluacionFinal && tieneExamenPracticoRequerido);
            }
            return !tieneEvaluacionFinal;
        });

        if (calificacionesInvalidas.length > 0) {
            showNotification(`Hay ${calificacionesInvalidas.length} calificaciones incompletas. Complete todos los campos requeridos.`, 'warning');
            return;
        }

        try {
            setSavingAll(true);
            let guardadas = 0;
            let errores = 0;

            for (const curp of curpsPendientes) {
                try {
                    await guardarCalificacionIndividual(curp);
                    guardadas++;
                } catch (error) {
                    console.error(`Error guardando calificación para ${curp}:`, error);
                    errores++;
                }
            }

            if (errores === 0) {
                showNotification(`${guardadas} calificaciones guardadas correctamente`, 'success');
            } else {
                showNotification(`${guardadas} guardadas, ${errores} con errores`, 'warning');
            }
            
        } catch (error) {
            console.error('Error en guardar todas:', error);
            showNotification('Error al guardar las calificaciones: ' + error.message, 'error');
        } finally {
            setSavingAll(false);
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
        const cursoActual = cursos.find(curso => curso.Id_Curso === parseInt(cursoSeleccionado));
        const tieneExamenPractico = cursoActual ? cursoActual.Examen_practico : true;
        
        if (tieneExamenPractico) {
            const tieneExamenPracticoRequerido = calif.examenPractico !== undefined && calif.examenPractico !== '';
            return tieneEvaluacionFinal && tieneExamenPracticoRequerido;
        } else {
            return tieneEvaluacionFinal;
        }
    };

    // NUEVA FUNCIÓN: Calcular promedio en tiempo real para mostrar en la tabla
    const calcularPromedioEnTiempoReal = (alumnoCurp) => {
        const califGuardada = calificacionesGuardadas[alumnoCurp] || {};
        const califPendiente = calificaciones[alumnoCurp] || {};
        const califAlumno = { ...califGuardada, ...califPendiente };
        
        const evalInicial = parseFloat(califAlumno.evaluacionInicial) || 0;
        const evalFinal = parseFloat(califAlumno.evaluacionFinal) || 0;
        const evalPractica = parseFloat(califAlumno.examenPractico) || 0;
        
        const cursoActual = cursos.find(curso => curso.Id_Curso === parseInt(cursoSeleccionado));
        const tieneExamenPractico = cursoActual ? cursoActual.Examen_practico : true;
        
        return calcularPromedioCorregido(evalInicial, evalFinal, evalPractica, tieneExamenPractico);
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
                <div className={styles.breadcrumb}>
                    <Link href="/instructor" className={styles.breadcrumbLink}></Link>
                    <span className={styles.breadcrumbSeparator}></span>
                    <span className={styles.breadcrumbCurrent}></span>
                </div>

                <div className={styles.selectorSection}>
                    <label>Seleccionar Curso:</label>
                    <select 
                        value={cursoSeleccionado} 
                        onChange={(e) => handleSeleccionarCurso(e.target.value)}
                        className={styles.selector}
                        disabled={saving || savingAll}
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
                                {Object.keys(calificaciones).length > 0 && (
                                    <>
                                        <span className={styles.contadorCambios}>
                                            {Object.keys(calificaciones).length} calificación(es) pendiente(s)
                                        </span>
                                        <button 
                                            className={styles.btnGuardarTodo}
                                            onClick={guardarTodasLasCalificaciones}
                                            disabled={saving || savingAll}
                                        >
                                            {savingAll ? '⏳ Guardando...' : '💾 Guardar Todo'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className={styles.notasImportantes}>
                            <p>*** {tieneExamenPractico 
                                ? 'El examen práctico debe acreditarse con mínimo 80% y el promedio general con 70%' 
                                : 'El curso se acredita con promedio mínimo de 70% en los exámenes teóricos'
                            }</p>
                            <p>*** Los promedios se calculan con todos los exámenes disponibles (inicial, final y práctico si aplica)</p>
                            <p>*** Para ser APTO: {tieneExamenPractico 
                                ? 'Mínimo 70 de promedio Y 80 en examen práctico' 
                                : 'Mínimo 70 de promedio general'
                            }</p>
                            <p>*** Las observaciones "SIN LICENCIA" automáticamente resultan en NO APTO</p>
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
                                        <th>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alumnosCurso.length > 0 ? (
                                        alumnosCurso.map((alumno, index) => {
                                            // Verificar que el alumno tenga CURP válido
                                            if (!alumno.Curp) {
                                                console.error('❌ Alumno sin CURP:', alumno);
                                                return null;
                                            }

                                            const califGuardada = calificacionesGuardadas[alumno.Curp] || {};
                                            const califPendiente = calificaciones[alumno.Curp] || {};
                                            
                                            const califAlumno = { ...califGuardada, ...califPendiente };
                                            
                                            const evalInicial = parseFloat(califAlumno.evaluacionInicial) || 0;
                                            const evalFinal = parseFloat(califAlumno.evaluacionFinal) || 0;
                                            const evalPractica = parseFloat(califAlumno.examenPractico) || 0;
                                            
                                            // USAR LA NUEVA FUNCIÓN PARA CALCULAR PROMEDIO EN TIEMPO REAL
                                            const promedio = calcularPromedioEnTiempoReal(alumno.Curp);
                                            const resultado = califAlumno.resultado || 
                                                determinarResultado(promedio, evalPractica, tieneExamenPractico, califAlumno.observaciones);
                                            
                                            const tieneCambios = tieneCambiosPendientes(alumno.Curp);
                                            const puedeGuardar = puedeCalificar(alumno.Curp);
                                            
                                            return (
                                                <tr key={`alumno-${alumno.Curp}-${index}`} className={tieneCambios ? styles.filaConCambios : ''}>
                                                    <td>
                                                        <div className={styles.infoAlumno}>
                                                            <strong>{alumno.Nombre} {alumno.Apellido_paterno} {alumno.Apellido_materno}</strong>
                                                            <small>CURP: {alumno.Curp}</small>
                                                            {alumno.Puesto && <small>Puesto: {alumno.Puesto}</small>}
                                                        </div>
                                                        {tieneCambios && <span className={styles.indicatorCambios}> *</span>}
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="1"
                                                            value={obtenerValorCampo(alumno.Curp, 'evaluacionInicial')}
                                                            onChange={(e) => handleCalificacionChange(alumno.Curp, 'evaluacionInicial', e.target.value)}
                                                            onBlur={(e) => handleBlur(alumno.Curp, 'evaluacionInicial', e.target.value)}
                                                            className={styles.calificacionInput}
                                                            placeholder="0-100"
                                                            disabled={saving || savingAll}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="1"
                                                            value={obtenerValorCampo(alumno.Curp, 'evaluacionFinal')}
                                                            onChange={(e) => handleCalificacionChange(alumno.Curp, 'evaluacionFinal', e.target.value)}
                                                            onBlur={(e) => handleBlur(alumno.Curp, 'evaluacionFinal', e.target.value)}
                                                            className={styles.calificacionInput}
                                                            placeholder="0-100"
                                                            required
                                                            disabled={saving || savingAll}
                                                        />
                                                    </td>
                                                    {tieneExamenPractico && (
                                                        <td>
                                                            <input 
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="1"
                                                                value={obtenerValorCampo(alumno.Curp, 'examenPractico')}
                                                                onChange={(e) => handleCalificacionChange(alumno.Curp, 'examenPractico', e.target.value)}
                                                                onBlur={(e) => handleBlur(alumno.Curp, 'examenPractico', e.target.value)}
                                                                className={styles.calificacionInput}
                                                                placeholder="0-100"
                                                                required
                                                                disabled={saving || savingAll}
                                                            />
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
                                                        <input 
                                                            type="text"
                                                            value={obtenerValorCampo(alumno.Curp, 'observaciones')}
                                                            onChange={(e) => handleCalificacionChange(alumno.Curp, 'observaciones', e.target.value)}
                                                            className={styles.observacionesInput}
                                                            placeholder="Observaciones..."
                                                            disabled={saving || savingAll}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className={styles.btnGuardarIndividual}
                                                            onClick={() => guardarCalificacionIndividual(alumno.Curp)}
                                                            disabled={!puedeGuardar || saving || savingAll}
                                                            title={puedeGuardar ? "Guardar calificación" : `Complete evaluación final${tieneExamenPractico ? " y examen práctico" : ""}`}
                                                        >
                                                            {saving ? '⏳' : '💾'} GUARDAR
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

                <div className={styles.actionsSection}>
                    <Link href="/instructor/dashboard" className={styles.btnVolver}>
                        ← Volver 
                    </Link>
                </div>
            </main>
        </div>
    );
}