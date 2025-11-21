// app/secretaria/recibos/recibo/page.js - VERSIÓN SIMPLIFICADA
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReciboContent from './ReciboContent';
import styles from './Recibo.module.css';

export default function ReciboPage() {
    const [reciboData, setReciboData] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const componentRef = useRef();
    const router = useRouter();

    useEffect(() => {
        const cargarDatosRecibo = () => {
            try {
                const data = localStorage.getItem('reciboHonorariosData');
                if (data) {
                    setReciboData(JSON.parse(data));
                } else {
                    setError('No se encontraron datos para generar el recibo.');
                }
            } catch (error) {
                setError('Error al cargar los datos del recibo: ' + error.message);
            } finally {
                setCargando(false);
            }
        };

        cargarDatosRecibo();
    }, []);

    // Función de impresión simple y directa
    const handlePrint = () => {
        if (!componentRef.current) {
            alert('Error: No se pudo cargar el recibo para imprimir');
            return;
        }

        const printWindow = window.open('', '_blank');
        const content = componentRef.current.innerHTML;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Recibo de Honorarios - ${reciboData?.instructor?.instructorNombre || 'Instructor'}</title>
                <meta charset="utf-8">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        background: white;
                        color: #333;
                        line-height: 1.2;
                        margin: 0;
                        padding: 0;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                            width: 210mm;
                            height: 297mm;
                        }
                        .recibo-page {
                            page-break-after: avoid;
                            page-break-inside: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                ${content}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => {
                            window.close();
                        }, 1000);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    };

    const volverARecibos = () => {
        router.push('/secretaria/recibos');
    };

    if (cargando) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.controls}>
                    <button onClick={volverARecibos} className={styles.btnAtras}>
                        ← Volver a Recibos
                    </button>
                </div>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando datos del recibo...</p>
                </div>
            </div>
        );
    }

    if (error && !reciboData) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.controls}>
                    <button onClick={volverARecibos} className={styles.btnAtras}>
                        ← Volver a Recibos
                    </button>
                </div>
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>❌</div>
                    <h3>Error al cargar el recibo</h3>
                    <p>{error}</p>
                    <button onClick={volverARecibos} className={styles.btnPrimario}>
                        Volver a Recibos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Recibo de Honorarios</h1>
                    <p>Comprobante de pago para instructores - Secretaría</p>
                </div>
                <div className={styles.logoSection}>
                    <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
                    <div className={styles.logoText}>
                        <span className={styles.logoTitle}></span>
                        <span className={styles.logoSubtitle}></span>
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.controls}>
                    <div className={styles.controlsLeft}>
                        <button onClick={volverARecibos} className={styles.btnAtras}>
                            ← Volver a Honorarios
                        </button>
                    </div>
                    <div className={styles.controlsRight}>
                        <button onClick={handlePrint} className={styles.btnImprimir}>
                            🖨️ Descargar PDF
                        </button>
                    </div>
                </div>

                <div className={styles.previewContainer}>
                    <div className={styles.previewNote}>
                        <p>💡 <strong>Vista previa del recibo</strong></p>
                    </div>
                    
                    {/* Área imprimible */}
                    <div ref={componentRef} className={styles.printableArea}>
                        <ReciboContent reciboData={reciboData} />
                    </div>
                </div>
            </main>
        </div>
    );
}