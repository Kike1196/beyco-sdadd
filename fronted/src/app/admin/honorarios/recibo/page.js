// app/admin/honorarios/recibo/page.js - VERSIÓN COMPLETA CORREGIDA
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Recibo.module.css';

// Componente de impresión separado para el recibo
const PrintRecibo = ({ reciboData, onClose }) => {
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
        return `REC-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${timestamp}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount || 0);
    };

    if (!reciboData) {
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
                
                .recibo-header {
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
                
                .company-text p {
                    margin: 2px 0 0 0;
                    font-size: 12px;
                    color: #e0e0e0;
                }
                
                .recibo-info {
                    text-align: right;
                }
                
                .folio, .fecha {
                    margin-bottom: 5px;
                    font-size: 14px;
                }
                
                .recibo-title {
                    text-align: center;
                    background: #00264d;
                    color: white;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                
                .recibo-title h2 {
                    margin: 0;
                    font-size: 20px;
                }
                
                .instructor-info {
                    background: #f8f9fa;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 5px;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    background: white;
                    padding: 10px;
                    border-left: 4px solid #001f3f;
                    font-size: 14px;
                }
                
                .cursos-section {
                    margin-bottom: 20px;
                }
                
                .cursos-section h3 {
                    margin: 0 0 15px 0;
                    color: #001f3f;
                    font-size: 16px;
                    text-align: center;
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
                
                .curso-nombre {
                    font-weight: 500;
                }
                
                .curso-fecha, .curso-horas {
                    text-align: center;
                }
                
                .curso-monto {
                    text-align: right;
                    font-weight: bold;
                    color: #28a745;
                }
                
                .status {
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: bold;
                    text-transform: uppercase;
                    display: inline-block;
                    text-align: center;
                }
                
                .pendiente {
                    background: #fff3cd;
                    color: #856404;
                }
                
                .resumen-section {
                    background: #f8f9fa;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 5px;
                }
                
                .resumen-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }
                
                .resumen-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 10px;
                    background: white;
                    border-radius: 5px;
                    text-align: center;
                }
                
                .resumen-total {
                    background: #001f3f;
                    color: white;
                    grid-column: 1 / -1;
                }
                
                .total-amount {
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .observaciones {
                    background: #e7f3ff;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 5px;
                    font-size: 14px;
                }
                
                .firmas-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-top: 30px;
                }
                
                .firma {
                    text-align: center;
                }
                
                .linea-firma {
                    width: 150px;
                    height: 1px;
                    background: #333;
                    margin: 0 auto 10px auto;
                }
                
                .recibo-footer {
                    text-align: center;
                    background: #001f3f;
                    color: white;
                    padding: 15px;
                    margin-top: 20px;
                }
                
                .btn-cerrar {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .btn-cerrar:hover {
                    background: #c82333;
                }
            `}</style>

            {/* Encabezado del recibo */}
            <div className="recibo-header">
                <div className="company-info">
                    <div className="company-text">
                        <h1>BEYCO</h1>
                        <h2>Consultores</h2>
                        <p>Recibo de Honorarios</p>
                    </div>
                </div>
                <div className="recibo-info">
                    <div className="folio">
                        <strong>Folio:</strong> {generarFolio()}
                    </div>
                    <div className="fecha">
                        <strong>Fecha:</strong> {new Date().toLocaleDateString('es-ES')}
                    </div>
                </div>
            </div>

            {/* Título principal */}
            <div className="recibo-title">
                <h2>RECIBO DE HONORARIOS</h2>
            </div>

            {/* Información del Instructor */}
            <div className="instructor-info">
                <div className="info-grid">
                    <div className="info-item">
                        <strong>Instructor:</strong>
                        <span>{reciboData.instructor?.instructorNombre || reciboData.instructor?.nombre}</span>
                    </div>
                    <div className="info-item">
                        <strong>Periodo:</strong>
                        <span>{reciboData.periodo}</span>
                    </div>
                    {reciboData.fechaInicio && reciboData.fechaFin && (
                        <>
                            <div className="info-item">
                                <strong>Del:</strong>
                                <span>{new Date(reciboData.fechaInicio).toLocaleDateString('es-ES')}</span>
                            </div>
                            <div className="info-item">
                                <strong>Al:</strong>
                                <span>{new Date(reciboData.fechaFin).toLocaleDateString('es-ES')}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Tabla de Cursos */}
            <div className="cursos-section">
                <h3>DETALLE DE CURSOS</h3>
                <table>
                    <thead>
                        <tr>
                            <th width="45%">Curso</th>
                            <th width="15%">Fecha</th>
                            <th width="10%">Horas</th>
                            <th width="20%">Monto</th>
                            <th width="10%">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reciboData.cursos && reciboData.cursos.map((curso, index) => (
                            <tr key={index}>
                                <td className="curso-nombre">
                                    {curso.cursoNombre || curso.nombre || 'Curso no especificado'}
                                </td>
                                <td className="curso-fecha">
                                    {curso.fechaCurso ? new Date(curso.fechaCurso).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 
                                     curso.fecha ? new Date(curso.fecha).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 'N/A'}
                                </td>
                                <td className="curso-horas">{curso.horasImpartidas || curso.horas || 0}</td>
                                <td className="curso-monto">
                                    {formatCurrency(curso.monto || curso.precio || 0)}
                                </td>
                                <td>
                                    <span className="status pendiente">
                                        {curso.estatus || 'pendiente'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Resumen de Pago */}
            <div className="resumen-section">
                <div className="resumen-grid">
                    <div className="resumen-item">
                        <span>Total Horas:</span>
                        <strong>{reciboData.cursos?.reduce((sum, curso) => sum + (curso.horasImpartidas || curso.horas || 0), 0) || 0}h</strong>
                    </div>
                    <div className="resumen-item">
                        <span>Total Cursos:</span>
                        <strong>{reciboData.cursos?.length || 0}</strong>
                    </div>
                    <div className="resumen-item">
                        <span>Estado:</span>
                        <span className="status pendiente">Pendiente</span>
                    </div>
                    <div className="resumen-item resumen-total">
                        <span>TOTAL A PAGAR:</span>
                        <strong className="total-amount">
                            {formatCurrency(reciboData.total || 0)}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Observaciones */}
            <div className="observaciones">
                <p><strong>Observaciones:</strong> El pago está pendiente de procesar. Se realizará de acuerdo al periodo establecido.</p>
            </div>

            {/* Firmas */}
            <div className="firmas-section">
                <div className="firma">
                    <div className="linea-firma"></div>
                    <p style={{ fontWeight: 'bold', margin: '5px 0' }}>
                        {reciboData.instructor?.instructorNombre || reciboData.instructor?.nombre}
                    </p>
                    <p style={{ color: '#666', margin: 0 }}>Instructor</p>
                </div>
                <div className="firma">
                    <div className="linea-firma"></div>
                    <p style={{ fontWeight: 'bold', margin: '5px 0' }}>BEYCO Consultores</p>
                    <p style={{ color: '#666', margin: 0 }}>Representante Autorizado</p>
                </div>
            </div>

            {/* Footer del Recibo */}
            <div className="recibo-footer">
                <p style={{ margin: '5px 0', fontSize: '12px' }}>BEYCO Consultores - Sistema de Gestión de Honorarios</p>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>Documento generado electrónicamente</p>
            </div>

            {/* Botón de cerrar (solo visible en pantalla) */}
            <div className="no-print" style={{ textAlign: 'center', marginTop: '20px' }}>
                <button 
                    onClick={onClose}
                    className="btn-cerrar"
                >
                    Cerrar Ventana
                </button>
            </div>
        </div>
    );
};

// Componente principal de la página
export default function ReciboPage() {
    const [reciboData, setReciboData] = useState(null);
    const [mostrarImpresion, setMostrarImpresion] = useState(false);
    const [cargando, setCargando] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const data = localStorage.getItem('reciboData');
        if (data) {
            const parsedData = JSON.parse(data);
            console.log('📄 Datos del recibo:', parsedData);
            setReciboData(parsedData);
        } else {
            console.log('❌ No hay datos de recibo en localStorage');
            router.push('/admin/honorarios');
        }
        setCargando(false);
    }, [router]);

    const imprimirRecibo = () => {
        setMostrarImpresion(true);
    };

    const generarFolio = () => {
        const fecha = new Date();
        const timestamp = fecha.getTime().toString().slice(-6);
        return `REC-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${timestamp}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount || 0);
    };

    if (cargando) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.controls}>
                    <button onClick={() => router.push('/admin/honorarios')} className={styles.btnAtras}>
                        ← Atrás
                    </button>
                </div>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando datos del recibo...</p>
                </div>
            </div>
        );
    }

    if (!reciboData) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.controls}>
                    <button onClick={() => router.push('/admin/honorarios')} className={styles.btnAtras}>
                        ← Atrás
                    </button>
                </div>
                <div className={styles.errorContainer}>
                    <h2>❌ Error al cargar el recibo</h2>
                    <p>No se encontraron datos para generar el recibo.</p>
                    <button onClick={() => router.push('/admin/honorarios')} className={styles.btnPrimario}>
                        Volver a Honorarios
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Header con azul oscuro */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Recibo de Honorarios</h1>
                    <p>Comprobante de pago para instructores</p>
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
                {/* Controles */}
                <div className={styles.controls}>
                    <div className={styles.controlsLeft}>
                        <button onClick={() => router.push('/admin/honorarios')} className={styles.btnAtras}>
                            ← Volver a Honorarios
                        </button>
                    </div>
                    <div className={styles.controlsRight}>
                        <button onClick={imprimirRecibo} className={styles.btnImprimir}>
                            🖨️ Imprimir Recibo
                        </button>
                    </div>
                </div>

                {/* Vista previa del recibo */}
                <div className={styles.reciboContainer}>
                    <div className={styles.recibo}>
                        {/* Encabezado del recibo */}
                        <div className={styles.reciboHeader}>
                            <div className={styles.companyInfo}>
                                <div className={styles.companyLogo}>
                                    <img src="/logo.jpg" alt="BEYCO Logo" className={styles.reciboLogo} />
                                    <div className={styles.companyText}>
                                        <h1>BEYCO</h1>
                                        <h2>Consultores</h2>
                                        <p>Recibo de Honorarios</p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.reciboInfo}>
                                <div className={styles.folio}>
                                    <span className={styles.folioLabel}>Folio:</span>
                                    <span className={styles.folioValue}>{generarFolio()}</span>
                                </div>
                                <div className={styles.fecha}>
                                    <span className={styles.fechaLabel}>Fecha:</span>
                                    <span className={styles.fechaValue}>{new Date().toLocaleDateString('es-ES')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Título principal */}
                        <div className={styles.reciboTitle}>
                            <h2>RECIBO DE HONORARIOS</h2>
                        </div>

                        {/* Información del Instructor */}
                        <div className={styles.instructorInfo}>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <strong>Instructor:</strong>
                                    <span>{reciboData.instructor?.instructorNombre || reciboData.instructor?.nombre}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <strong>Periodo:</strong>
                                    <span>{reciboData.periodo}</span>
                                </div>
                                {reciboData.fechaInicio && reciboData.fechaFin && (
                                    <>
                                        <div className={styles.infoItem}>
                                            <strong>Del:</strong>
                                            <span>{new Date(reciboData.fechaInicio).toLocaleDateString('es-ES')}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <strong>Al:</strong>
                                            <span>{new Date(reciboData.fechaFin).toLocaleDateString('es-ES')}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ margin: 0, color: '#666' }}>
                                Este es una vista previa del recibo. Haz clic en "Imprimir Recibo" para generar la versión imprimible.
                            </p>
                            <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', color: '#001f3f' }}>
                                Total a Pagar: {formatCurrency(reciboData.total || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modal de impresión */}
                {mostrarImpresion && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'white',
                        zIndex: 9999,
                        overflow: 'auto'
                    }}>
                        <PrintRecibo 
                            reciboData={reciboData}
                            onClose={() => setMostrarImpresion(false)}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}