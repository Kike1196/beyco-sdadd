// app/secretaria/recibos/recibo/ReciboContent.js
'use client';

import { forwardRef } from 'react';

const ReciboContent = forwardRef(({ reciboData }, ref) => {
    const generarFolio = () => {
        const fecha = new Date();
        const timestamp = fecha.getTime().toString().slice(-6);
        return `HON-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${timestamp}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount || 0);
    };

    if (!reciboData) {
        return <div>No hay datos del recibo</div>;
    }

    return (
        <div ref={ref} style={styles.page}>
            {/* Encabezado COMPACTO */}
            <div style={styles.header}>
                <div style={styles.companyInfo}>
                    <div style={styles.companyLogo}>
                        <img 
                            src="/logo.jpg" 
                            alt="BEYCO Logo" 
                            style={styles.logo} 
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <div style={styles.companyText}>
                            <h1 style={styles.companyTitle}>BEYCO</h1>
                            <h2 style={styles.companySubtitle}>Consultores</h2>
                        </div>
                    </div>
                </div>
                <div style={styles.reciboInfo}>
                    <div style={styles.folio}>
                        <span style={styles.folioLabel}>Folio: </span>
                        <span style={styles.folioValue}>{generarFolio()}</span>
                    </div>
                    <div style={styles.fecha}>
                        <span style={styles.fechaLabel}>Fecha: </span>
                        <span style={styles.fechaValue}>
                            {new Date().toLocaleDateString('es-ES')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Título COMPACTO */}
            <div style={styles.title}>
                <h2 style={styles.titleText}>RECIBO DE HONORARIOS</h2>
            </div>

            {/* Información del Instructor COMPACTA */}
            <div style={styles.instructorSection}>
                <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                        <strong>Instructor:</strong>
                        <span>{reciboData.instructor?.instructorNombre}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <strong>Especialidad:</strong>
                        <span>{reciboData.instructor?.instructorEspecialidad}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <strong>Periodo:</strong>
                        <span>{reciboData.periodo}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <strong>Fechas:</strong>
                        <span>{new Date(reciboData.fechaInicio).toLocaleDateString('es-ES')} - {new Date(reciboData.fechaFin).toLocaleDateString('es-ES')}</span>
                    </div>
                </div>
            </div>

            {/* Tabla de Cursos COMPACTA */}
            <div style={styles.cursosSection}>
                <h3 style={styles.sectionTitle}>DETALLE DE CURSOS</h3>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Curso</th>
                                <th style={styles.th}>Fecha</th>
                                <th style={styles.th}>Horas</th>
                                <th style={styles.th}>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reciboData.cursos && reciboData.cursos.slice(0, 8).map((curso, index) => (
                                <tr key={index}>
                                    <td style={styles.td}>
                                        <div style={styles.cursoNombre}>{curso.cursoNombre}</div>
                                        {curso.stps && curso.stps !== 'N/A' && (
                                            <div style={styles.stps}>STPS: {curso.stps}</div>
                                        )}
                                    </td>
                                    <td style={{...styles.td, textAlign: 'center', fontSize: '8px'}}>
                                        {curso.fechaCurso ? 
                                            new Date(curso.fechaCurso).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit'}) : 
                                            'N/A'
                                        }
                                    </td>
                                    <td style={{...styles.td, textAlign: 'center', fontSize: '9px'}}>
                                        {curso.horasImpartidas || 0}h
                                    </td>
                                    <td style={{...styles.td, textAlign: 'right', fontWeight: 'bold', color: '#28a745', fontSize: '9px'}}>
                                        {formatCurrency(curso.monto)}
                                    </td>
                                </tr>
                            ))}
                            {/* Mensaje si hay más cursos de los que caben */}
                            {reciboData.cursos && reciboData.cursos.length > 8 && (
                                <tr>
                                    <td colSpan="4" style={{...styles.td, textAlign: 'center', fontSize: '8px', fontStyle: 'italic'}}>
                                        ... y {reciboData.cursos.length - 8} cursos más
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resumen COMPACTO */}
            <div style={styles.resumenSection}>
                <div style={styles.resumenGrid}>
                    <div style={styles.resumenItem}>
                        <span style={styles.resumenLabel}>Total Cursos:</span>
                        <strong style={styles.resumenValue}>{reciboData.totalCursos}</strong>
                    </div>
                    <div style={styles.resumenItem}>
                        <span style={styles.resumenLabel}>Total Horas:</span>
                        <strong style={styles.resumenValue}>{reciboData.totalHoras}h</strong>
                    </div>
                    <div style={styles.resumenItem}>
                        <span style={styles.resumenLabel}>Estado:</span>
                        <span style={styles.statusPendiente}>Pendiente</span>
                    </div>
                    <div style={styles.resumenTotal}>
                        <span style={styles.totalLabel}>TOTAL A PAGAR:</span>
                        <strong style={styles.totalAmount}>
                            {formatCurrency(reciboData.total)}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Observaciones COMPACTA */}
            <div style={styles.observaciones}>
                <p style={styles.observacionesText}>
                    <strong>Observaciones:</strong> Pago pendiente de procesar según contrato de servicios.
                </p>
            </div>

            {/* Firmas COMPACTAS */}
            <div style={styles.firmasSection}>
                <div style={styles.firma}>
                    <div style={styles.lineaFirma}></div>
                    <p style={styles.firmaNombre}>{reciboData.instructor?.instructorNombre}</p>
                    <p style={styles.firmaCargo}>Instructor</p>
                </div>
                <div style={styles.firma}>
                    <div style={styles.lineaFirma}></div>
                    <p style={styles.firmaNombre}>BEYCO Consultores</p>
                    <p style={styles.firmaCargo}>Secretaría Autorizada</p>
                </div>
            </div>

            {/* Footer COMPACTO */}
            <footer style={styles.footer}>
                <p style={styles.footerText}>BEYCO Consultores - Sistema de Gestión de Honorarios</p>
                <p style={styles.footerText}>Documento generado electrónicamente</p>
            </footer>
        </div>
    );
});

ReciboContent.displayName = 'ReciboContent';

// Estilos optimizados para UNA SOLA HOJA A4
const styles = {
    page: {
        width: '190mm', // Un poco menos del ancho A4 para márgenes
        minHeight: '277mm', // Un poco menos del alto A4
        margin: '10mm auto',
        padding: '0',
        backgroundColor: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: '#333',
        boxSizing: 'border-box',
        lineHeight: '1.2'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '5mm 8mm 3mm 8mm',
        backgroundColor: '#001f3f',
        color: 'white',
        height: '25mm'
    },
    companyLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: '4mm'
    },
    logo: {
        height: '15mm',
        borderRadius: '2mm'
    },
    companyText: {
        display: 'flex',
        flexDirection: 'column'
    },
    companyTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        margin: '0',
        color: 'white'
    },
    companySubtitle: {
        fontSize: '10px',
        color: '#28a745',
        margin: '1mm 0 0 0',
        fontWeight: '600'
    },
    reciboInfo: {
        textAlign: 'right'
    },
    folio: {
        marginBottom: '2mm'
    },
    fecha: {
        marginBottom: '2mm'
    },
    folioLabel: {
        fontWeight: '600',
        color: '#e0e0e0',
        fontSize: '8px'
    },
    fechaLabel: {
        fontWeight: '600',
        color: '#e0e0e0',
        fontSize: '8px'
    },
    folioValue: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: '9px'
    },
    fechaValue: {
        color: '#e0e0e0',
        fontSize: '8px'
    },
    title: {
        textAlign: 'center',
        padding: '2mm 8mm',
        backgroundColor: '#00264d',
        color: 'white',
        borderBottom: '1mm solid #28a745'
    },
    titleText: {
        fontSize: '12px',
        fontWeight: '700',
        margin: '0',
        textTransform: 'uppercase'
    },
    instructorSection: {
        padding: '3mm 8mm',
        backgroundColor: '#f8f9fa',
        borderBottom: '0.5mm solid #e9ecef'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2mm'
    },
    infoItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '1.5mm 2mm',
        backgroundColor: 'white',
        borderRadius: '1mm',
        borderLeft: '1mm solid #001f3f',
        fontSize: '8px'
    },
    cursosSection: {
        padding: '3mm 8mm',
        minHeight: '80mm'
    },
    sectionTitle: {
        color: '#001f3f',
        fontSize: '9px',
        marginBottom: '2mm',
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    tableContainer: {
        border: '0.5mm solid #e9ecef',
        borderRadius: '1mm',
        overflow: 'hidden'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '7px'
    },
    th: {
        backgroundColor: '#001f3f',
        color: 'white',
        padding: '1.5mm',
        textAlign: 'left',
        fontWeight: '600',
        border: '0.3mm solid #dee2e6',
        fontSize: '7px',
        textTransform: 'uppercase'
    },
    td: {
        padding: '1.5mm',
        border: '0.3mm solid #e9ecef',
        verticalAlign: 'top',
        backgroundColor: 'white'
    },
    cursoNombre: {
        fontWeight: '500',
        fontSize: '7px',
        lineHeight: '1.1'
    },
    stps: {
        fontSize: '6px',
        color: '#666',
        marginTop: '0.5mm'
    },
    resumenSection: {
        padding: '3mm 8mm',
        backgroundColor: '#f8f9fa',
        borderTop: '0.5mm solid #e9ecef'
    },
    resumenGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 2fr',
        gap: '2mm'
    },
    resumenItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2mm',
        backgroundColor: 'white',
        borderRadius: '1mm',
        textAlign: 'center',
        border: '0.3mm solid #e9ecef'
    },
    resumenTotal: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2mm',
        backgroundColor: '#001f3f',
        color: 'white',
        borderRadius: '1mm',
        textAlign: 'center'
    },
    resumenLabel: {
        color: '#666',
        fontSize: '7px',
        marginBottom: '1mm'
    },
    resumenValue: {
        color: '#001f3f',
        fontSize: '9px',
        fontWeight: '700'
    },
    totalLabel: {
        color: 'white',
        fontSize: '7px',
        marginBottom: '1mm',
        fontWeight: '600'
    },
    statusPendiente: {
        padding: '1mm 2mm',
        backgroundColor: '#fff3cd',
        color: '#856404',
        borderRadius: '8px',
        fontSize: '6px',
        fontWeight: '700',
        textTransform: 'uppercase',
        border: '0.3mm solid #ffd43b'
    },
    totalAmount: {
        fontSize: '11px',
        color: 'white'
    },
    observaciones: {
        padding: '2mm 8mm',
        backgroundColor: '#e7f3ff',
        borderTop: '0.5mm solid #b3d7ff'
    },
    observacionesText: {
        margin: '0',
        fontSize: '7px',
        color: '#333'
    },
    firmasSection: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10mm',
        padding: '5mm 8mm',
        borderTop: '0.5mm solid #e9ecef',
        backgroundColor: 'white'
    },
    firma: {
        textAlign: 'center',
        padding: '2mm'
    },
    lineaFirma: {
        width: '40mm',
        height: '0.3mm',
        backgroundColor: '#333',
        margin: '0 auto 2mm auto'
    },
    firmaNombre: {
        fontWeight: '600',
        color: '#001f3f',
        margin: '1mm 0 0.5mm 0',
        fontSize: '8px'
    },
    firmaCargo: {
        color: '#666',
        margin: '0',
        fontSize: '7px'
    },
    footer: {
        textAlign: 'center',
        padding: '2mm 8mm',
        backgroundColor: '#001f3f',
        color: 'white',
        borderTop: '0.5mm solid #28a745'
    },
    footerText: {
        margin: '0.5mm 0',
        fontSize: '6px',
        color: '#e0e0e0'
    }
};

export default ReciboContent;