// app/secretaria/recibos/recibo/ReciboImprimible.js
'use client';

import { useEffect, useState } from 'react';
import './ReciboImprimible.css';

export default function ReciboImprimible() {
    const [reciboData, setReciboData] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem('reciboHonorariosData');
        if (data) {
            setReciboData(JSON.parse(data));
        }
    }, []);

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
        return <div>Cargando...</div>;
    }

    return (
        <div className="recibo-imprimible">
            {/* Encabezado del recibo */}
            <div className="recibo-header">
                <div className="company-info">
                    <div className="company-logo">
                        <img src="/logo.jpg" alt="BEYCO Logo" className="recibo-logo" />
                        <div className="company-text">
                            <h1>BEYCO</h1>
                            <h2>Consultores</h2>
                            <p>Capacitación y Consultoría Especializada</p>
                        </div>
                    </div>
                </div>
                <div className="recibo-info">
                    <div className="folio">
                        <span className="folio-label">Folio:</span>
                        <span className="folio-value">{generarFolio()}</span>
                    </div>
                    <div className="fecha">
                        <span className="fecha-label">Fecha:</span>
                        <span className="fecha-value">
                            {new Date().toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Título principal */}
            <div className="recibo-title">
                <h2>RECIBO DE HONORARIOS</h2>
            </div>

            {/* Información del Instructor */}
            <div className="instructor-section">
                <div className="info-grid">
                    <div className="info-item">
                        <strong>Instructor:</strong>
                        <span>{reciboData.instructor?.instructorNombre}</span>
                    </div>
                    <div className="info-item">
                        <strong>Especialidad:</strong>
                        <span>{reciboData.instructor?.instructorEspecialidad}</span>
                    </div>
                    <div className="info-item">
                        <strong>Email:</strong>
                        <span>{reciboData.instructor?.instructorEmail}</span>
                    </div>
                    <div className="info-item">
                        <strong>Periodo:</strong>
                        <span>{reciboData.periodo}</span>
                    </div>
                    <div className="info-item">
                        <strong>Del:</strong>
                        <span>{new Date(reciboData.fechaInicio).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="info-item">
                        <strong>Al:</strong>
                        <span>{new Date(reciboData.fechaFin).toLocaleDateString('es-ES')}</span>
                    </div>
                </div>
            </div>

            {/* Tabla de Cursos */}
            <div className="cursos-section">
                <h3>DETALLE DE CURSOS IMPARTIDOS</h3>
                <div className="table-container">
                    <table className="cursos-table">
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Fecha</th>
                                <th>Empresa</th>
                                <th>Horas</th>
                                <th>Honorarios</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reciboData.cursos && reciboData.cursos.map((curso, index) => (
                                <tr key={index}>
                                    <td className="curso-nombre">
                                        {curso.cursoNombre}
                                        {curso.stps && curso.stps !== 'N/A' && (
                                            <div className="stps">STPS: {curso.stps}</div>
                                        )}
                                    </td>
                                    <td className="curso-fecha">
                                        {curso.fechaCurso ? 
                                            new Date(curso.fechaCurso).toLocaleDateString('es-ES') : 
                                            'N/A'
                                        }
                                    </td>
                                    <td className="curso-empresa">
                                        {curso.empresaNombre}
                                    </td>
                                    <td className="curso-horas">
                                        {curso.horasImpartidas || 0}h
                                    </td>
                                    <td className="curso-monto">
                                        {formatCurrency(curso.monto)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resumen de Pago */}
            <div className="resumen-section">
                <div className="resumen-grid">
                    <div className="resumen-item">
                        <span>Total Cursos:</span>
                        <strong>{reciboData.totalCursos}</strong>
                    </div>
                    <div className="resumen-item">
                        <span>Total Horas:</span>
                        <strong>{reciboData.totalHoras}h</strong>
                    </div>
                    <div className="resumen-item">
                        <span>Estado:</span>
                        <span className="status pendiente">Pendiente de Pago</span>
                    </div>
                    <div className="resumen-item total">
                        <span>TOTAL A PAGAR:</span>
                        <strong className="total-amount">
                            {formatCurrency(reciboData.total)}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Observaciones */}
            <div className="observaciones">
                <p><strong>Observaciones:</strong> El pago está pendiente de procesar. Se realizará de acuerdo al periodo establecido en el contrato de servicios.</p>
            </div>

            {/* Firmas */}
            <div className="firmas-section">
                <div className="firma">
                    <div className="linea-firma"></div>
                    <p className="firma-nombre">
                        {reciboData.instructor?.instructorNombre}
                    </p>
                    <p className="firma-cargo">Instructor</p>
                </div>
                <div className="firma">
                    <div className="linea-firma"></div>
                    <p className="firma-nombre">BEYCO Consultores</p>
                    <p className="firma-cargo">Secretaría Autorizada</p>
                </div>
            </div>

            {/* Footer del Recibo */}
            <footer className="recibo-footer">
                <p>BEYCO Consultores - Sistema de Gestión de Honorarios</p>
                <p>Documento generado electrónicamente el {new Date().toLocaleDateString('es-ES')}</p>
            </footer>
        </div>
    );
}