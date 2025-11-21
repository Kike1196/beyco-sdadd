// app/admin/honorarios/reporte-general/PrintReporte.js
'use client';

import { useEffect } from 'react';

export default function PrintReporte({ reporteData, onClose }) {
    useEffect(() => {
        // Imprimir automáticamente cuando el componente se monta
        window.print();
        
        // Cerrar la ventana después de imprimir (opcional)
        const afterPrint = () => {
            if (onClose) {
                setTimeout(onClose, 100);
            }
        };
        
        window.addEventListener('afterprint', afterPrint);
        return () => window.removeEventListener('afterprint', afterPrint);
    }, [onClose]);

    const generarFolio = () => {
        const fecha = new Date();
        const timestamp = fecha.getTime().toString().slice(-6);
        return `REP-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${timestamp}`;
    };

    const getDescripcionPeriodo = (periodo) => {
        switch (periodo) {
            case 'semanal': return 'Semanal';
            case 'quincenal': return 'Quincenal';
            case 'mensual': return 'Mensual';
            default: return 'Personalizado';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount || 0);
    };

    if (!reporteData) {
        return <div>No hay datos para imprimir</div>;
    }

    return (
        <div className="print-container">
            <style jsx>{`
                .print-container {
                    font-family: 'Arial', sans-serif;
                    max-width: 21cm;
                    margin: 0 auto;
                    padding: 1cm;
                    background: white;
                    color: black;
                }
                
                @media print {
                    body, html {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    
                    .print-container {
                        margin: 0 !important;
                        padding: 0.5cm !important;
                        box-shadow: none !important;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
                
                .reporte-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #001f3f;
                    color: white;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                
                .company-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .company-text h1 {
                    margin: 0;
                    font-size: 24px;
                    color: white;
                }
                
                .company-text h2 {
                    margin: 5px 0 0 0;
                    font-size: 16px;
                    color: #28a745;
                }
                
                .reporte-info {
                    text-align: right;
                }
                
                .folio, .fecha {
                    margin-bottom: 5px;
                }
                
                .reporte-title {
                    text-align: center;
                    background: #00264d;
                    color: white;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                
                .periodo-section {
                    background: #f8f9fa;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 5px;
                }
                
                .periodo-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }
                
                .periodo-item {
                    display: flex;
                    justify-content: space-between;
                    background: white;
                    padding: 10px;
                    border-left: 4px solid #001f3f;
                }
                
                .resumen-general {
                    margin-bottom: 20px;
                }
                
                .resumen-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .resumen-card {
                    background: white;
                    padding: 15px;
                    text-align: center;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                
                .resumen-total {
                    background: #001f3f;
                    color: white;
                }
                
                .resumen-number {
                    font-size: 18px;
                    font-weight: bold;
                    display: block;
                }
                
                .resumen-label {
                    font-size: 12px;
                    margin-top: 5px;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    font-size: 12px;
                }
                
                th {
                    background: #001f3f;
                    color: white;
                    padding: 8px;
                    text-align: left;
                    border: 1px solid #ddd;
                }
                
                td {
                    padding: 6px;
                    border: 1px solid #ddd;
                }
                
                .instructor-total {
                    font-weight: bold;
                    color: #28a745;
                    text-align: right;
                }
                
                .footer-total {
                    background: #f8f9fa;
                    font-weight: bold;
                }
                
                .firmas-section {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 20px;
                    margin-top: 30px;
                }
                
                .firma {
                    text-align: center;
                }
                
                .linea-firma {
                    width: 200px;
                    height: 1px;
                    background: #333;
                    margin: 0 auto 10px auto;
                }
                
                .reporte-footer {
                    text-align: center;
                    background: #001f3f;
                    color: white;
                    padding: 15px;
                    margin-top: 20px;
                }
            `}</style>

            {/* Encabezado del reporte */}
            <div className="reporte-header">
                <div className="company-info">
                    <div className="company-text">
                        <h1></h1>
                        <h2></h2>
                        <p>Reporte General de Honorarios</p>
                    </div>
                </div>
                <div className="reporte-info">
                    <div className="folio">
                        <strong>Folio:</strong> {generarFolio()}
                    </div>
                    <div className="fecha">
                        <strong>Fecha:</strong> {new Date().toLocaleDateString('es-ES')}
                    </div>
                </div>
            </div>

            {/* Título principal */}
            <div className="reporte-title">
                <h2>REPORTE GENERAL DE HONORARIOS</h2>
                <p>Resumen consolidado del período</p>
            </div>

            {/* Información del Período */}
            <div className="periodo-section">
                <div className="periodo-grid">
                    <div className="periodo-item">
                        <strong>Período:</strong>
                        <span>{getDescripcionPeriodo(reporteData.periodo)}</span>
                    </div>
                    <div className="periodo-item">
                        <strong>Fecha Inicio:</strong>
                        <span>{new Date(reporteData.fechaInicio).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="periodo-item">
                        <strong>Fecha Fin:</strong>
                        <span>{new Date(reporteData.fechaFin).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="periodo-item">
                        <strong>Total Instructores:</strong>
                        <span>{reporteData.instructores.length}</span>
                    </div>
                </div>
            </div>

            {/* Resumen General */}
            <div className="resumen-general">
                <h3>RESUMEN GENERAL</h3>
                <div className="resumen-grid">
                    <div className="resumen-card">
                        <span className="resumen-number">{reporteData.instructores.length}</span>
                        <span className="resumen-label">Instructores</span>
                    </div>
                    <div className="resumen-card">
                        <span className="resumen-number">{reporteData.totalCursosGeneral}</span>
                        <span className="resumen-label">Total Cursos</span>
                    </div>
                    <div className="resumen-card">
                        <span className="resumen-number">{reporteData.totalHorasGeneral}</span>
                        <span className="resumen-label">Horas Totales</span>
                    </div>
                    <div className="resumen-card resumen-total">
                        <span className="resumen-number">
                            {formatCurrency(reporteData.totalGeneral)}
                        </span>
                        <span className="resumen-label">Total a Pagar</span>
                    </div>
                </div>
            </div>

            {/* Tabla de Instructores */}
            <div className="instructores-section">
                <h3>DETALLE POR INSTRUCTOR</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Instructor</th>
                            <th>Email</th>
                            <th>Cursos</th>
                            <th>Horas</th>
                            <th>Total a Pagar</th>
                            <th>Promedio por Curso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reporteData.instructores.map((instructor, index) => {
                            const promedioCurso = instructor.totalCursos > 0 
                                ? instructor.totalPendiente / instructor.totalCursos 
                                : 0;
                            
                            return (
                                <tr key={instructor.numEmpleado}>
                                    <td>
                                        <strong>{instructor.nombre} {instructor.apellidoPaterno} {instructor.apellidoMaterno}</strong>
                                        <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                                            {instructor.especialidad}
                                        </div>
                                    </td>
                                    <td>{instructor.email}</td>
                                    <td style={{ textAlign: 'center' }}>{instructor.totalCursos}</td>
                                    <td style={{ textAlign: 'center' }}>{instructor.totalHoras}h</td>
                                    <td className="instructor-total">{formatCurrency(instructor.totalPendiente)}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(promedioCurso)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="footer-total">
                        <tr>
                            <td colSpan="2" style={{ textAlign: 'right' }}>
                                <strong>TOTALES GENERALES</strong>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <strong>{reporteData.totalCursosGeneral}</strong>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <strong>{reporteData.totalHorasGeneral}h</strong>
                            </td>
                            <td className="instructor-total">
                                <strong>{formatCurrency(reporteData.totalGeneral)}</strong>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <strong>
                                    {formatCurrency(
                                        reporteData.totalCursosGeneral > 0 
                                            ? reporteData.totalGeneral / reporteData.totalCursosGeneral 
                                            : 0
                                    )}
                                </strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Detalle de Cursos por Instructor */}
            <div className="detalle-cursos">
                <h3>DETALLE DE CURSOS POR INSTRUCTOR</h3>
                {reporteData.instructores.map((instructor, index) => (
                    <div key={instructor.numEmpleado} style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
                            <h4 style={{ margin: 0 }}>{instructor.nombre} {instructor.apellidoPaterno} {instructor.apellidoMaterno}</h4>
                            <span style={{ color: '#666', fontSize: '14px' }}>
                                {instructor.totalCursos} cursos • {instructor.totalHoras} horas • {formatCurrency(instructor.totalPendiente)}
                            </span>
                        </div>
                        
                        {instructor.cursos.length > 0 && (
                            <table style={{ fontSize: '11px' }}>
                                <thead>
                                    <tr>
                                        <th>Curso</th>
                                        <th>Fecha</th>
                                        <th>Empresa</th>
                                        <th>Lugar</th>
                                        <th>Horas</th>
                                        <th>Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {instructor.cursos.map((curso, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                {curso.cursoNombre}
                                                {curso.stps && <div style={{ fontSize: '10px', color: '#666' }}>{curso.stps}</div>}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {curso.fechaCurso ? new Date(curso.fechaCurso).toLocaleDateString('es-ES') : 'N/A'}
                                            </td>
                                            <td>{curso.empresaNombre}</td>
                                            <td>{curso.lugar}</td>
                                            <td style={{ textAlign: 'center' }}>{curso.horasImpartidas}h</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>
                                                {formatCurrency(curso.monto)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot style={{ background: '#e9ecef' }}>
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                            Total del Instructor:
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {instructor.totalHoras}h
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>
                                            {formatCurrency(instructor.totalPendiente)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>
                ))}
            </div>

            {/* Firmas */}
            <div className="firmas-section">
                <div className="firma">
                    <div className="linea-firma"></div>
                    <p style={{ fontWeight: 'bold', margin: '5px 0' }}>BEYCO Consultores</p>
                    <p style={{ color: '#666', margin: 0 }}>Representante Autorizado</p>
                </div>
                <div style={{ padding: '15px', background: '#e7f3ff', borderRadius: '5px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Observaciones</h4>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>• Este reporte incluye todos los cursos impartidos en el período especificado</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>• Los montos mostrados corresponden a los honorarios pendientes de pago</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>• El reporte fue generado automáticamente por el sistema</p>
                </div>
            </div>

            {/* Footer del Reporte */}
            <div className="reporte-footer">
                <p style={{ margin: '5px 0', fontSize: '12px' }}>BEYCO Consultores - Sistema de Gestión de Honorarios</p>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>Reporte generado electrónicamente el {new Date().toLocaleDateString('es-ES')}</p>
            </div>

            {/* Botón de cerrar (solo visible en pantalla) */}
            <div className="no-print" style={{ textAlign: 'center', marginTop: '20px' }}>
                <button 
                    onClick={onClose}
                    style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Cerrar Ventana
                </button>
            </div>
        </div>
    );
}