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
    const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' para todos los meses
    const [error, setError] = useState(null);
    const router = useRouter();

    // Nombres de los meses
    const meses = [
        { value: 'all', label: 'Todos los meses' },
        { value: '0', label: 'Enero' },
        { value: '1', label: 'Febrero' },
        { value: '2', label: 'Marzo' },
        { value: '3', label: 'Abril' },
        { value: '4', label: 'Mayo' },
        { value: '5', label: 'Junio' },
        { value: '6', label: 'Julio' },
        { value: '7', label: 'Agosto' },
        { value: '8', label: 'Septiembre' },
        { value: '9', label: 'Octubre' },
        { value: '10', label: 'Noviembre' },
        { value: '11', label: 'Diciembre' }
    ];

    // Función para calcular precios basados en el tipo de curso
    const calcularPrecioPorCurso = (nombreCurso, stps) => {
        if (!nombreCurso) return 1400.00;
        
        const cursoLower = nombreCurso.toLowerCase();
        
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
                
                const testUrl = 'http://localhost:8080/api/historial/cursos';
                console.log("📡 Intentando conectar a:", testUrl);
                
                const cursosRes = await fetch(testUrl);
                console.log("📊 Status respuesta:", cursosRes.status);
                
                if (cursosRes.ok) {
                    const data = await cursosRes.json();
                    console.log("✅ Cursos cargados desde historial:", data.length);
                    
                    const cursosEnriquecidos = data.map(curso => {
                        const precioCalculado = calcularPrecioPorCurso(curso.nombre, curso.stps);
                        
                        return {
                            ...curso,
                            fecha: curso.fechaIngreso || curso.fecha,
                            costo: curso.precio || precioCalculado,
                            status: calcularEstadoCurso(curso.fechaIngreso || curso.fecha)
                        };
                    });
                    
                    setCursos(cursosEnriquecidos);
                } else {
                    console.warn("⚠️ Endpoint de historial no disponible, intentando con cursos regulares");
                    await loadCursosFromRegularEndpoint();
                }
                
            } catch (error) {
                console.error("❌ Error con endpoint de historial:", error);
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
                
                // Datos de prueba de emergencia
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
                        costo: 1400.00,
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

    // ✅ NUEVO: Filtrar cursos por año Y mes
    const cursosFiltradosPorPeriodo = useMemo(() => {
        return cursos.filter(curso => {
            if (!curso.fecha) return false;
            
            const fechaCurso = new Date(curso.fecha);
            const cursoYear = fechaCurso.getFullYear();
            const cursoMonth = fechaCurso.getMonth();
            
            // Filtrar por año
            if (cursoYear !== selectedYear) return false;
            
            // Filtrar por mes (si no es 'all')
            if (selectedMonth !== 'all' && cursoMonth !== parseInt(selectedMonth)) {
                return false;
            }
            
            return true;
        });
    }, [cursos, selectedYear, selectedMonth]);

    // Filtrar cursos por búsqueda
    const filteredCursos = useMemo(() => {
        return cursosFiltradosPorPeriodo.filter(curso => {
            if (!searchTerm) return true;
            const fieldValue = curso[filterBy]?.toString().toLowerCase();
            return fieldValue?.includes(searchTerm.toLowerCase());
        });
    }, [cursosFiltradosPorPeriodo, searchTerm, filterBy]);

    // ✅ CORREGIDO: Generar rango de años desde 2020 hasta año actual + 2
    const añosDisponibles = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const startYear = 2020; // Año inicial
        const endYear = currentYear + 2; // Año actual + 2 años futuros
        
        const años = [];
        for (let year = endYear; year >= startYear; year--) {
            años.push(year);
        }
        
        return años;
    }, []);

    // ✅ CORREGIDO: Todos los meses siempre disponibles
    const mesesDisponibles = meses;

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
        
        let amountNumber;
        if (typeof amount === 'object' && amount !== null) {
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
            'Curso': curso.nombre || 'Sin nombre',
            'Clave STPS': curso.stps || 'N/A',
            'Horas': curso.horas || 0,
            'Fecha': curso.fecha ? new Date(curso.fecha).toLocaleDateString('es-ES') : 'Sin fecha',
            'Instructor': curso.instructor || 'No asignado',
            'Empresa': curso.empresa || 'Sin empresa',
            'Lugar': curso.lugar || 'Sin lugar',
            'Precio': curso.costo || 0,
            'Estado': getStatusTexto(curso.status)
        }));
        
        console.log("Datos para exportar:", dataForExport);
        
        const headers = Object.keys(dataForExport[0] || {});
        const csvHeaders = headers.map(header => `"${header}"`).join(',');
        
        const csvRows = dataForExport.map(row => 
            headers.map(header => {
                const value = row[header];
                if (header === 'Precio' || header === 'Horas') {
                    return value;
                }
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        );
        
        const csvContent = [csvHeaders, ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        
        const url = URL.createObjectURL(blob);
        const mesLabel = selectedMonth === 'all' ? 'todos' : meses.find(m => m.value === selectedMonth)?.label.toLowerCase();
        link.setAttribute("href", url);
        link.setAttribute("download", `historial_cursos_${selectedYear}_${mesLabel}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification(`✅ Archivo exportado correctamente`, 'success');
    };

    const generatePDF = () => {
        console.log("📈 Generando reporte PDF...");
        
        const reportData = {
            totalCursos: cursosFiltradosPorPeriodo.length,
            cursosActivos: cursosFiltradosPorPeriodo.filter(c => c.status?.toLowerCase() === 'activo').length,
            cursosFinalizados: cursosFiltradosPorPeriodo.filter(c => c.status?.toLowerCase() === 'finalizado').length,
            cursosProgramados: cursosFiltradosPorPeriodo.filter(c => c.status?.toLowerCase() === 'programado').length,
            horasTotales: cursosFiltradosPorPeriodo.reduce((sum, curso) => sum + (curso.horas || 0), 0),
            ingresosTotales: cursosFiltradosPorPeriodo.reduce((sum, curso) => sum + (parseFloat(curso.costo) || 0), 0),
            empresasUnicas: [...new Set(cursosFiltradosPorPeriodo.map(c => c.empresa))].length,
            instructoresUnicos: [...new Set(cursosFiltradosPorPeriodo.map(c => c.instructor))].length
        };

        const mesTexto = selectedMonth === 'all' ? 'Todos los meses' : meses.find(m => m.value === selectedMonth)?.label;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Cursos - BEYCO</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                    }
                    .report-container {
                        background: white;
                        border-radius: 15px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        padding: 30px;
                        max-width: 1000px;
                        margin: 0 auto;
                        position: relative;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px solid #001f3f;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                        background: linear-gradient(135deg, #001f3f 0%, #003366 100%);
                        color: white;
                        padding: 30px;
                        border-radius: 10px;
                        margin: -30px -30px 30px -30px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: bold;
                    }
                    .header .subtitle {
                        font-size: 16px;
                        opacity: 0.9;
                        margin-top: 5px;
                    }
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 15px;
                        margin-bottom: 30px;
                    }
                    .stat-card {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    }
                    .stat-number {
                        font-size: 24px;
                        font-weight: bold;
                        display: block;
                    }
                    .stat-label {
                        font-size: 12px;
                        opacity: 0.9;
                        margin-top: 5px;
                    }
                    .section-title {
                        background: #001f3f;
                        color: white;
                        padding: 12px 20px;
                        border-radius: 8px;
                        margin: 25px 0 15px 0;
                        font-size: 18px;
                        font-weight: bold;
                    }
                    .details-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        font-size: 12px;
                    }
                    .details-table th {
                        background: #f8f9fa;
                        color: #495057;
                        padding: 12px 8px;
                        text-align: left;
                        border-bottom: 2px solid #dee2e6;
                        font-weight: bold;
                    }
                    .details-table td {
                        padding: 10px 8px;
                        border-bottom: 1px solid #e9ecef;
                    }
                    .details-table tr:hover {
                        background-color: #f8f9fa;
                    }
                    .badge {
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    .badge-finalizado { background: #d4edda; color: #155724; }
                    .badge-activo { background: #fff3cd; color: #856404; }
                    .badge-programado { background: #cce7ff; color: #004085; }
                    .currency {
                        font-weight: bold;
                        color: #28a745;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 2px solid #e9ecef;
                        color: #6c757d;
                        font-size: 12px;
                    }
                    .controls {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 10000;
                    }
                    .close-btn {
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                        margin-left: 10px;
                    }
                    .close-btn:hover {
                        background: #c82333;
                    }
                    .print-btn {
                        background: #28a745;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    }
                    .print-btn:hover {
                        background: #218838;
                    }
                    @media print {
                        body { 
                            background: white !important; 
                            margin: 0;
                            padding: 10px;
                        }
                        .report-container {
                            box-shadow: none;
                            margin: 0;
                            padding: 10px;
                        }
                        .header {
                            margin: -10px -10px 20px -10px;
                        }
                        .controls {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="controls">
                    <button class="print-btn" onclick="window.print()">🖨️ Imprimir/Guardar PDF</button>
                    <button class="close-btn" onclick="window.close()">❌ Cerrar</button>
                </div>

                <div class="report-container">
                    <div class="header">
                        <h1>BEYCO CONSULTORES</h1>
                        <div class="subtitle">Reporte de Cursos - ${selectedYear} - ${mesTexto}</div>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <span class="stat-number">${reportData.totalCursos}</span>
                            <div class="stat-label">TOTAL CURSOS</div>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">${reportData.cursosFinalizados}</span>
                            <div class="stat-label">FINALIZADOS</div>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">${reportData.cursosActivos}</span>
                            <div class="stat-label">ACTIVOS</div>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">${reportData.cursosProgramados}</span>
                            <div class="stat-label">PROGRAMADOS</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div class="stat-card" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
                            <span class="stat-number">${reportData.horasTotales}h</span>
                            <div class="stat-label">HORAS TOTALES</div>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);">
                            <span class="stat-number">${formatCurrency(reportData.ingresosTotales)}</span>
                            <div class="stat-label">INGRESOS TOTALES</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                        <div class="stat-card" style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);">
                            <span class="stat-number">${reportData.empresasUnicas}</span>
                            <div class="stat-label">EMPRESAS</div>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);">
                            <span class="stat-number">${reportData.instructoresUnicos}</span>
                            <div class="stat-label">INSTRUCTORES</div>
                        </div>
                    </div>
                    
                    <div class="section-title">📊 DETALLES DE CURSOS</div>
                    <table class="details-table">
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Clave STPS</th>
                                <th>Horas</th>
                                <th>Fecha</th>
                                <th>Instructor</th>
                                <th>Empresa</th>
                                <th>Precio</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredCursos.map(curso => `
                                <tr>
                                    <td><strong>${curso.nombre || 'Sin nombre'}</strong></td>
                                    <td>${curso.stps || 'N/A'}</td>
                                    <td>${curso.horas || 0}h</td>
                                    <td>${formatDate(curso.fecha)}</td>
                                    <td>${curso.instructor || 'No asignado'}</td>
                                    <td>${curso.empresa || 'Sin empresa'}</td>
                                    <td class="currency">${formatCurrency(curso.costo)}</td>
                                    <td>
                                        <span class="badge badge-${curso.status?.toLowerCase() || 'default'}">
                                            ${getStatusTexto(curso.status)}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="section-title">📈 ESTADÍSTICAS AVANZADAS</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            <strong>Promedio de horas por curso:</strong><br>
                            ${(reportData.horasTotales / reportData.totalCursos || 0).toFixed(1)} horas
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            <strong>Ingreso promedio por curso:</strong><br>
                            ${formatCurrency(reportData.ingresosTotales / reportData.totalCursos || 0)}
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            <strong>Ingreso por hora:</strong><br>
                            ${formatCurrency(reportData.ingresosTotales / reportData.horasTotales || 0)}
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            <strong>Eficiencia del programa:</strong><br>
                            ${((reportData.cursosFinalizados / reportData.totalCursos) * 100 || 0).toFixed(1)}%
                        </div>
                    </div>
                    
                    <div class="footer">
                        <strong>BEYCO Consultores - Sistema de Gestión de Cursos</strong><br>
                        Reporte generado el ${new Date().toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}<br>
                        ${filteredCursos.length} cursos mostrados de ${cursosFiltradosPorPeriodo.length} totales
                    </div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        showNotification('📄 PDF generado correctamente. Use los botones en la parte superior para imprimir o cerrar.', 'success');
    };

    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#cce7ff'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#004085'};
            padding: 15px 20px;
            border-radius: 8px;
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#b3d7ff'};
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 400px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 5000);
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
                        <div className={styles.periodFilter}>
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
                            <div className={styles.monthFilter}>
                                <label>Mes:</label>
                                <select 
                                    value={selectedMonth} 
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className={styles.monthSelect}
                                >
                                    {mesesDisponibles.map(mes => (
                                        <option key={mes.value} value={mes.value}>{mes.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.actionButtons}>
                            <button onClick={exportToExcel} className={styles.btnExport}>
                                📊 Exportar Excel
                            </button>
                            <button onClick={generatePDF} className={styles.btnReport}>
                                📄 Generar PDF
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
                        <span className={styles.statNumber}>{cursosFiltradosPorPeriodo.length}</span>
                        <p className={styles.statSubtitle}>
                            {selectedMonth === 'all' 
                                ? `Año ${selectedYear}` 
                                : `${meses.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
                            }
                        </p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Finalizados</h3>
                        <span className={styles.statNumber}>
                            {cursosFiltradosPorPeriodo.filter(c => c.status?.toLowerCase() === 'finalizado').length}
                        </span>
                        <p className={styles.statSubtitle}>Completados</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Activos</h3>
                        <span className={styles.statNumber}>
                            {cursosFiltradosPorPeriodo.filter(c => c.status?.toLowerCase() === 'activo').length}
                        </span>
                        <p className={styles.statSubtitle}>En progreso</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Programados</h3>
                        <span className={styles.statNumber}>
                            {cursosFiltradosPorPeriodo.filter(c => c.status?.toLowerCase() === 'programado').length}
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
                        Mostrando <strong>{filteredCursos.length}</strong> de <strong>{cursosFiltradosPorPeriodo.length}</strong> cursos 
                        {selectedMonth === 'all' 
                            ? ` para el año ${selectedYear}` 
                            : ` para ${meses.find(m => m.value === selectedMonth)?.label} de ${selectedYear}`
                        }
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