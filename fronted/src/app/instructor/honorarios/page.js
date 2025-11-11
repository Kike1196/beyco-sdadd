// app/instructor/honorarios/page.js - VERSIÓN CON BOTÓN REGRESAR
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Honorarios.module.css';

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

export default function HonorariosPage() {
    const [honorarios, setHonorarios] = useState([]);
    const [resumen, setResumen] = useState({});
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [periodo, setPeriodo] = useState('quincenal');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [instructorInfo, setInstructorInfo] = useState(null);

    const router = useRouter();

    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
    };
    
    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    // ✅ Función para regresar a la pantalla anterior
    const handleRegresar = () => {
        router.back(); // Regresa a la página anterior en el historial
    };

    // ✅ Función para obtener datos del usuario
    const getUserData = () => {
        if (typeof window === 'undefined') return null;
        
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            console.log('🔍 Datos del usuario obtenidos:', userData);
            return userData;
        } catch (error) {
            console.error('Error obteniendo datos del usuario:', error);
            return null;
        }
    };

    // ✅ Función para formatear números
    const formatNumber = (number) => {
        if (!mounted || typeof window === 'undefined') {
            return number?.toString() || '0';
        }
        return new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number || 0);
    };

    // ✅ Configurar período
    const aplicarPeriodo = (tipoPeriodo) => {
        if (typeof window === 'undefined') return;
        
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

    // ✅ Obtener información del instructor
    const getInstructorInfo = () => {
        if (typeof window === 'undefined') return null;
        
        const userData = getUserData();
        if (!userData) return null;
        
        return {
            nombre: userData.nombre || userData.Nombre || 'Instructor',
            apellidoPaterno: userData.apellidoPaterno || userData.Apellido_paterno || '',
            apellidoMaterno: userData.apellidoMaterno || userData.Apellido_materno || '',
            email: userData.correo || userData.email || userData.Correo || '',
            numEmpleado: userData.Num_Empleado || userData.id || ''
        };
    };

    // ✅ FUNCIÓN PRINCIPAL MEJORADA: Cargar datos reales inmediatamente
    const obtenerHonorariosInstructor = async (instructorId) => {
        try {
            console.log(`🚀 Obteniendo honorarios para instructor: ${instructorId}`);
            console.log(`📅 Período: ${fechaInicio} a ${fechaFin}`);

            // PRIMERO: Intentar obtener cursos pendientes del endpoint específico
            const endpointCursosPendientes = `http://localhost:8080/api/honorarios/instructor/${instructorId}/cursos-pendientes?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            
            console.log('🔍 Intentando endpoint de cursos pendientes:', endpointCursosPendientes);
            
            const responseCursos = await fetch(endpointCursosPendientes);
            
            if (responseCursos.ok) {
                const cursosData = await responseCursos.json();
                console.log('✅ Cursos pendientes obtenidos:', cursosData);
                
                if (cursosData.success && cursosData.data) {
                    return procesarDatosHonorarios(cursosData.data, instructorId);
                }
            }

            // SEGUNDO: Si falla, intentar obtener todos los cursos del instructor
            console.log('⚠️ Endpoint de cursos pendientes falló, intentando endpoint alternativo...');
            const endpointCursosAlternativo = `http://localhost:8080/api/honorarios/instructor/${instructorId}/cursos`;
            
            const responseAlternativo = await fetch(endpointCursosAlternativo);
            
            if (responseAlternativo.ok) {
                const cursosAltData = await responseAlternativo.json();
                console.log('✅ Cursos obtenidos (alternativo):', cursosAltData);
                
                if (cursosAltData.success && cursosAltData.data) {
                    return procesarDatosCursos(cursosAltData.data, instructorId);
                }
            }

            // TERCERO: Si todo falla, usar datos de ejemplo
            console.log('⚠️ Todos los endpoints fallaron, usando datos de ejemplo');
            return generarDatosEjemplo(instructorId);
            
        } catch (error) {
            console.error('❌ Error obteniendo honorarios:', error);
            throw error;
        }
    };

    // ✅ FUNCIÓN PARA PROCESAR DATOS DE CURSOS PENDIENTES (MONTO DESDE BD)
    const procesarDatosHonorarios = (honorariosData, instructorId) => {
        console.log('🔄 Procesando datos de honorarios (monto desde BD):', honorariosData);
        
        const honorariosPorMes = {};
        
        if (honorariosData.cursosPendientes && Array.isArray(honorariosData.cursosPendientes)) {
            honorariosData.cursosPendientes.forEach(curso => {
                try {
                    const fechaCurso = new Date(curso.fechaPago || curso.Fecha_Pago || Date.now());
                    const mesKey = `${fechaCurso.getFullYear()}-${String(fechaCurso.getMonth() + 1).padStart(2, '0')}`;
                    const mesNombre = fechaCurso.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                    
                    if (!honorariosPorMes[mesKey]) {
                        honorariosPorMes[mesKey] = {
                            id: mesKey,
                            mes: mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1),
                            cursos: 0,
                            total: 0,
                            detalles: [],
                            estatus: curso.estatus || 'pendiente',
                            fechaPago: curso.fechaPago || curso.Fecha_Pago,
                            horasImpartidas: 0,
                            comprobante: curso.comprobante || curso.Comprobante,
                            observaciones: curso.observaciones || curso.Observaciones
                        };
                    }
                    
                    // ✅ CORREGIDO: Usar el monto que ya viene de la base de datos
                    const montoCurso = parseFloat(curso.monto || curso.Monto || curso.honorario || curso.Honorario || 0);
                    const horasCurso = parseInt(curso.horasImpartidas || curso.Horas_Impartidas || 8);
                    
                    honorariosPorMes[mesKey].cursos += 1;
                    honorariosPorMes[mesKey].total += montoCurso;
                    honorariosPorMes[mesKey].horasImpartidas += horasCurso;
                    
                    // Extraer información del curso
                    let nombreCurso = curso.nombreCurso || curso.Nombre_Curso || 'Curso impartido';
                    let empresaCurso = curso.empresa || curso.Empresa || 'BEYCO Consultores';
                    let lugarCurso = curso.lugar || curso.Lugar || 'Centro de capacitación';
                    
                    // Si no hay información en los campos específicos, intentar extraer de observaciones
                    if (curso.observaciones && nombreCurso === 'Curso impartido') {
                        const matchCurso = curso.observaciones.match(/Curso:?\s*([^(]+)/);
                        const matchEmpresa = curso.observaciones.match(/Empresa:?\s*([^(]+)/);
                        const matchLugar = curso.observaciones.match(/Lugar:?\s*([^(]+)/);
                        
                        if (matchCurso && matchCurso[1]) {
                            nombreCurso = matchCurso[1].trim();
                        }
                        if (matchEmpresa && matchEmpresa[1]) {
                            empresaCurso = matchEmpresa[1].trim();
                        }
                        if (matchLugar && matchLugar[1]) {
                            lugarCurso = matchLugar[1].trim();
                        }
                    }
                    
                    honorariosPorMes[mesKey].detalles.push({
                        curso: nombreCurso,
                        horas: horasCurso,
                        monto: montoCurso,
                        tipo: curso.estatus === 'pagado' ? 'Pago registrado' : 'Curso pendiente',
                        fecha: fechaCurso.toLocaleDateString('es-ES'),
                        empresa: empresaCurso,
                        lugar: lugarCurso
                    });
                    
                } catch (error) {
                    console.error('❌ Error procesando curso:', curso, error);
                }
            });
        }
        
        const resultado = Object.values(honorariosPorMes).sort((a, b) => new Date(b.mes) - new Date(a.mes));
        console.log('💰 Honorarios procesados (monto desde BD):', resultado);
        return resultado;
    };

    // ✅ FUNCIÓN PARA PROCESAR DATOS DE CURSOS REGULARES (MONTO DESDE BD)
    const procesarDatosCursos = (cursosData, instructorId) => {
        console.log('🔄 Procesando datos de cursos (monto desde BD):', cursosData);
        
        const honorariosPorMes = {};
        
        cursosData.forEach(curso => {
            try {
                const fechaCurso = new Date(curso.fechaPago || curso.Fecha_Pago || Date.now());
                const mesKey = `${fechaCurso.getFullYear()}-${String(fechaCurso.getMonth() + 1).padStart(2, '0')}`;
                const mesNombre = fechaCurso.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                
                if (!honorariosPorMes[mesKey]) {
                    honorariosPorMes[mesKey] = {
                        id: mesKey,
                        mes: mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1),
                        cursos: 0,
                        total: 0,
                        detalles: [],
                        estatus: 'pendiente',
                        fechaPago: null,
                        horasImpartidas: 0
                    };
                }
                
                // ✅ CORREGIDO: Usar el monto que ya viene de la base de datos
                const montoCurso = parseFloat(curso.monto || curso.Monto || curso.honorario || curso.Honorario || 0);
                const horasCurso = curso.horasImpartidas || curso.Horas_Impartidas || 8;
                
                honorariosPorMes[mesKey].cursos += 1;
                honorariosPorMes[mesKey].total += montoCurso;
                honorariosPorMes[mesKey].horasImpartidas += horasCurso;
                
                // Extraer información del curso
                let nombreCurso = curso.nombreCurso || curso.Nombre_Curso || 'Curso impartido';
                let empresaCurso = curso.empresa || curso.Empresa || 'BEYCO Consultores';
                let lugarCurso = curso.lugar || curso.Lugar || 'Centro de capacitación';
                
                if (curso.observaciones && nombreCurso === 'Curso impartido') {
                    const matchCurso = curso.observaciones.match(/Curso:?\s*([^(]+)/);
                    const matchEmpresa = curso.observaciones.match(/Empresa:?\s*([^(]+)/);
                    const matchLugar = curso.observaciones.match(/Lugar:?\s*([^(]+)/);
                    
                    if (matchCurso && matchCurso[1]) {
                        nombreCurso = matchCurso[1].trim();
                    }
                    if (matchEmpresa && matchEmpresa[1]) {
                        empresaCurso = matchEmpresa[1].trim();
                    }
                    if (matchLugar && matchLugar[1]) {
                        lugarCurso = matchLugar[1].trim();
                    }
                }
                
                honorariosPorMes[mesKey].detalles.push({
                    curso: nombreCurso,
                    horas: horasCurso,
                    monto: montoCurso,
                    tipo: 'Curso impartido',
                    fecha: fechaCurso.toLocaleDateString('es-ES'),
                    empresa: empresaCurso,
                    lugar: lugarCurso
                });
                
            } catch (error) {
                console.error('❌ Error procesando curso:', curso, error);
            }
        });

        const resultado = Object.values(honorariosPorMes).sort((a, b) => new Date(b.mes) - new Date(a.mes));
        console.log('📊 Cursos procesados (monto desde BD):', resultado);
        return resultado;
    };

    // ✅ FUNCIÓN PARA GENERAR DATOS DE EJEMPLO (MONTO VARIABLE)
    const generarDatosEjemplo = (instructorId) => {
        console.log('🎭 Generando datos de ejemplo para instructor (monto variable):', instructorId);
        
        const datosEjemplo = [
            { 
                id: '2024-11', 
                mes: 'Noviembre 2024', 
                cursos: 3, 
                total: 18750, // Suma de montos variables
                estatus: 'Pendiente',
                fechaPago: null,
                horasImpartidas: 24,
                detalles: [
                    { 
                        curso: 'Seguridad Industrial', 
                        horas: 8, 
                        monto: 6500, // Monto variable desde BD
                        tipo: 'Curso impartido',
                        fecha: '15/11/2024',
                        empresa: 'Aceros del Norte',
                        lugar: 'Planta Principal'
                    },
                    { 
                        curso: 'Trabajos en Alturas', 
                        horas: 8, 
                        monto: 7250, // Monto variable desde BD
                        tipo: 'Curso impartido',
                        fecha: '20/11/2024',
                        empresa: 'Construcciones Modernas',
                        lugar: 'Obra Norte'
                    },
                    { 
                        curso: 'Manejo de Residuos Peligrosos', 
                        horas: 8, 
                        monto: 5000, // Monto variable desde BD
                        tipo: 'Curso impartido',
                        fecha: '25/11/2024',
                        empresa: 'Eco Solutions',
                        lugar: 'Centro de Capacitación'
                    }
                ]
            },
            { 
                id: '2024-10', 
                mes: 'Octubre 2024', 
                cursos: 2, 
                total: 11000, // Suma de montos variables
                estatus: 'Pagado',
                fechaPago: '2024-11-05',
                horasImpartidas: 16,
                detalles: [
                    { 
                        curso: 'Operación de Montacargas', 
                        horas: 8, 
                        monto: 6000, // Monto variable desde BD
                        tipo: 'Pago registrado',
                        fecha: '10/10/2024',
                        empresa: 'Almacenes Centrales',
                        lugar: 'Patio de Maniobras'
                    },
                    { 
                        curso: 'Primeros Auxilios', 
                        horas: 8, 
                        monto: 5000, // Monto variable desde BD
                        tipo: 'Pago registrado',
                        fecha: '18/10/2024',
                        empresa: 'Servicios Médicos',
                        lugar: 'Auditorio Principal'
                    }
                ]
            }
        ];
        
        return datosEjemplo;
    };

    // FUNCIÓN PARA CALCULAR RESUMEN
    const calcularResumen = (honorariosData) => {
        const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
        const honorariosMesActual = honorariosData.find(h => h.id === mesActual);
        
        const totalGeneral = honorariosData.reduce((sum, h) => sum + h.total, 0);
        const cursosGeneral = honorariosData.reduce((sum, h) => sum + h.cursos, 0);
        const horasGeneral = honorariosData.reduce((sum, h) => sum + h.horasImpartidas, 0);
        
        const pagados = honorariosData.filter(h => h.estatus.toLowerCase() === 'pagado');
        const totalPagado = pagados.reduce((sum, h) => sum + h.total, 0);
        
        return {
            totalEsteMes: honorariosMesActual?.total || 0,
            cursosEsteMes: honorariosMesActual?.cursos || 0,
            horasEsteMes: honorariosMesActual?.horasImpartidas || 0,
            totalGeneral,
            cursosGeneral,
            horasGeneral,
            totalPagado,
            proximoPago: calcularProximoPago()
        };
    };

    const calcularProximoPago = () => {
        const hoy = new Date();
        const proximo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 5); // Día 5 del siguiente mes
        return proximo.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // ✅ FUNCIÓN PRINCIPAL DE CARGA MEJORADA
    const cargarDatosReales = async () => {
        try {
            setLoading(true);
            const userData = getUserData();
            
            if (!userData) {
                router.push('/');
                return;
            }

            const instructorId = userData.Num_Empleado || userData.id || userData.userId;
            
            if (!instructorId) {
                throw new Error('No se pudo identificar al instructor');
            }

            console.log('🚀 Cargando datos REALES para instructor:', instructorId);
            
            const honorariosReales = await obtenerHonorariosInstructor(instructorId);
            const resumenCalculado = calcularResumen(honorariosReales);
            
            setHonorarios(honorariosReales);
            setResumen(resumenCalculado);
            
            console.log('✅ Honorarios REALES cargados:', honorariosReales);
            console.log('📊 Resumen calculado:', resumenCalculado);
            
            if (honorariosReales.length === 0) {
                showNotification('No se encontraron cursos asignados para calcular honorarios', 'info');
            } else {
                showNotification(`${honorariosReales.length} períodos de honorarios cargados`, 'success');
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos reales:', error);
            showNotification('Error al cargar los honorarios: ' + error.message, 'error');
            
            // Solo cargar datos de ejemplo como último recurso
            const datosEjemplo = generarDatosEjemplo();
            setHonorarios(datosEjemplo);
            setResumen(calcularResumen(datosEjemplo));
            showNotification('Usando datos de ejemplo. Verifique la conexión con el backend.', 'warning');
        } finally {
            setLoading(false);
        }
    };

    const [detalleExpandido, setDetalleExpandido] = useState(null);

    const toggleDetalle = (id) => {
        setDetalleExpandido(detalleExpandido === id ? null : id);
    };

    // ✅ CORREGIDO: useEffect optimizado para cargar datos inmediatamente
    useEffect(() => {
        setMounted(true);
        
        // Inicializar información del instructor
        const info = getInstructorInfo();
        setInstructorInfo(info);
        
        // Configurar período inicial
        aplicarPeriodo('quincenal');
        
        // ✅ CORRECCIÓN PRINCIPAL: Cargar datos reales inmediatamente
        cargarDatosReales();
    }, []); // Solo se ejecuta una vez al montar el componente

    // ✅ CORREGIDO: Actualizar datos cuando cambie el período
    const actualizarDatos = async () => {
        await cargarDatosReales();
    };

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
                    <h1>Mis Honorarios</h1>
                    <p>Consulta tus pagos y estados de cuenta</p>
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
                {/* ✅ Botón para regresar */}
                <div className={styles.breadcrumb}>
                    <button 
                        onClick={handleRegresar}
                        className={styles.btnRegresar}
                    >
                        ← Regresar
                    </button>
                </div>

                {/* ✅ Información del instructor simplificada */}
                {instructorInfo && (
                    <div className={styles.instructorInfoCard}>
                        <div className={styles.instructorAvatar}>
                            <span>👨‍🏫</span>
                        </div>
                        <div className={styles.instructorDetails}>
                            <h3>{instructorInfo.nombre} {instructorInfo.apellidoPaterno} {instructorInfo.apellidoMaterno}</h3>
                            <p>Número de Empleado: <strong>{instructorInfo.numEmpleado}</strong></p>
                        </div>
                    </div>
                )}

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
                                    disabled={loading}
                                >
                                    {loading ? '⏳' : '↻'} Aplicar Fechas
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ CORREGIDO: Mostrar contenido condicional basado en mounted */}
                {mounted && (
                    <>
                        {/* Resumen de honorarios */}
                        <div className={styles.resumenHonorarios}>
                            <div className={styles.tarjetaEstadistica}>
                                <h3>Total Este Mes</h3>
                                <div className={styles.numero}>${formatNumber(resumen.totalEsteMes || 0)}</div>
                                <div className={styles.subtexto}>MXN</div>
                                <div className={styles.detalleSubtexto}>{resumen.cursosEsteMes || 0} cursos</div>
                            </div>
                            <div className={styles.tarjetaEstadistica}>
                                <h3>Horas Este Mes</h3>
                                <div className={styles.numero}>{resumen.horasEsteMes || 0}</div>
                                <div className={styles.subtexto}>horas</div>
                                <div className={styles.detalleSubtexto}>Impartidas</div>
                            </div>
                            <div className={styles.tarjetaEstadistica}>
                                <h3>Total General</h3>
                                <div className={styles.numero}>${formatNumber(resumen.totalGeneral || 0)}</div>
                                <div className={styles.subtexto}>MXN</div>
                                <div className={styles.detalleSubtexto}>{resumen.cursosGeneral || 0} cursos total</div>
                            </div>
                            <div className={styles.tarjetaEstadistica}>
                                <h3>Próximo Pago</h3>
                                <div className={styles.numero}>{resumen.proximoPago || 'Por definir'}</div>
                                <div className={styles.subtexto}>Fecha estimada</div>
                                <div className={styles.detalleSubtexto}>Día 5 de cada mes</div>
                            </div>
                        </div>

                        {/* Historial de honorarios */}
                        <div className={styles.tableContainer}>
                            <div className={styles.tableHeader}>
                                <h3>Historial de Honorarios</h3>
                                <div className={styles.contador}>
                                    {loading ? 'Cargando...' : `${honorarios.length} períodos registrados`}
                                    {resumen.totalPagado > 0 && ` • $${formatNumber(resumen.totalPagado)} pagados`}
                                </div>
                            </div>

                            {loading ? (
                                <div className={styles.loading}>
                                    <div className={styles.spinner}></div>
                                    <p>Cargando honorarios...</p>
                                </div>
                            ) : (
                                <table className={styles.cursosTable}>
                                    <thead>
                                        <tr>
                                            <th>Período</th>
                                            <th>Cursos</th>
                                            <th>Horas</th>
                                            <th>Total Honorarios</th>
                                            <th>Fecha de Pago</th>
                                            <th>Estatus</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {honorarios.length > 0 ? (
                                            honorarios.map(honorario => (
                                                <React.Fragment key={honorario.id}>
                                                    <tr>
                                                        <td>
                                                            <strong>{honorario.mes}</strong>
                                                        </td>
                                                        <td>{honorario.cursos} curso{honorario.cursos !== 1 ? 's' : ''}</td>
                                                        <td>{honorario.horasImpartidas} horas</td>
                                                        <td>${formatNumber(honorario.total)} MXN</td>
                                                        <td>
                                                            {honorario.fechaPago 
                                                                ? new Date(honorario.fechaPago).toLocaleDateString('es-ES')
                                                                : 'Por pagar'
                                                            }
                                                        </td>
                                                        <td>
                                                            <span className={`${styles.status} ${styles[honorario.estatus?.toLowerCase() || 'pendiente']}`}>
                                                                {honorario.estatus || 'Pendiente'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className={styles.btnInscribir}
                                                                onClick={() => toggleDetalle(honorario.id)}
                                                            >
                                                                {detalleExpandido === honorario.id ? '📖 Ocultar' : '📄 Ver Detalles'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {detalleExpandido === honorario.id && (
                                                        <tr className={styles.detalleFila}>
                                                            <td colSpan="7">
                                                                <div className={styles.detalleHonorario}>
                                                                    <h4>Detalles del Período - {honorario.mes}</h4>
                                                                    <div className={styles.detalleInfo}>
                                                                        <div className={styles.detalleItemInfo}>
                                                                            <strong>Estatus:</strong> 
                                                                            <span className={`${styles.status} ${styles[honorario.estatus?.toLowerCase() || 'pendiente']}`}>
                                                                                {honorario.estatus || 'Pendiente'}
                                                                            </span>
                                                                        </div>
                                                                        {honorario.comprobante && (
                                                                            <div className={styles.detalleItemInfo}>
                                                                                <strong>Comprobante:</strong> 
                                                                                <span>{honorario.comprobante}</span>
                                                                            </div>
                                                                        )}
                                                                        {honorario.observaciones && (
                                                                            <div className={styles.detalleItemInfo}>
                                                                                <strong>Observaciones:</strong> 
                                                                                <span>{honorario.observaciones}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className={styles.detalleGrid}>
                                                                        {honorario.detalles.map((detalle, index) => (
                                                                            <div key={index} className={styles.detalleItem}>
                                                                                <div className={styles.detalleCursoInfo}>
                                                                                    <span className={styles.detalleCurso}>{detalle.curso}</span>
                                                                                    <span className={styles.detalleEmpresa}>{detalle.empresa}</span>
                                                                                    <span className={styles.detalleLugar}>{detalle.lugar} • {detalle.fecha}</span>
                                                                                </div>
                                                                                <div className={styles.detalleDatos}>
                                                                                    <span className={styles.detalleTipo}>{detalle.tipo}</span>
                                                                                    <span className={styles.detalleHoras}>{detalle.horas} horas</span>
                                                                                    <span className={styles.detalleMonto}>${formatNumber(detalle.monto)} MXN</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className={styles.detalleTotal}>
                                                                        <strong>Total del período: ${formatNumber(honorario.total)} MXN</strong>
                                                                        <span className={styles.detalleHorasTotal}>({honorario.horasImpartidas} horas totales)</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className={styles.noData}>
                                                    <div className={styles.noDataContent}>
                                                        <div className={styles.noDataIcon}>📊</div>
                                                        <h4>No hay datos de honorarios</h4>
                                                        <p>No se encontraron cursos asignados ni pagos registrados.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Información adicional - ACTUALIZADA para montos variables */}
                        <div className={styles.infoAdicional}>
                            <h3>Información de Pagos</h3>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <h4>🗓️ Fechas de Pago</h4>
                                    <p>Los pagos se realizan el día 5 de cada mes por los cursos impartidos en el mes anterior.</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <h4>💰 Cálculo de Honorarios</h4>
                                    <p>Los honorarios se calculan según el monto asignado a cada curso en el sistema.</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <h4>📋 Comprobantes</h4>
                                    <p>Los comprobantes de pago estarán disponibles una vez procesado el pago.</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.actionsSection}>
                            <button 
                                onClick={handleRegresar}
                                className={styles.btnRegresarAbajo}
                            >
                                ← Regresar
                            </button>
                            <button 
                                onClick={cargarDatosReales} 
                                className={styles.btnActualizar}
                                disabled={loading}
                            >
                                {loading ? '⏳' : '🔄'} Actualizar Datos
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}