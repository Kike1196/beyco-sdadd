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

    // Cargar instructores al iniciar
    useEffect(() => {
        cargarInstructores();
        // Establecer fechas por defecto (últimos 15 días)
        const hoy = new Date();
        const hace15Dias = new Date();
        hace15Dias.setDate(hoy.getDate() - 15);
        
        setFechaInicio(hace15Dias.toISOString().split('T')[0]);
        setFechaFin(hoy.toISOString().split('T')[0]);
    }, []);

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

    // Actualizar datos cuando cambien las fechas
    const actualizarDatos = async () => {
        if (instructorSeleccionado && fechaInicio && fechaFin) {
            await handleInstructorChange({ 
                target: { value: instructorSeleccionado.numEmpleado } 
            });
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/admin" className={styles.backButton}>
                    ← Volver 
                </Link>
                <h1>Honorarios de Instructores</h1>
            </header>

            <div className={styles.content}>
                {/* Panel de Selección */}
                <div className={styles.searchPanel}>
                    <h2>Seleccionar Instructor</h2>
                    
                    <div className={styles.selectContainer}>
                        <select 
                            onChange={handleInstructorChange}
                            className={styles.instructorSelect}
                            disabled={cargando}
                        >
                            <option value="0">
                                {cargando ? 'Cargando...' : 'Seleccionar instructor'}
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
                        <div className={styles.instructorInfo}>
                            <h3>Información del Instructor</h3>
                            <p><strong>Nombre:</strong> {instructorSeleccionado.instructorNombre}</p>
                            <p><strong>Email:</strong> {instructorSeleccionado.instructorEmail}</p>
                            <p><strong>Total pendiente:</strong> ${totalPagar.toFixed(2)}</p>
                            <p><strong>Cursos pendientes:</strong> {cursosPendientes.length}</p>
                        </div>
                    )}
                </div>

                {/* Panel de Cursos y Configuración */}
                <div className={styles.detailsPanel}>
                    {instructorSeleccionado ? (
                        <>
                            <div className={styles.instructorHeader}>
                                <h2>Instructor: {instructorSeleccionado.instructorNombre}</h2>
                                <p>Email: {instructorSeleccionado.instructorEmail}</p>
                            </div>

                            {/* Configuración de Periodo */}
                            <div className={styles.periodoConfig}>
                                <h3>Configuración de Periodo</h3>
                                <div className={styles.periodoOptions}>
                                    <label>
                                        <input
                                            type="radio"
                                            value="semanal"
                                            checked={periodo === 'semanal'}
                                            onChange={(e) => setPeriodo(e.target.value)}
                                        />
                                        Semanal
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            value="quincenal"
                                            checked={periodo === 'quincenal'}
                                            onChange={(e) => setPeriodo(e.target.value)}
                                        />
                                        Quincenal
                                    </label>
                                </div>
                                
                                <div className={styles.fechasInput}>
                                    <div>
                                        <label>Fecha Inicio:</label>
                                        <input
                                            type="date"
                                            value={fechaInicio}
                                            onChange={(e) => setFechaInicio(e.target.value)}
                                            onBlur={actualizarDatos}
                                        />
                                    </div>
                                    <div>
                                        <label>Fecha Fin:</label>
                                        <input
                                            type="date"
                                            value={fechaFin}
                                            onChange={(e) => setFechaFin(e.target.value)}
                                            onBlur={actualizarDatos}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Lista de Cursos Pendientes */}
                            <div className={styles.cursosList}>
                                <h3>Pagos Pendientes</h3>
                                {cursosPendientes.length > 0 ? (
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
                                                    <td>{curso.cursoNombre}</td>
                                                    <td>{new Date(curso.fechaCurso).toLocaleDateString()}</td>
                                                    <td>{curso.horasImpartidas}</td>
                                                    <td>${parseFloat(curso.monto).toFixed(2)}</td>
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
                                ) : (
                                    <div className={styles.noData}>
                                        <p>No hay pagos pendientes en el periodo seleccionado</p>
                                    </div>
                                )}
                            </div>

                            {/* Resumen y Generar Recibo */}
                            <div className={styles.resumenPanel}>
                                <div className={styles.totalSection}>
                                    <h3>Total a Pagar: ${totalPagar.toFixed(2)}</h3>
                                    <button 
                                        onClick={generarRecibo}
                                        className={styles.generateButton}
                                        disabled={totalPagar === 0 || cargando}
                                    >
                                        {cargando ? '⏳ Cargando...' : '📄 Generar Recibo de Pago'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.placeholder}>
                            <p>Selecciona un instructor para ver sus pagos pendientes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}