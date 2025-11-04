'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Recibos.module.css';

export default function Recibos() {
    const router = useRouter();
    const [paymentData, setPaymentData] = useState({
        alumno: '',
        monto: '',
        concepto: '',
        fecha: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenerateReceipt = (e) => {
        e.preventDefault();
        // Lógica para generar recibo
        alert('Recibo generado exitosamente');
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <button 
                        onClick={() => router.push('/secretaria')}
                        className={styles.backButton}
                    >
                        ← Volver al Dashboard
                    </button>
                    <div className={styles.titleSection}>
                        <h1>🧾 Gestión de Recibos</h1>
                        <p>Administra recibos de pago y facturación</p>
                    </div>
                    <div className={styles.logoSection}>
                        <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.contentGrid}>
                    <div className={styles.formSection}>
                        <h2>Generar Nuevo Recibo</h2>
                        <form onSubmit={handleGenerateReceipt} className={styles.receiptForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="alumno">Alumno</label>
                                <select
                                    id="alumno"
                                    name="alumno"
                                    value={paymentData.alumno}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione un alumno</option>
                                    <option value="juan-perez">Juan Pérez</option>
                                    <option value="maria-garcia">María García</option>
                                    <option value="carlos-lopez">Carlos López</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="monto">Monto ($)</label>
                                <input
                                    type="number"
                                    id="monto"
                                    name="monto"
                                    value={paymentData.monto}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="concepto">Concepto</label>
                                <select
                                    id="concepto"
                                    name="concepto"
                                    value={paymentData.concepto}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione concepto</option>
                                    <option value="matricula">Matrícula</option>
                                    <option value="mensualidad">Mensualidad</option>
                                    <option value="examen">Examen</option>
                                    <option value="material">Material</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="fecha">Fecha de Pago</label>
                                <input
                                    type="date"
                                    id="fecha"
                                    name="fecha"
                                    value={paymentData.fecha}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.generateButton}>
                                Generar Recibo
                            </button>
                        </form>
                    </div>

                    <div className={styles.statsSection}>
                        <h3>Resumen Financiero</h3>
                        <div className={styles.financialStats}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>$12,450</span>
                                <span className={styles.statLabel}>Ingresos del Mes</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>45</span>
                                <span className={styles.statLabel}>Pagos Pendientes</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>89%</span>
                                <span className={styles.statLabel}>Tasa de Cobranza</span>
                            </div>
                        </div>

                        <div className={styles.recentReceipts}>
                            <h4>Recibos Recientes</h4>
                            <div className={styles.receiptsList}>
                                <div className={styles.receiptItem}>
                                    <div className={styles.receiptInfo}>
                                        <strong>Recibo #2456</strong>
                                        <span>Juan Pérez - $250</span>
                                    </div>
                                    <span className={styles.receiptDate}>Hoy</span>
                                </div>
                                <div className={styles.receiptItem}>
                                    <div className={styles.receiptInfo}>
                                        <strong>Recibo #2455</strong>
                                        <span>María García - $300</span>
                                    </div>
                                    <span className={styles.receiptDate}>Ayer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}