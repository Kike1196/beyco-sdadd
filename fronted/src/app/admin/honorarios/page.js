// app/admin/honorarios/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Honorarios.module.css';

export default function HonorariosPage() {
    const [instructores, setInstructores] = useState([]);
    const [instructorSeleccionado, setInstructorSeleccionado] = useState(null);
    const [cursosPendientes, setCursosPendientes] = useState([]);
    const [periodo, setPeriodo] = useState('quincenal');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [cargando, setCargando] = useState(false);

    // Cargar instructores al iniciar y establecer fechas por defecto
    useEffect(() => {
        cargarInstructores();
        aplicarPeriodo('quincenal'); // Establecer período quincenal por defecto
    }, []);

    // Aplicar período automáticamente cuando cambie
    useEffect(() => {
        if (periodo) {
            aplicarPeriodo(periodo);
        }
    }, [periodo]);

    // Función para aplicar el período seleccionado
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

    // Manejar cambio de período
    const handlePeriodoChange = (nuevoPeriodo) => {
        setPeriodo(nuevoPeriodo);
        // Las fechas se actualizarán automáticamente por el useEffect
    };

    // Cargar lista de instructores
    const cargarInstructores = async () => {
        try {
            setCargando(true);
            const response = await fetch('/api/honorarios/instructores');
            const data = await response.json();
            
            if (data.success) {
                setInstructores(data.data);
                console.log('Instructores cargados:', data.data);
            } else {
                console.error('Error al cargar instructores:', data.error);
            }
        } catch (error) {
            console.error('Error al cargar instructores:', error);
        } finally {
            setCargando(false);
        }
    };

    // Manejar cambio de instructor en el desplegable
    const handleInstructorChange = async (event) => {
        const instructorId = parseInt(event.target.value);
        
        if (instructorId === 0) {
            setInstructorSeleccionado(null);
            setCursosPendientes([]);
            return;
        }

        if (!fechaInicio || !fechaFin) {
            alert('Por favor, establece las fechas de inicio y fin');
            return;
        }

        try {
            setCargando(true);
            console.log('🔍 Buscando cursos para instructor:', instructorId);
            console.log('📅 Fechas:', fechaInicio, 'a', fechaFin);
            console.log('📆 Período:', periodo);
            
            const url = `/api/honorarios/instructor/${instructorId}/cursos-pendientes?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            console.log('🌐 URL de la petición:', url);
            
            const response = await fetch(url);
            
            console.log('📡 Estado de la respuesta:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Datos recibidos:', data);
            
            if (data.success) {
                const instructor = instructores.find(i => i.numEmpleado === instructorId);
                setInstructorSeleccionado({
                    ...instructor,
                    ...data.data
                });
                setCursosPendientes(data.data.cursosPendientes || []);
                console.log('✅ Cursos cargados:', data.data.cursosPendientes?.length || 0);
            } else {
                console.error('❌ Error del servidor:', data.error);
                alert('Error al cargar los cursos pendientes: ' + data.error);
                setInstructorSeleccionado(null);
                setCursosPendientes([]);
            }
        } catch (error) {
            console.error('💥 Error de conexión:', error);
            alert('Error al conectar con el servidor: ' + error.message);
            setInstructorSeleccionado(null);
            setCursosPendientes([]);
        } finally {
            setCargando(false);
        }
    };

    // Calcular total a pagar
    const totalPagar = cursosPendientes.reduce((total, curso) => {
        return total + (curso.estatus === 'pendiente' ? parseFloat(curso.monto) : 0);
    }, 0);

    // Generar recibo
    const generarRecibo = () => {
        if (!instructorSeleccionado || cursosPendientes.length === 0) {
            alert('Selecciona un instructor con pagos pendientes');
            return;
        }

        const pagosPendientesIds = cursosPendientes
            .filter(curso => curso.estatus === 'pendiente')
            .map(curso => curso.id);

        if (pagosPendientesIds.length === 0) {
            alert('No hay pagos pendientes para generar recibo');
            return;
        }

        const reciboData = {
            instructor: instructorSeleccionado,
            cursos: cursosPendientes.filter(curso => curso.estatus === 'pendiente'),
            periodo: periodo,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            total: totalPagar,
            pagosIds: pagosPendientesIds
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
                target: { value: instructorSeleccionado.numEmpleado } 
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

    return (
        <div className={styles.pageContainer}>
            {/* Header con azul oscuro */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Generación de Recibos</h1>
                    <p>Selecciona un instructor y período para generar el recibo de honorarios</p>
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
                            🔄 Actualizar
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
                                        <span className={styles.infoValue}>{instructorSeleccionado.instructorNombre}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Email:</span>
                                        <span className={styles.infoValue}>{instructorSeleccionado.instructorEmail}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Período:</span>
                                        <span className={styles.infoValue}>{getDescripcionPeriodo()}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Cursos pendientes:</span>
                                        <span className={styles.infoValue}>{cursosPendientes.length}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Total pendiente:</span>
                                        <span className={styles.infoValueHighlight}>${totalPagar.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estadísticas rápidas */}
                        <div className={styles.statsCard}>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{instructores.length}</span>
                                <span className={styles.statLabel}>Instructores</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>
                                    {instructores.reduce((total, instructor) => total + (instructor.cursosCount || 0), 0)}
                                </span>
                                <span className={styles.statLabel}>Total Cursos</span>
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
                                            <span className={styles.statBadgeNumber}>{cursosPendientes.length}</span>
                                            <span className={styles.statBadgeLabel}>Cursos</span>
                                        </div>
                                        <div className={styles.statBadge}>
                                            <span className={styles.statBadgeNumber}>
                                                {cursosPendientes.reduce((sum, curso) => sum + (curso.horasImpartidas || 0), 0)}
                                            </span>
                                            <span className={styles.statBadgeLabel}>Horas</span>
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
                                                    onChange={(e) => handlePeriodoChange(e.target.value)}
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
                                                    onChange={(e) => handlePeriodoChange(e.target.value)}
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
                                                    onChange={(e) => handlePeriodoChange(e.target.value)}
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
                                                    onBlur={actualizarDatos}
                                                    className={styles.fechaField}
                                                />
                                            </div>
                                            <div className={styles.fechaInput}>
                                                <label className={styles.fechaLabel}>Fecha Fin</label>
                                                <input
                                                    type="date"
                                                    value={fechaFin}
                                                    onChange={(e) => setFechaFin(e.target.value)}
                                                    onBlur={actualizarDatos}
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

                                {/* Lista de Cursos Pendientes */}
                                <div className={styles.cursosSection}>
                                    <div className={styles.sectionHeader}>
                                        <h3>Pagos Pendientes</h3>
                                        <span className={styles.counterBadge}>{cursosPendientes.length}</span>
                                    </div>
                                    
                                    {cursosPendientes.length > 0 ? (
                                        <div className={styles.tableContainer}>
                                            <table className={styles.cursosTable}>
                                                <thead>
                                                    <tr>
                                                        <th>Curso</th>
                                                        <th>Fecha</th>
                                                        <th>Horas</th>
                                                        <th>Monto</th>
                                                        <th>Estatus</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cursosPendientes.map(curso => (
                                                        <tr key={curso.id}>
                                                            <td className={styles.cursoNombre}>
                                                                {curso.cursoNombre}
                                                            </td>
                                                            <td className={styles.cursoFecha}>
                                                                {new Date(curso.fechaCurso).toLocaleDateString('es-ES')}
                                                            </td>
                                                            <td className={styles.cursoHoras}>
                                                                {curso.horasImpartidas}
                                                            </td>
                                                            <td className={styles.cursoMonto}>
                                                                ${parseFloat(curso.monto).toFixed(2)}
                                                            </td>
                                                            <td>
                                                                <span className={`${styles.status} ${
                                                                    curso.estatus === 'pagado' ? styles.pagado : 
                                                                    curso.estatus === 'cancelado' ? styles.cancelado : 
                                                                    styles.pendiente
                                                                }`}>
                                                                    {curso.estatus}
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
                                            <p>No hay pagos pendientes en el período seleccionado</p>
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
                                                <span className={styles.totalLabel}>Total a Pagar</span>
                                                <span className={styles.totalAmount}>${totalPagar.toFixed(2)}</span>
                                                <span className={styles.periodoResumen}>
                                                    {getDescripcionPeriodo()} • {cursosPendientes.filter(c => c.estatus === 'pendiente').length} pagos
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
                                <p>Elige un instructor de la lista para ver sus pagos pendientes y generar recibos</p>
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