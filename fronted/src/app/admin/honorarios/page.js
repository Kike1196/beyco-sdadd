// app/admin/honorarios/page.js - VERSIÓN MODIFICADA PARA TODOS LOS INSTRUCTORES
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Honorarios.module.css';

// URL base del backend Spring Boot
const API_BASE_URL = 'http://localhost:8080/api';

export default function HonorariosPage() {
    const [instructores, setInstructores] = useState([]);
    const [instructoresConCursos, setInstructoresConCursos] = useState([]);
    const [periodo, setPeriodo] = useState('quincenal');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [instructorSeleccionado, setInstructorSeleccionado] = useState(null);

    // Cargar instructores al iniciar
    useEffect(() => {
        cargarInstructores();
        aplicarPeriodo('quincenal');
    }, []);

    const aplicarPeriodo = (tipoPeriodo) => {
        const hoy = new Date();
        let fechaInicioPeriodo = new Date();
        
        switch (tipoPeriodo) {
            case 'semanal':
                fechaInicioPeriodo.setDate(hoy.getDate() - 7);
                break;
            case 'quincenal':
                fechaInicioPeriodo.setDate(hoy.getDate() - 15);
                break;
            case 'mensual':
                fechaInicioPeriodo.setMonth(hoy.getMonth() - 1);
                break;
            default:
                fechaInicioPeriodo.setDate(hoy.getDate() - 15);
        }
        
        setFechaInicio(fechaInicioPeriodo.toISOString().split('T')[0]);
        setFechaFin(hoy.toISOString().split('T')[0]);
    };

    const cargarInstructores = async () => {
        try {
            setCargando(true);
            setError('');
            
            console.log('🔄 Cargando instructores desde Spring Boot...');
            
            const response = await fetch(`${API_BASE_URL}/instructores`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status} al cargar instructores`);
            }
            
            const data = await response.json();
            console.log('📊 Datos recibidos del backend:', data);
            
            const instructoresFormateados = data.map(instructor => ({
                numEmpleado: instructor.numEmpleado || instructor.id || instructor.Num_Empleado,
                nombre: instructor.nombre || instructor.Nombre,
                apellidoPaterno: instructor.apellidoPaterno || instructor.Apellido_paterno,
                apellidoMaterno: instructor.apellidoMaterno || instructor.Apellido_materno,
                email: instructor.correo || instructor.email || instructor.Correo,
                telefono: instructor.telefono || '',
                especialidad: instructor.especialidad || 'Instructor',
                totalCursos: 0,
                cursosPendientes: 0,
                totalPendiente: 0
            }));
            
            setInstructores(instructoresFormateados);
            console.log(`✅ ${instructoresFormateados.length} instructores cargados`);
            
        } catch (error) {
            console.error('❌ Error al cargar instructores:', error);
            setError('Error al cargar la lista de instructores: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    // ✅ FUNCIÓN CORREGIDA: Calcular el pago del instructor basado en el precio del curso
    const calcularPagoInstructor = (curso) => {
        // Si el curso tiene un campo de pago específico para el instructor, usarlo
        if (curso.pago && curso.pago > 0) {
            return parseFloat(curso.pago);
        }
        
        // Si no, calcular basado en el precio del curso
        // Puedes ajustar este porcentaje según tus necesidades
        const precio = curso.precio ? parseFloat(curso.precio) : 0;
        const porcentajeInstructor = 0.6; // 60% del precio para el instructor (ajusta según necesites)
        
        return precio * porcentajeInstructor;
    };

    // ✅ NUEVA FUNCIÓN: Cargar cursos de TODOS los instructores
    const cargarCursosTodosInstructores = async () => {
        try {
            setCargando(true);
            setError('');
            
            console.log(`🔍 Cargando cursos para TODOS los instructores`);
            console.log(`📅 Período: ${fechaInicio} a ${fechaFin}`);
            
            const url = `${API_BASE_URL}/cursos`;
            console.log('🌐 Fetching desde:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📦 Respuesta completa del backend:', data);
            
            // ✅ FILTRAR cursos por fechas
            const cursosFiltrados = data.filter(curso => {
                // Filtrar por fechas si están definidas
                if (fechaInicio && fechaFin && curso.fechaIngreso) {
                    const fechaCurso = new Date(curso.fechaIngreso);
                    const fechaIni = new Date(fechaInicio);
                    const fechaFi = new Date(fechaFin);
                    
                    // Ajustar las fechas para comparación correcta
                    fechaCurso.setHours(0, 0, 0, 0);
                    fechaIni.setHours(0, 0, 0, 0);
                    fechaFi.setHours(23, 59, 59, 999);
                    
                    return fechaCurso >= fechaIni && fechaCurso <= fechaFi;
                }
                
                return true; // Si no hay fechas, mostrar todos los cursos
            });
            
            console.log(`✅ ${cursosFiltrados.length} cursos encontrados en el período`);
            
            // ✅ AGRUPAR cursos por instructor
            const cursosPorInstructor = {};
            
            cursosFiltrados.forEach(curso => {
                const instructorId = curso.instructorId;
                
                if (!cursosPorInstructor[instructorId]) {
                    cursosPorInstructor[instructorId] = [];
                }
                
                const pagoInstructor = calcularPagoInstructor(curso);
                
                const cursoNormalizado = {
                    id: curso.id,
                    cursoNombre: curso.nombre,
                    stps: curso.stps || 'N/A',
                    horasImpartidas: curso.horas || 0,
                    fechaCurso: curso.fechaIngreso,
                    monto: pagoInstructor,
                    precio: curso.precio || 0,
                    estatus: 'pendiente',
                    lugar: curso.lugar || 'Sin especificar',
                    empresaNombre: curso.empresa || 'Sin empresa'
                };
                
                cursosPorInstructor[instructorId].push(cursoNormalizado);
            });
            
            console.log('📊 Cursos agrupados por instructor:', cursosPorInstructor);
            
            // ✅ CREAR array de instructores con sus cursos y totales
            const instructoresConDatos = instructores.map(instructor => {
                const cursosInstructor = cursosPorInstructor[instructor.numEmpleado] || [];
                const totalPendiente = cursosInstructor.reduce((sum, curso) => 
                    sum + parseFloat(curso.monto || 0), 0
                );
                
                return {
                    ...instructor,
                    cursos: cursosInstructor,
                    totalCursos: cursosInstructor.length,
                    cursosPendientes: cursosInstructor.length, // Todos están pendientes por defecto
                    totalPendiente: totalPendiente,
                    totalHoras: cursosInstructor.reduce((sum, curso) => sum + (curso.horasImpartidas || 0), 0)
                };
            }).filter(instructor => instructor.totalCursos > 0); // Solo mostrar instructores con cursos
            
            console.log('👥 Instructores con cursos:', instructoresConDatos);
            
            setInstructoresConCursos(instructoresConDatos);
            
        } catch (error) {
            console.error('💥 Error al cargar cursos:', error);
            setError(`Error al cargar cursos: ${error.message}`);
            setInstructoresConCursos([]);
        } finally {
            setCargando(false);
        }
    };

    // ✅ NUEVA FUNCIÓN: Seleccionar instructor para ver detalles
    const seleccionarInstructor = (instructor) => {
        setInstructorSeleccionado(instructor);
    };

    // ✅ NUEVA FUNCIÓN: Generar recibo para un instructor específico
    const generarReciboInstructor = (instructor) => {
        if (!instructor || instructor.cursos.length === 0) {
            setError('El instructor no tiene cursos para generar recibo');
            return;
        }

        const reciboData = {
            instructor: {
                instructorId: instructor.numEmpleado,
                instructorNombre: `${instructor.nombre} ${instructor.apellidoPaterno} ${instructor.apellidoMaterno}`,
                instructorEmail: instructor.email,
                instructorEspecialidad: instructor.especialidad
            },
            cursos: instructor.cursos,
            periodo: periodo,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            total: instructor.totalPendiente,
            totalHoras: instructor.totalHoras,
            totalCursos: instructor.totalCursos
        };

        // Guardar en localStorage para usar en la página de recibo
        localStorage.setItem('reciboData', JSON.stringify(reciboData));
        
        // Redirigir a la página de recibo
        window.open('/admin/honorarios/recibo', '_blank');
    };

    // ✅ NUEVA FUNCIÓN: Generar reporte general de todos los instructores
    const generarReporteGeneral = () => {
        if (instructoresConCursos.length === 0) {
            setError('No hay datos para generar reporte general');
            return;
        }

        const reporteData = {
            instructores: instructoresConCursos,
            periodo: periodo,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            totalGeneral: instructoresConCursos.reduce((sum, instructor) => sum + instructor.totalPendiente, 0),
            totalCursosGeneral: instructoresConCursos.reduce((sum, instructor) => sum + instructor.totalCursos, 0),
            totalHorasGeneral: instructoresConCursos.reduce((sum, instructor) => sum + instructor.totalHoras, 0)
        };

        // Guardar en localStorage para usar en la página de reporte
        localStorage.setItem('reporteGeneralData', JSON.stringify(reporteData));
        
        // Redirigir a la página de reporte general
        window.open('/admin/honorarios/reporte-general', '_blank');
    };

    // Actualizar datos cuando cambien las fechas manualmente
    const actualizarDatos = async () => {
        if (fechaInicio && fechaFin) {
            await cargarCursosTodosInstructores();
        }
    };

    // Obtener descripción del período
    const getDescripcionPeriodo = () => {
        switch (periodo) {
            case 'semanal':
                return 'Última semana';
            case 'quincenal':
                return 'Última quincena';
            case 'mensual':
                return 'Último mes';
            default:
                return 'Período personalizado';
        }
    };

    // Formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount || 0);
    };

    // Calcular totales generales
    const totalGeneral = instructoresConCursos.reduce((sum, instructor) => sum + instructor.totalPendiente, 0);
    const totalCursosGeneral = instructoresConCursos.reduce((sum, instructor) => sum + instructor.totalCursos, 0);
    const totalHorasGeneral = instructoresConCursos.reduce((sum, instructor) => sum + instructor.totalHoras, 0);

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Honorarios de Instructores</h1>
                    <p>Reporte general de todos los instructores</p>
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
                {/* Mostrar errores */}
                {error && (
                    <div className={styles.errorBanner}>
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError('')} className={styles.errorClose}>×</button>
                    </div>
                )}

                {/* Controles principales */}
                <div className={styles.controls}>
                    <div className={styles.controlsLeft}>
                        <Link href="/admin" className={styles.btnAtras}>
                            ← Volver 
                        </Link>
                    </div>
                    <div className={styles.controlsRight}>
                        <button 
                            onClick={cargarInstructores}
                            className={styles.btnActualizar}
                            disabled={cargando}
                        >
                            {cargando ? '⏳' : '🔄'} Actualizar Lista
                        </button>
                    </div>
                </div>

                {/* Configuración de Periodo */}
                <div className={styles.configSection}>
                    <h2>Configuración del Período</h2>
                    <div className={styles.configGrid}>
                        <div className={styles.periodoOptions}>
                            <label className={styles.optionLabel}>
                                <input
                                    type="radio"
                                    value="semanal"
                                    checked={periodo === 'semanal'}
                                    onChange={(e) => {
                                        setPeriodo(e.target.value);
                                        aplicarPeriodo(e.target.value);
                                    }}
                                />
                                <span className={styles.optionText}>
                                    Semanal
                                    <span className={styles.optionDescription}>(Últimos 7 días)</span>
                                </span>
                            </label>
                            <label className={styles.optionLabel}>
                                <input
                                    type="radio"
                                    value="quincenal"
                                    checked={periodo === 'quincenal'}
                                    onChange={(e) => {
                                        setPeriodo(e.target.value);
                                        aplicarPeriodo(e.target.value);
                                    }}
                                />
                                <span className={styles.optionText}>
                                    Quincenal
                                    <span className={styles.optionDescription}>(Últimos 15 días)</span>
                                </span>
                            </label>
                            <label className={styles.optionLabel}>
                                <input
                                    type="radio"
                                    value="mensual"
                                    checked={periodo === 'mensual'}
                                    onChange={(e) => {
                                        setPeriodo(e.target.value);
                                        aplicarPeriodo(e.target.value);
                                    }}
                                />
                                <span className={styles.optionText}>
                                    Mensual
                                    <span className={styles.optionDescription}>(Últimos 30 días)</span>
                                </span>
                            </label>
                        </div>
                        
                        <div className={styles.fechasContainer}>
                            <div className={styles.fechaInput}>
                                <label className={styles.fechaLabel}>Fecha Inicio</label>
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className={styles.fechaField}
                                />
                            </div>
                            <div className={styles.fechaInput}>
                                <label className={styles.fechaLabel}>Fecha Fin</label>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className={styles.fechaField}
                                />
                            </div>
                            <div className={styles.fechaActions}>
                                <button 
                                    onClick={actualizarDatos}
                                    className={styles.btnAplicarFechas}
                                    disabled={cargando}
                                >
                                    {cargando ? '⏳' : '↻'} Cargar Honorarios
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Información del período */}
                    <div className={styles.periodoInfo}>
                        <span className={styles.periodoBadge}>{getDescripcionPeriodo()}</span>
                        <span className={styles.fechasInfo}>
                            {new Date(fechaInicio).toLocaleDateString('es-ES')} - {new Date(fechaFin).toLocaleDateString('es-ES')}
                        </span>
                    </div>
                </div>

                {/* Resumen General */}
                <div className={styles.resumenGeneral}>
                    <div className={styles.resumenCard}>
                        <div className={styles.resumenContent}>
                            <div className={styles.totalInfo}>
                                <span className={styles.totalLabel}>Total General a Pagar</span>
                                <span className={styles.totalAmount}>{formatCurrency(totalGeneral)}</span>
                                <span className={styles.periodoResumen}>
                                    {getDescripcionPeriodo()} • {instructoresConCursos.length} instructores • {totalCursosGeneral} cursos • {totalHorasGeneral} horas
                                </span>
                            </div>
                            <button 
                                onClick={generarReporteGeneral}
                                className={styles.generateButton}
                                disabled={instructoresConCursos.length === 0 || cargando}
                            >
                                {cargando ? (
                                    <>⏳ Procesando...</>
                                ) : (
                                    <>📊 Generar Reporte General</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Instructores con Cursos */}
                <div className={styles.instructoresSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Instructores con Cursos en el Período</h2>
                        <span className={styles.counterBadge}>{instructoresConCursos.length}</span>
                    </div>
                    
                    {cargando ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Cargando honorarios de instructores...</p>
                        </div>
                    ) : instructoresConCursos.length > 0 ? (
                        <div className={styles.instructoresGrid}>
                            {instructoresConCursos.map((instructor, index) => (
                                <div 
                                    key={instructor.numEmpleado} 
                                    className={`${styles.instructorCard} ${
                                        instructorSeleccionado?.numEmpleado === instructor.numEmpleado ? styles.selected : ''
                                    }`}
                                    onClick={() => seleccionarInstructor(instructor)}
                                >
                                    <div className={styles.cardHeader}>
                                        <h3>{instructor.nombre} {instructor.apellidoPaterno} {instructor.apellidoMaterno}</h3>
                                        <div className={styles.statusIndicator}></div>
                                    </div>
                                    
                                    <div className={styles.instructorStats}>
                                        <div className={styles.statItem}>
                                            <span className={styles.statNumber}>{instructor.totalCursos}</span>
                                            <span className={styles.statLabel}>Cursos</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statNumber}>{instructor.totalHoras}</span>
                                            <span className={styles.statLabel}>Horas</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statNumber}>{formatCurrency(instructor.totalPendiente)}</span>
                                            <span className={styles.statLabel}>Total</span>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.cardActions}>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                generarReciboInstructor(instructor);
                                            }}
                                            className={styles.btnRecibo}
                                            disabled={instructor.totalCursos === 0}
                                        >
                                            📄 Generar Recibo
                                        </button>
                                    </div>
                                    
                                    {/* Lista compacta de cursos */}
                                    <div className={styles.cursosList}>
                                        <h4>Cursos Impartidos:</h4>
                                        {instructor.cursos.slice(0, 3).map((curso, idx) => (
                                            <div key={idx} className={styles.cursoItem}>
                                                <span className={styles.cursoNombre}>{curso.cursoNombre}</span>
                                                <span className={styles.cursoMonto}>{formatCurrency(curso.monto)}</span>
                                            </div>
                                        ))}
                                        {instructor.cursos.length > 3 && (
                                            <div className={styles.moreCursos}>
                                                +{instructor.cursos.length - 3} cursos más...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noData}>
                            <div className={styles.noDataIcon}>📭</div>
                            <p>No hay instructores con cursos en el período seleccionado</p>
                            <p className={styles.noDataSubtitle}>
                                Período: {new Date(fechaInicio).toLocaleDateString('es-ES')} - {new Date(fechaFin).toLocaleDateString('es-ES')}
                            </p>
                            <button 
                                onClick={actualizarDatos}
                                className={styles.btnAplicarFechas}
                            >
                                🔄 Intentar de nuevo
                            </button>
                        </div>
                    )}
                </div>

                {/* Detalles del Instructor Seleccionado */}
                {instructorSeleccionado && (
                    <div className={styles.detallesSection}>
                        <div className={styles.sectionHeader}>
                            <h2>Detalles del Instructor</h2>
                            <button 
                                onClick={() => setInstructorSeleccionado(null)}
                                className={styles.btnCerrar}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className={styles.detallesContent}>
                            <div className={styles.instructorInfo}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Nombre:</span>
                                    <span className={styles.infoValue}>
                                        {instructorSeleccionado.nombre} {instructorSeleccionado.apellidoPaterno} {instructorSeleccionado.apellidoMaterno}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Email:</span>
                                    <span className={styles.infoValue}>
                                        {instructorSeleccionado.email}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Especialidad:</span>
                                    <span className={styles.infoValue}>
                                        {instructorSeleccionado.especialidad}
                                    </span>
                                </div>
                            </div>
                            
                            <div className={styles.cursosDetalles}>
                                <h3>Cursos Impartidos ({instructorSeleccionado.cursos.length})</h3>
                                <div className={styles.tableContainer}>
                                    <table className={styles.cursosTable}>
                                        <thead>
                                            <tr>
                                                <th>Curso</th>
                                                <th>Fecha</th>
                                                <th>Empresa</th>
                                                <th>Lugar</th>
                                                <th>Horas</th>
                                                <th>Pago Instructor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {instructorSeleccionado.cursos.map((curso, index) => (
                                                <tr key={index}>
                                                    <td className={styles.cursoNombre}>
                                                        {curso.cursoNombre}
                                                        {curso.stps && <div className={styles.stps}>{curso.stps}</div>}
                                                    </td>
                                                    <td className={styles.cursoFecha}>
                                                        {curso.fechaCurso ? new Date(curso.fechaCurso).toLocaleDateString('es-ES') : 'Sin fecha'}
                                                    </td>
                                                    <td className={styles.cursoEmpresa}>
                                                        {curso.empresaNombre || 'Sin empresa'}
                                                    </td>
                                                    <td className={styles.cursoLugar}>
                                                        {curso.lugar || 'Sin lugar'}
                                                    </td>
                                                    <td className={styles.cursoHoras}>
                                                        {curso.horasImpartidas || 0}h
                                                    </td>
                                                    <td className={styles.cursoMonto}>
                                                        {formatCurrency(curso.monto || 0)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}