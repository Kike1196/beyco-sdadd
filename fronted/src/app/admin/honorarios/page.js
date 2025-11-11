'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Honorarios.module.css';

// URL base del backend Spring Boot
const API_BASE_URL = 'http://localhost:8080/api';

export default function HonorariosPage() {
    const [instructores, setInstructores] = useState([]);
    const [instructorSeleccionado, setInstructorSeleccionado] = useState(null);
    const [cursos, setCursos] = useState([]);
    const [periodo, setPeriodo] = useState('quincenal');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

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

    // ✅ FUNCIÓN CORREGIDA para cargar cursos del instructor
    const handleInstructorChange = async (event) => {
        const instructorId = parseInt(event.target.value);
        
        if (instructorId === 0 || isNaN(instructorId)) {
            setInstructorSeleccionado(null);
            setCursos([]);
            setError('');
            return;
        }

        try {
            setCargando(true);
            setError('');
            
            console.log(`🔍 Cargando cursos para instructor ID: ${instructorId}`);
            console.log(`📅 Período: ${fechaInicio} a ${fechaFin}`);
            
            const url = `${API_BASE_URL}/cursos`;
            console.log('🌐 Fetching desde:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📦 Respuesta completa del backend:', data);
            console.log('📋 Ejemplo de curso:', data[0]);
            
            // ✅ FILTRAR cursos del instructor seleccionado y por fechas
            const cursosFiltrados = data.filter(curso => {
                const esDelInstructor = curso.instructorId === instructorId;
                
                // Filtrar por fechas si están definidas
                if (fechaInicio && fechaFin && curso.fechaIngreso) {
                    const fechaCurso = new Date(curso.fechaIngreso);
                    const fechaIni = new Date(fechaInicio);
                    const fechaFi = new Date(fechaFin);
                    
                    // Ajustar las fechas para comparación correcta
                    fechaCurso.setHours(0, 0, 0, 0);
                    fechaIni.setHours(0, 0, 0, 0);
                    fechaFi.setHours(23, 59, 59, 999);
                    
                    return esDelInstructor && fechaCurso >= fechaIni && fechaCurso <= fechaFi;
                }
                
                return esDelInstructor;
            });
            
            console.log(`✅ ${cursosFiltrados.length} cursos encontrados para el instructor`);
            
            if (cursosFiltrados.length > 0) {
                console.log('📊 Primer curso:', cursosFiltrados[0]);
            }
            
            // ✅ NORMALIZAR datos de los cursos con el pago correcto
            const cursosNormalizados = cursosFiltrados.map(curso => {
                const pagoInstructor = calcularPagoInstructor(curso);
                
                console.log(`💰 Curso: ${curso.nombre}, Precio: ${curso.precio}, Pago: ${curso.pago}, Pago Calculado: ${pagoInstructor}`);
                
                return {
                    id: curso.id,
                    cursoNombre: curso.nombre,
                    stps: curso.stps || 'N/A',
                    horasImpartidas: curso.horas || 0,
                    fechaCurso: curso.fechaIngreso,
                    monto: pagoInstructor, // ✅ USAR el pago calculado
                    precio: curso.precio || 0, // Mantener el precio original para referencia
                    estatus: 'pendiente',
                    lugar: curso.lugar || 'Sin especificar',
                    empresaNombre: curso.empresa || 'Sin empresa'
                };
            });
            
            console.log('💵 Cursos con montos:', cursosNormalizados.map(c => ({ 
                nombre: c.cursoNombre, 
                monto: c.monto,
                precio: c.precio
            })));
            
            // Buscar información del instructor seleccionado
            const instructor = instructores.find(i => i.numEmpleado === instructorId);
            
            if (!instructor) {
                throw new Error('Instructor no encontrado');
            }
            
            // Calcular total pendiente
            const totalPendiente = cursosNormalizados.reduce((sum, curso) => 
                sum + parseFloat(curso.monto || 0), 0
            );
            
            console.log(`💰 Total a pagar al instructor: $${totalPendiente.toFixed(2)}`);
            
            const instructorData = {
                instructorId: instructorId,
                instructorNombre: `${instructor.nombre} ${instructor.apellidoPaterno} ${instructor.apellidoMaterno}`,
                instructorEmail: instructor.email,
                instructorEspecialidad: instructor.especialidad,
                cursosPendientes: cursosNormalizados,
                totalPendiente: totalPendiente,
                totalCursos: cursosNormalizados.length
            };
            
            setInstructorSeleccionado(instructorData);
            setCursos(cursosNormalizados);
            
            console.log('✅ Datos del instructor cargados:', instructorData);
            
        } catch (error) {
            console.error('💥 Error al cargar cursos:', error);
            setError(`Error al cargar cursos: ${error.message}`);
            setInstructorSeleccionado(null);
            setCursos([]);
        } finally {
            setCargando(false);
        }
    };

    // Calcular total a pagar (solo cursos pendientes)
    const calcularTotalPagar = () => {
        return cursos.reduce((total, curso) => {
            return total + (curso.estatus === 'pendiente' ? parseFloat(curso.monto || 0) : 0);
        }, 0);
    };

    // Calcular total de horas
    const calcularTotalHoras = () => {
        return cursos.reduce((total, curso) => {
            return total + (curso.estatus === 'pendiente' ? parseInt(curso.horasImpartidas || 0) : 0);
        }, 0);
    };

    // Generar recibo
    const generarRecibo = () => {
        if (!instructorSeleccionado || cursos.length === 0) {
            setError('Selecciona un instructor con cursos');
            return;
        }

        const cursosPendientes = cursos.filter(curso => curso.estatus === 'pendiente');
        
        if (cursosPendientes.length === 0) {
            setError('No hay pagos pendientes para generar recibo');
            return;
        }

        const reciboData = {
            instructor: instructorSeleccionado,
            cursos: cursosPendientes,
            periodo: periodo,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            total: calcularTotalPagar(),
            totalHoras: calcularTotalHoras(),
            totalCursos: cursosPendientes.length
        };

        // Guardar en localStorage para usar en la página de recibo
        localStorage.setItem('reciboData', JSON.stringify(reciboData));
        
        // Redirigir a la página de recibo
        window.open('/admin/honorarios/recibo', '_blank');
    };

    // Actualizar datos cuando cambien las fechas manualmente
    const actualizarDatos = async () => {
        if (instructorSeleccionado && fechaInicio && fechaFin) {
            await handleInstructorChange({ 
                target: { value: instructorSeleccionado.instructorId } 
            });
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

    const totalPagar = calcularTotalPagar();
    const totalHoras = calcularTotalHoras();
    const cursosPendientes = cursos.filter(curso => curso.estatus === 'pendiente');

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Generación de Recibos de Honorarios</h1>
                    <p>Sistema integrado con Spring Boot Backend</p>
                </div>
                <div className={styles.logoSection}>
                    <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
                    <div className={styles.logoText}>
                        <span className={styles.logoTitle}>BEYCO</span>
                        <span className={styles.logoSubtitle}>Consultores</span>
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

                {/* Contenido principal */}
                <div className={styles.contentGrid}>
                    {/* Panel de selección */}
                    <div className={styles.selectionPanel}>
                        <div className={styles.panelHeader}>
                            <h2>Seleccionar Instructor</h2>
                            <div className={styles.headerDivider}></div>
                        </div>
                        
                        <div className={styles.selectContainer}>
                            <label className={styles.selectLabel}>Instructor:</label>
                            <select 
                                onChange={handleInstructorChange}
                                className={styles.instructorSelect}
                                disabled={cargando}
                                value={instructorSeleccionado?.instructorId || 0}
                            >
                                <option value="0">
                                    {cargando ? '⏳ Cargando instructores...' : '👨‍🏫 Seleccionar instructor'}
                                </option>
                                {instructores.map(instructor => (
                                    <option 
                                        key={instructor.numEmpleado} 
                                        value={instructor.numEmpleado}
                                    >
                                        {instructor.nombre} {instructor.apellidoPaterno} {instructor.apellidoMaterno}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Información del instructor seleccionado */}
                        {instructorSeleccionado && (
                            <div className={styles.instructorCard}>
                                <div className={styles.cardHeader}>
                                    <h3>Información del Instructor</h3>
                                    <div className={styles.statusIndicator}></div>
                                </div>
                                <div className={styles.instructorInfo}>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Nombre:</span>
                                        <span className={styles.infoValue}>
                                            {instructorSeleccionado.instructorNombre}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Email:</span>
                                        <span className={styles.infoValue}>
                                            {instructorSeleccionado.instructorEmail}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Total Cursos:</span>
                                        <span className={styles.infoValue}>{cursos.length}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Cursos Pendientes:</span>
                                        <span className={styles.infoValue}>{cursosPendientes.length}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Total a Pagar:</span>
                                        <span className={styles.infoValueHighlight}>
                                            {formatCurrency(totalPagar)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estadísticas rápidas */}
                        <div className={styles.statsCard}>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{instructores.length}</span>
                                <span className={styles.statLabel}>Instructores Activos</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>
                                    {cursos.length}
                                </span>
                                <span className={styles.statLabel}>Cursos Totales</span>
                            </div>
                        </div>
                    </div>

                    {/* Panel de detalles */}
                    <div className={styles.detailsPanel}>
                        {instructorSeleccionado ? (
                            <>
                                {/* Encabezado del instructor */}
                                <div className={styles.instructorHeader}>
                                    <div className={styles.instructorTitle}>
                                        <h2>{instructorSeleccionado.instructorNombre}</h2>
                                        <p>{instructorSeleccionado.instructorEmail}</p>
                                        <div className={styles.periodoInfo}>
                                            <span className={styles.periodoBadge}>{getDescripcionPeriodo()}</span>
                                            <span className={styles.fechasInfo}>
                                                {new Date(fechaInicio).toLocaleDateString('es-ES')} - {new Date(fechaFin).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.instructorStats}>
                                        <div className={styles.statBadge}>
                                            <span className={styles.statBadgeNumber}>{cursos.length}</span>
                                            <span className={styles.statBadgeLabel}>Total Cursos</span>
                                        </div>
                                        <div className={styles.statBadge}>
                                            <span className={styles.statBadgeNumber}>
                                                {cursos.reduce((sum, curso) => sum + (curso.horasImpartidas || 0), 0)}
                                            </span>
                                            <span className={styles.statBadgeLabel}>Horas Totales</span>
                                        </div>
                                        <div className={styles.statBadge}>
                                            <span className={styles.statBadgeNumber}>
                                                {cursosPendientes.length}
                                            </span>
                                            <span className={styles.statBadgeLabel}>Pendientes</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Configuración de Periodo */}
                                <div className={styles.configSection}>
                                    <h3>Configuración del Período</h3>
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
                                                    {cargando ? '⏳' : '↻'} Aplicar Fechas
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Lista de Cursos */}
                                <div className={styles.cursosSection}>
                                    <div className={styles.sectionHeader}>
                                        <h3>Cursos Impartidos</h3>
                                        <span className={styles.counterBadge}>{cursos.length}</span>
                                    </div>
                                    
                                    {cursos.length > 0 ? (
                                        <div className={styles.tableContainer}>
                                            <table className={styles.cursosTable}>
                                                <thead>
                                                    <tr>
                                                        <th>Curso</th>
                                                        <th>Fecha</th>
                                                        <th>Empresa</th>
                                                        <th>Lugar</th>
                                                        <th>Horas</th>
                                                        <th>Precio Curso</th>
                                                        <th>Pago Instructor</th>
                                                        <th>Estatus Pago</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cursos.map((curso, index) => (
                                                        <tr 
                                                            key={curso.id || `curso-${index}`}
                                                            className={
                                                                curso.estatus === 'pendiente' ? styles.filaPendiente : 
                                                                curso.estatus === 'pagado' ? styles.filaPagado : 
                                                                styles.filaCancelado
                                                            }
                                                        >
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
                                                            <td className={styles.cursoPrecio}>
                                                                {formatCurrency(curso.precio || 0)}
                                                            </td>
                                                            <td className={styles.cursoMonto}>
                                                                {formatCurrency(curso.monto || 0)}
                                                            </td>
                                                            <td>
                                                                <span className={`${styles.status} ${
                                                                    curso.estatus === 'pagado' ? styles.pagado : 
                                                                    curso.estatus === 'cancelado' ? styles.cancelado : 
                                                                    styles.pendiente
                                                                }`}>
                                                                    {curso.estatus || 'pendiente'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className={styles.noData}>
                                            <div className={styles.noDataIcon}>📭</div>
                                            <p>No hay cursos en el período seleccionado</p>
                                            <p className={styles.noDataSubtitle}>
                                                Período: {new Date(fechaInicio).toLocaleDateString('es-ES')} - {new Date(fechaFin).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Resumen y Generar Recibo */}
                                <div className={styles.resumenSection}>
                                    <div className={styles.resumenCard}>
                                        <div className={styles.resumenContent}>
                                            <div className={styles.totalInfo}>
                                                <span className={styles.totalLabel}>Total a Pagar al Instructor</span>
                                                <span className={styles.totalAmount}>{formatCurrency(totalPagar)}</span>
                                                <span className={styles.periodoResumen}>
                                                    {getDescripcionPeriodo()} • {cursosPendientes.length} cursos pendientes • {totalHoras} horas
                                                </span>
                                            </div>
                                            <button 
                                                onClick={generarRecibo}
                                                className={styles.generateButton}
                                                disabled={totalPagar === 0 || cargando}
                                            >
                                                {cargando ? (
                                                    <>⏳ Procesando...</>
                                                ) : (
                                                    <>📄 Generar Recibo de Pago</>
                                                )}
                                            </button>
                                        </div>
                                        <div className={styles.resumenFooter}>
                                            <span className={styles.footerText}>
                                                Período: {new Date(fechaInicio).toLocaleDateString('es-ES')} - {new Date(fechaFin).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className={styles.placeholder}>
                                <div className={styles.placeholderIcon}>👨‍🏫</div>
                                <h3>Selecciona un Instructor</h3>
                                <p>Elige un instructor de la lista para ver sus cursos y generar recibos de pago</p>
                                <div className={styles.periodoPreview}>
                                    <span className={styles.periodoPreviewLabel}>Período actual:</span>
                                    <span className={styles.periodoPreviewValue}>{getDescripcionPeriodo()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}