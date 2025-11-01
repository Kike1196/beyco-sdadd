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
        return `#${Math.floor(10000 + Math.random() * 90000)}`;
    };

    if (!reciboData) {
        return (
            <div className={styles.container}>
                <div className={styles.controls}>
                    <button onClick={() => router.push('/admin/honorarios')} className={styles.backButton}>
                        ← Atrás
                    </button>
                </div>
                <div className={styles.loading}>
                    <p>Cargando datos del recibo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Controles */}
            <div className={styles.controls}>
                <button onClick={() => router.push('/admin/honorarios')} className={styles.backButton}>
                    ← Atrás
                </button>
                <button onClick={imprimirRecibo} className={styles.printButton}>
                    🖨️ Imprimir Recibo
                </button>
            </div>

            {/* Recibo */}
            <div className={styles.recibo}>
                <header className={styles.reciboHeader}>
                    <h1>#BEYCO</h1>
                    <h2>Consultores</h2>
                </header>

                <div className={styles.reciboTitle}>
                    <h2>Recibo de Pago</h2>
                </div>

                <div className={styles.reciboInfo}>
                    <div className={styles.leftColumn}>
                        <p><strong>Folio:</strong> {generarFolio()}</p>
                        <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                        <p><strong>Instructor:</strong> {reciboData.instructor?.instructorNombre || reciboData.instructor?.nombre}</p>
                        <p><strong>Periodo:</strong> {reciboData.periodo}</p>
                        {reciboData.fechaInicio && reciboData.fechaFin && (
                            <p><strong>Del:</strong> {reciboData.fechaInicio} <strong>al:</strong> {reciboData.fechaFin}</p>
                        )}
                    </div>
                </div>

                {/* Tabla de Cursos - CORREGIDA */}
                <div className={styles.cursosSection}>
                    <h3>Detalle de Cursos</h3>
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
                            {reciboData.cursos && reciboData.cursos.map((curso, index) => (
                                <tr key={index}>
                                    <td className={styles.cursoNombre}>{curso.cursoNombre || curso.nombre || 'Curso no especificado'}</td>
                                    <td className={styles.cursoFecha}>
                                        {curso.fechaCurso ? new Date(curso.fechaCurso).toLocaleDateString() : 
                                         curso.fecha ? new Date(curso.fecha).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className={styles.cursoHoras}>{curso.horasImpartidas || curso.horas || 0}</td>
                                    <td className={styles.cursoMonto}>${parseFloat(curso.monto || curso.precio || 0).toFixed(2)}</td>
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

                {/* Resumen de Pago */}
                <div className={styles.resumenPago}>
                    <table className={styles.resumenTable}>
                        <tbody>
                            <tr>
                                <td><strong>Concepto</strong></td>
                                <td>Honorarios por instrucción</td>
                            </tr>
                            <tr>
                                <td><strong>Estatus</strong></td>
                                <td>
                                    <span className={`${styles.status} ${styles.pendiente}`}>
                                        Pendiente
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Total a Pagar</strong></td>
                                <td className={styles.totalAmount}>${parseFloat(reciboData.total || 0).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Observaciones */}
                <div className={styles.observaciones}>
                    <h4>Observaciones:</h4>
                    <p>El pago está pendiente de procesar. Se realizará de acuerdo al periodo establecido.</p>
                </div>

                {/* Firmas */}
                <div className={styles.firmas}>
                    <div className={styles.firma}>
                        <div className={styles.lineaFirma}></div>
                        <p>Instructor</p>
                        <p>{reciboData.instructor?.instructorNombre || reciboData.instructor?.nombre}</p>
                    </div>
                    <div className={styles.firma}>
                        <div className={styles.lineaFirma}></div>
                        <p>Representante BEYCO</p>
                        <p>Administración</p>
                    </div>
                </div>
            </div>
        </div>
    );
}