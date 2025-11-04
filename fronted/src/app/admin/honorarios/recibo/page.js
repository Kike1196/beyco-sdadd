// app/admin/honorarios/recibo/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Recibo.module.css';

export default function ReciboPage() {
    const [reciboData, setReciboData] = useState(null);
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
    }, [router]);

    const imprimirRecibo = () => {
        window.print();
    };

    const generarFolio = () => {
        const fecha = new Date();
        const timestamp = fecha.getTime().toString().slice(-6);
        return `REC-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${timestamp}`;
    };

    if (!reciboData) {
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
                {/* Controles - Se ocultan al imprimir */}
                <div className={`${styles.controls} ${styles.noPrint}`}>
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

                {/* Recibo - Optimizado para una sola hoja */}
                <div className={styles.reciboContainer}>
                    <div className={styles.recibo}>
                        {/* Encabezado del recibo con azul oscuro */}
                        <div className={styles.reciboHeader}>
                            <div className={styles.companyInfo}>
                                <div className={styles.companyLogo}>
                                    <img src="/logo.jpg" alt="BEYCO Logo" className={styles.reciboLogo} />
                                    <div className={styles.companyText}>
                                        <h1>BEYCO</h1>
                                        <h2>Consultores</h2>
                                        <p>Capacitación y Consultoría Especializada</p>
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
                                    <span className={styles.fechaValue}>{new Date().toLocaleDateString('es-ES', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Título principal con azul oscuro */}
                        <div className={styles.reciboTitle}>
                            <h2>RECIBO DE HONORARIOS</h2>
                        </div>

                        {/* Información del Instructor - COMPACTA */}
                        <div className={styles.instructorSection}>
                            <div className={styles.infoGridCompact}>
                                <div className={styles.infoItemCompact}>
                                    <strong>Instructor:</strong>
                                    <span>{reciboData.instructor?.instructorNombre || reciboData.instructor?.nombre}</span>
                                </div>
                                <div className={styles.infoItemCompact}>
                                    <strong>Periodo:</strong>
                                    <span>{reciboData.periodo}</span>
                                </div>
                                {reciboData.fechaInicio && reciboData.fechaFin && (
                                    <>
                                        <div className={styles.infoItemCompact}>
                                            <strong>Del:</strong>
                                            <span>{reciboData.fechaInicio}</span>
                                        </div>
                                        <div className={styles.infoItemCompact}>
                                            <strong>Al:</strong>
                                            <span>{reciboData.fechaFin}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Tabla de Cursos - COMPACTA */}
                        <div className={styles.cursosSection}>
                            <h3>DETALLE DE CURSOS</h3>
                            <div className={styles.tableContainer}>
                                <table className={styles.cursosTable}>
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
                                                <td className={styles.cursoNombre}>
                                                    {curso.cursoNombre || curso.nombre || 'Curso no especificado'}
                                                </td>
                                                <td className={styles.cursoFecha}>
                                                    {curso.fechaCurso ? new Date(curso.fechaCurso).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 
                                                     curso.fecha ? new Date(curso.fecha).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 'N/A'}
                                                </td>
                                                <td className={styles.cursoHoras}>{curso.horasImpartidas || curso.horas || 0}</td>
                                                <td className={styles.cursoMonto}>
                                                    ${parseFloat(curso.monto || curso.precio || 0).toFixed(2)}
                                                </td>
                                                <td>
                                                    <span className={`${styles.status} ${styles.pendiente}`}>
                                                        {curso.estatus || 'pendiente'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Resumen de Pago - COMPACTO */}
                        <div className={styles.resumenSection}>
                            <div className={styles.resumenGridCompact}>
                                <div className={styles.resumenItemCompact}>
                                    <span>Total Horas:</span>
                                    <strong>{reciboData.cursos?.reduce((sum, curso) => sum + (curso.horasImpartidas || curso.horas || 0), 0) || 0}h</strong>
                                </div>
                                <div className={styles.resumenItemCompact}>
                                    <span>Total Cursos:</span>
                                    <strong>{reciboData.cursos?.length || 0}</strong>
                                </div>
                                <div className={styles.resumenItemCompact}>
                                    <span>Estado:</span>
                                    <span className={`${styles.status} ${styles.pendiente}`}>Pendiente</span>
                                </div>
                                <div className={`${styles.resumenItemCompact} ${styles.totalCompact}`}>
                                    <span>TOTAL A PAGAR:</span>
                                    <strong className={styles.totalAmountCompact}>
                                        ${parseFloat(reciboData.total || 0).toFixed(2)}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* Observaciones COMPACTAS */}
                        <div className={styles.observaciones}>
                            <p><strong>Observaciones:</strong> El pago está pendiente de procesar. Se realizará de acuerdo al periodo establecido.</p>
                        </div>

                        {/* Firmas COMPACTAS */}
                        <div className={styles.firmasSection}>
                            <div className={styles.firmaCompact}>
                                <div className={styles.lineaFirma}></div>
                                <p className={styles.firmaNombre}>
                                    {reciboData.instructor?.instructorNombre || reciboData.instructor?.nombre}
                                </p>
                                <p className={styles.firmaCargo}>Instructor</p>
                            </div>
                            <div className={styles.firmaCompact}>
                                <div className={styles.lineaFirma}></div>
                                <p className={styles.firmaNombre}>BEYCO Consultores</p>
                                <p className={styles.firmaCargo}>Representante Autorizado</p>
                            </div>
                        </div>

                        {/* Footer del Recibo */}
                        <footer className={styles.reciboFooter}>
                            <p>BEYCO Consultores - Sistema de Gestión de Honorarios</p>
                            <p>Documento generado electrónicamente</p>
                        </footer>
                    </div>
                </div>
            </main>
        </div>
    );
}