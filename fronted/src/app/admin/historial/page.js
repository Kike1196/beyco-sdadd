'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Historial.module.css';

export default function HistorialCursosPage() {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('nombre');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [error, setError] = useState(null);
    const router = useRouter();

    // Función para calcular precios basados en el tipo de curso
    const calcularPrecioPorCurso = (nombreCurso, stps) => {
        if (!nombreCurso) return 1400.00;
        
        const cursoLower = nombreCurso.toLowerCase();
        
        // Asignar precios basados en el tipo de curso
        if (cursoLower.includes('seguridad industrial')) {
            return 1400.00;
        } else if (cursoLower.includes('alturas') || cursoLower.includes('nom-659') || cursoLower.includes('nom 609')) {
            return 1600.00;
        } else if (cursoLower.includes('confinados') || cursoLower.includes('nom-523') || cursoLower.includes('nom 523')) {
            return 1800.00;
        } else if (cursoLower.includes('manejo de materiales') || cursoLower.includes('residuos peligrosos')) {
            return 2000.00;
        } else if (cursoLower.includes('comunicación') || cursoLower.includes('comunicacion') || cursoLower.includes('comunicativa')) {
            return 1200.00;
        } else if (cursoLower.includes('manejo de estrés') || cursoLower.includes('estres')) {
            return 1100.00;
        } else {
            // Precio base para otros cursos
            return 1500.00;
        }
    };

    // Función para calcular el estado del curso basado en la fecha
    const calcularEstadoCurso = (fecha) => {
        if (!fecha) return 'Desconocido';
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const fechaCurso = new Date(fecha);
        fechaCurso.setHours(0, 0, 0, 0);
        
        if (fechaCurso < hoy) return 'Finalizado';
        if (fechaCurso > hoy) return 'Programado';
        return 'Activo';
    };

    useEffect(() => {
        const loadCursos = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log("🔍 Cargando historial de cursos...");
                
                // Intentar con el endpoint de historial primero
                const testUrl = 'http://localhost:8080/api/historial/cursos';
                console.log("📡 Intentando conectar a:", testUrl);
                
                const cursosRes = await fetch(testUrl);
                console.log("📊 Status respuesta:", cursosRes.status);
                
                if (cursosRes.ok) {
                    const data = await cursosRes.json();
                    console.log("✅ Cursos cargados desde historial:", data.length);
                    
                    // Enriquecer los datos con información adicional
                    const cursosEnriquecidos = data.map(curso => {
                        const precioCalculado = calcularPrecioPorCurso(curso.nombre, curso.stps);
                        
                        return {
                            ...curso,
                            fecha: curso.fechaIngreso || curso.fecha,
                            // Usar PRECIO (lo que cobramos al cliente) para mostrar en la columna "Costo"
                            costo: curso.precio || precioCalculado,
                            status: calcularEstadoCurso(curso.fechaIngreso || curso.fecha)
                        };
                    });
                    
                    setCursos(cursosEnriquecidos);
                } else {
                    // Si el endpoint de historial falla, intentar con el endpoint regular de cursos
                    console.warn("⚠️ Endpoint de historial no disponible, intentando con cursos regulares");
                    await loadCursosFromRegularEndpoint();
                }
                
            } catch (error) {
                console.error("❌ Error con endpoint de historial:", error);
                // Intentar con el endpoint regular como fallback
                await loadCursosFromRegularEndpoint();
            } finally {
                setLoading(false);
            }
        };

        const loadCursosFromRegularEndpoint = async () => {
            try {
                console.log("🔄 Intentando cargar desde endpoint regular...");
                const cursosUrl = 'http://localhost:8080/api/cursos';
                const cursosRes = await fetch(cursosUrl);
                
                if (cursosRes.ok) {
                    const data = await cursosRes.json();
                    console.log("✅ Cursos cargados desde endpoint regular:", data.length);
                    
                    const cursosEnriquecidos = data.map(curso => {
                        const precioCalculado = calcularPrecioPorCurso(curso.nombre, curso.stps);
                        
                        return {
                            ...curso,
                            fecha: curso.fechaIngreso,
                            // Usar PRECIO para mostrar en la columna "Costo"
                            costo: curso.precio || precioCalculado,
                            status: calcularEstadoCurso(curso.fechaIngreso)
                        };
                    });
                    
                    setCursos(cursosEnriquecidos);
                } else {
                    throw new Error(`Error ${cursosRes.status} al cargar cursos`);
                }
            } catch (error) {
                console.error("❌ Error cargando cursos:", error);
                setError(`Error al cargar cursos: ${error.message}`);
                
                // Datos de prueba de emergencia CON PRECIOS REALES
                const datosEmergencia = [
                    {
                        id: 1,
                        nombre: "Seguridad Industrial",
                        stps: "STPS-MP-004",
                        horas: 8,
                        fechaIngreso: "2025-02-14",
                        fecha: "2025-02-14",
                        instructor: "Ana Garcia",
                        empresa: "Aceros del Norte y Ensambles SAPI",
                        lugar: "Planta de Matamoros",
                        precio: 1400.00,
                        costo: 1400.00, // Mostramos el precio como "costo" en la tabla
                        status: "Finalizado"
                    },
                    {
                        id: 2,
                        nombre: "Trabajo en Alturas (NOM-659)",
                        stps: "BETCO-NOM39-2911",
                        horas: 8,
                        fechaIngreso: "2025-10-24",
                        fecha: "2025-10-24",
                        instructor: "Ana Garcia",
                        empresa: "Aceros del Norte y Ensambles SAPI",
                        lugar: "Parque de Ensambles, Ramos Arizpe",
                        precio: 1600.00,
                        costo: 1600.00,
                        status: "Programado"
                    },
                    {
                        id: 3,
                        nombre: "Seguridad Industrial",
                        stps: "BETCO-LOTO-001",
                        horas: 8,
                        fechaIngreso: "2025-10-27",
                        fecha: "2025-10-27",
                        instructor: "Armando",
                        empresa: "Aceros del Norte y Ensambles SAPI",
                        lugar: "Almacenes Principales, Saltillo",
                        precio: 1400.00,
                        costo: 1400.00,
                        status: "Programado"
                    },
                    {
                        id: 4,
                        nombre: "Trabajo en Espacios Confinados (NOM-523)",
                        stps: "BETCO-NOM33-2915",
                        horas: 8,
                        fechaIngreso: "2025-11-04",
                        fecha: "2025-11-04",
                        instructor: "Ana Garcia",
                        empresa: "Aceros del Norte y Ensambles SAPI",
                        lugar: "Coahuila",
                        precio: 1800.00,
                        costo: 1800.00,
                        status: "Programado"
                    },
                    {
                        id: 5,
                        nombre: "Trabajo en Espacios Confinados (NOM-523)",
                        stps: "BETCO-NOM33-2916",
                        horas: 8,
                        fechaIngreso: "2025-11-09",
                        fecha: "2025-11-09",
                        instructor: "Silvia",
                        empresa: "Logistica Industrial del Norte S.A.",
                        lugar: "Planta de Matamoros, Ramos Arizpe",
                        precio: 1800.00,
                        costo: 1800.00,
                        status: "Programado"
                    },
                    {
                        id: 6,
                        nombre: "Manejo de Estrés y Carga Mental",
                        stps: "BET-MEA-007",
                        horas: 8,
                        fechaIngreso: "2025-10-21",
                        fecha: "2025-10-21",
                        instructor: "Silvia",
                        empresa: "Manufacturas Coahuilenses S.A.",
                        lugar: "Coahuila",
                        precio: 1100.00,
                        costo: 1100.00,
                        status: "Finalizado"
                    },
                    {
                        id: 7,
                        nombre: "Comunicación Asertiva",
                        stps: "BET-COM-005",
                        horas: 8,
                        fechaIngreso: "2025-10-21",
                        fecha: "2025-10-21",
                        instructor: "Ana",
                        empresa: "Autopartes Ensambladas de México",
                        lugar: "Coahuila",
                        precio: 1200.00,
                        costo: 1200.00,
                        status: "Finalizado"
                    }
                ];
                setCursos(datosEmergencia);
            }
        };

        loadCursos();
    }, []);

    // Filtrar cursos por año
    const cursosFiltradosPorAnio = useMemo(() => {
        return cursos.filter(curso => {
            if (!curso.fecha) return false;
            const cursoYear = new Date(curso.fecha).getFullYear();
            return cursoYear === selectedYear;
        });
    }, [cursos, selectedYear]);

    // Filtrar cursos por búsqueda
    const filteredCursos = useMemo(() => {
        return cursosFiltradosPorAnio.filter(curso => {
            if (!searchTerm) return true;
            const fieldValue = curso[filterBy]?.toString().toLowerCase();
            return fieldValue?.includes(searchTerm.toLowerCase());
        });
    }, [cursosFiltradosPorAnio, searchTerm, filterBy]);

    // Obtener años disponibles
    const añosDisponibles = useMemo(() => {
        const años = cursos
            .map(curso => curso.fecha ? new Date(curso.fecha).getFullYear() : null)
            .filter(year => year !== null);
        
        const añosUnicos = [...new Set(años)].sort((a, b) => b - a);
        return añosUnicos.length > 0 ? añosUnicos : [new Date().getFullYear()];
    }, [cursos]);

    const getBadgeClass = (status) => {
        if (!status) return styles.badgeDefault;
        
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'finalizado': 
                return styles.badgeSuccess;
            case 'activo':
                return styles.badgeWarning;
            case 'programado':
                return styles.badgeInfo;
            case 'cancelado':
                return styles.badgeError;
            default: 
                return styles.badgeDefault;
        }
    };

    const getStatusTexto = (status) => {
        if (!status) return 'Desconocido';
        return status;
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '$0.00';
        
        // Convertir a número si es BigDecimal o string
        let amountNumber;
        if (typeof amount === 'object' && amount !== null) {
            // Si es BigDecimal (objeto)
            amountNumber = parseFloat(amount.toString()) || 0;
        } else {
            amountNumber = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        }
        
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amountNumber);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    const exportToExcel = () => {
        console.log("📊 Exportando datos a Excel...");
        const dataForExport = filteredCursos.map(curso => ({
            'Curso': curso.nombre,
            'Clave STPS': curso.stps,
            'Horas': curso.horas,
            'Fecha': formatDate(curso.fecha),
            'Instructor': curso.instructor,
            'Empresa': curso.empresa,
            'Lugar': curso.lugar,
            'Precio': formatCurrency(curso.costo), // Aquí mostramos el precio como "Precio"
            'Estado': getStatusTexto(curso.status)
        }));
        
        console.log("Datos para exportar:", dataForExport);
        
        // Simular descarga de CSV
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Curso,Clave STPS,Horas,Fecha,Instructor,Empresa,Lugar,Precio,Estado\n"
            + dataForExport.map(row => 
                `"${row.Curso}","${row['Clave STPS']}",${row.Horas},"${row.Fecha}","${row.Instructor}","${row.Empresa}","${row.Lugar}",${row.Precio},"${row.Estado}"`
            ).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `historial_cursos_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generateReport = () => {
        console.log("📈 Generando reporte...");
        
        const reportData = {
            totalCursos: cursosFiltradosPorAnio.length,
            cursosActivos: cursosFiltradosPorAnio.filter(c => c.status?.toLowerCase() === 'activo').length,
            cursosFinalizados: cursosFiltradosPorAnio.filter(c => c.status?.toLowerCase() === 'finalizado').length,
            cursosProgramados: cursosFiltradosPorAnio.filter(c => c.status?.toLowerCase() === 'programado').length,
            horasTotales: cursosFiltradosPorAnio.reduce((sum, curso) => sum + (curso.horas || 0), 0),
            ingresosTotales: cursosFiltradosPorAnio.reduce((sum, curso) => sum + (parseFloat(curso.costo) || 0), 0),
            empresasUnicas: [...new Set(cursosFiltradosPorAnio.map(c => c.empresa))].length,
            instructoresUnicos: [...new Set(cursosFiltradosPorAnio.map(c => c.instructor))].length
        };
        
        console.log("📊 Reporte generado:", reportData);
        
        const reportMessage = `REPORTE DE CURSOS - AÑO ${selectedYear}

• Total de Cursos: ${reportData.totalCursos}
• Cursos Activos: ${reportData.cursosActivos}
• Cursos Finalizados: ${reportData.cursosFinalizados}
• Cursos Programados: ${reportData.cursosProgramados}
• Horas Totales Impartidas: ${reportData.horasTotales}h
• Ingresos Totales: ${formatCurrency(reportData.ingresosTotales)}
• Empresas Diferentes: ${reportData.empresasUnicas}
• Instructores Participantes: ${reportData.instructoresUnicos}

--- Estadísticas Detalladas ---
Promedio de horas por curso: ${(reportData.horasTotales / reportData.totalCursos || 0).toFixed(1)}h
Ingreso promedio por curso: ${formatCurrency(reportData.ingresosTotales / reportData.totalCursos || 0)}
Ingreso por hora: ${formatCurrency(reportData.ingresosTotales / reportData.horasTotales || 0)}`;

        alert(reportMessage);
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando historial de cursos...</p>
                    <p className={styles.loadingSubtitle}>Conectando con el servidor</p>
                </div>
            </div>
        );
    }

    if (error && cursos.length === 0) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.errorContainer}>
                    <h2>⚠️ Error al cargar el historial</h2>
                    <p>{error}</p>
                    <div className={styles.errorActions}>
                        <button onClick={() => window.location.reload()} className={styles.btnRetry}>
                            🔄 Reintentar
                        </button>
                        <button onClick={() => router.back()} className={styles.btnBack}>
                            ← Volver
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Historial de Cursos</h1>
                    <p>Gestión y consulta de cursos impartidos</p>
                </div>
                <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
            </header>

            <main className={styles.mainContent}>
                {/* Controles de filtro y búsqueda */}
                <div className={styles.controls}>
                    <div className={styles.searchSection}>
                        <input 
                            type="text" 
                            placeholder="Buscar en el historial..." 
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className={styles.filterOptions}>
                            <label>
                                <input 
                                    type="radio" 
                                    name="filter" 
                                    value="nombre" 
                                    checked={filterBy === 'nombre'} 
                                    onChange={(e) => setFilterBy(e.target.value)} 
                                /> 
                                Curso
                            </label>
                            <label>
                                <input 
                                    type="radio" 
                                    name="filter" 
                                    value="instructor" 
                                    checked={filterBy === 'instructor'} 
                                    onChange={(e) => setFilterBy(e.target.value)} 
                                /> 
                                Instructor
                            </label>
                            <label>
                                <input 
                                    type="radio" 
                                    name="filter" 
                                    value="empresa" 
                                    checked={filterBy === 'empresa'} 
                                    onChange={(e) => setFilterBy(e.target.value)} 
                                /> 
                                Empresa
                            </label>
                            <label>
                                <input 
                                    type="radio" 
                                    name="filter" 
                                    value="lugar" 
                                    checked={filterBy === 'lugar'} 
                                    onChange={(e) => setFilterBy(e.target.value)} 
                                /> 
                                Lugar
                            </label>
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <div className={styles.yearFilter}>
                            <label>Año:</label>
                            <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className={styles.yearSelect}
                            >
                                {añosDisponibles.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.actionButtons}>
                            <button onClick={exportToExcel} className={styles.btnExport}>
                                📊 Exportar Excel
                            </button>
                            <button onClick={generateReport} className={styles.btnReport}>
                                📈 Generar Reporte
                            </button>
                            <button onClick={() => router.back()} className={styles.btnBack}>
                                ← Volver
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mostrar advertencia si estamos usando datos de emergencia */}
                {error && cursos.length > 0 && (
                    <div className={styles.warningBanner}>
                        <span>⚠️ {error}. Mostrando datos de ejemplo.</span>
                    </div>
                )}

                {/* Estadísticas */}
                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <h3>Total Cursos</h3>
                        <span className={styles.statNumber}>{cursosFiltradosPorAnio.length}</span>
                        <p className={styles.statSubtitle}>Año {selectedYear}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Finalizados</h3>
                        <span className={styles.statNumber}>
                            {cursosFiltradosPorAnio.filter(c => c.status?.toLowerCase() === 'finalizado').length}
                        </span>
                        <p className={styles.statSubtitle}>Completados</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Activos</h3>
                        <span className={styles.statNumber}>
                            {cursosFiltradosPorAnio.filter(c => c.status?.toLowerCase() === 'activo').length}
                        </span>
                        <p className={styles.statSubtitle}>En progreso</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Programados</h3>
                        <span className={styles.statNumber}>
                            {cursosFiltradosPorAnio.filter(c => c.status?.toLowerCase() === 'programado').length}
                        </span>
                        <p className={styles.statSubtitle}>Próximos</p>
                    </div>
                </div>

                {/* Tabla de cursos */}
                <div className={styles.tableContainer}>
                    <table className={styles.cursosTable}>
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Clave STPS</th>
                                <th>Horas</th>
                                <th>Fecha</th>
                                <th>Instructor</th>
                                <th>Empresa</th>
                                <th>Lugar</th>
                                <th>Precio</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCursos.length > 0 ? (
                                filteredCursos.map(curso => (
                                    <tr key={curso.id}>
                                        <td className={styles.cursoNombre}>{curso.nombre || 'Sin nombre'}</td>
                                        <td className={styles.stpsCode}>{curso.stps || 'N/A'}</td>
                                        <td className={styles.horas}>{curso.horas || 0}h</td>
                                        <td className={styles.fecha}>{formatDate(curso.fecha)}</td>
                                        <td>{curso.instructor || 'No asignado'}</td>
                                        <td className={styles.empresa}>{curso.empresa || 'Sin empresa'}</td>
                                        <td className={styles.lugar}>{curso.lugar || 'Sin lugar'}</td>
                                        <td className={styles.precio}>{formatCurrency(curso.costo)}</td>
                                        <td>
                                            <span className={`${styles.badge} ${getBadgeClass(curso.status)}`}>
                                                {getStatusTexto(curso.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className={styles.noData}>
                                        {searchTerm ? 
                                            `No se encontraron cursos que coincidan con "${searchTerm}"` : 
                                            'No se encontraron cursos para los filtros seleccionados'
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pie de página informativo */}
                <div className={styles.footerInfo}>
                    <p>
                        Mostrando <strong>{filteredCursos.length}</strong> de <strong>{cursosFiltradosPorAnio.length}</strong> cursos 
                        {selectedYear !== new Date().getFullYear() ? ` para el año ${selectedYear}` : ' para el año actual'}
                        {searchTerm && ` • Filtrado por: "${searchTerm}"`}
                    </p>
                    {cursos.length > 0 && (
                        <p className={styles.lastUpdate}>
                            Última actualización: {new Date().toLocaleString('es-ES')}
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}