// app/instructor/honorarios/page.js - PÁGINA INDEPENDIENTE DE HONORARIOS
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Honorarios.module.css';

// Componente de Notificación
const NotificationToast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icon = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

    return (
        <div className={`${styles.notification} ${styles[type]}`}>
            <span className={styles.notificationIcon}>{icon[type]}</span>
            <span className={styles.notificationMessage}>{message}</span>
            <button onClick={onClose} className={styles.notificationClose}>×</button>
            <div className={styles.notificationProgress}></div>
        </div>
    );
};

export default function HonorariosPage() {
    const [honorarios, setHonorarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const router = useRouter();

    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
    };
    
    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    const getUserData = () => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            return userData;
        } catch (error) {
            console.error('Error obteniendo datos del usuario:', error);
            return null;
        }
    };

    const cargarDatos = async () => {
        try {
            const userData = getUserData();
            if (!userData) {
                router.push('/');
                return;
            }

            // Simular carga de honorarios
            setTimeout(() => {
                setHonorarios([
                    { 
                        id: 1, 
                        mes: 'Octubre 2025', 
                        cursos: 3, 
                        total: 15000, 
                        estatus: 'Pagado',
                        fechaPago: '2025-11-05',
                        detalles: [
                            { curso: 'Seguridad Industrial', horas: 8, monto: 5000 },
                            { curso: 'Trabajos en Alturas', horas: 16, monto: 8000 },
                            { curso: 'Manejo de Residuos', horas: 4, monto: 2000 }
                        ]
                    },
                    { 
                        id: 2, 
                        mes: 'Septiembre 2025', 
                        cursos: 2, 
                        total: 10000, 
                        estatus: 'Pagado',
                        fechaPago: '2025-10-05',
                        detalles: [
                            { curso: 'Seguridad Industrial', horas: 8, monto: 5000 },
                            { curso: 'Espacios Confinados', horas: 8, monto: 5000 }
                        ]
                    },
                    { 
                        id: 3, 
                        mes: 'Agosto 2025', 
                        cursos: 4, 
                        total: 20000, 
                        estatus: 'Pagado',
                        fechaPago: '2025-09-05',
                        detalles: [
                            { curso: 'Seguridad Industrial', horas: 16, monto: 10000 },
                            { curso: 'Trabajos en Alturas', horas: 8, monto: 4000 },
                            { curso: 'Manejo de Residuos', horas: 8, monto: 4000 },
                            { curso: 'Primeros Auxilios', horas: 4, monto: 2000 }
                        ]
                    }
                ]);
                setLoading(false);
            }, 1000);
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            setLoading(false);
        }
    };

    const [detalleExpandido, setDetalleExpandido] = useState(null);

    const toggleDetalle = (id) => {
        setDetalleExpandido(detalleExpandido === id ? null : id);
    };

    // Función para formatear números solo en el cliente
    const formatNumber = (number) => {
        if (!mounted) return number.toString(); // Durante SSR, retorna string simple
        return number.toLocaleString('es-MX');
    };

    useEffect(() => {
        setMounted(true);
        cargarDatos();
    }, []);

    const totalEsteMes = 15000;
    const cursosEsteMes = 3;
    const proximoPago = '30 Nov 2025';

    return (
        <div className={styles.pageContainer}>
            {/* Notificaciones */}
            {notification.show && (
                <NotificationToast 
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Mis Honorarios</h1>
                    <p>Consulta tus pagos y estados de cuenta</p>
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

                {/* Resumen de honorarios */}
                <div className={styles.resumenHonorarios}>
                    <div className={styles.tarjetaEstadistica}>
                        <h3>Total Este Mes</h3>
                        <div className={styles.numero}>${formatNumber(totalEsteMes)}</div>
                    </div>
                    <div className={styles.tarjetaEstadistica}>
                        <h3>Cursos Este Mes</h3>
                        <div className={styles.numero}>{formatNumber(cursosEsteMes)}</div>
                    </div>
                    <div className={styles.tarjetaEstadistica}>
                        <h3>Próximo Pago</h3>
                        <div className={styles.numero}>{proximoPago}</div>
                    </div>
                </div>

                {/* Historial de honorarios */}
                <div className={styles.tableContainer}>
                    <div className={styles.tableHeader}>
                        <h3>Historial de Honorarios</h3>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Cargando honorarios...</p>
                        </div>
                    ) : (
                        <table className={styles.cursosTable}>
                            <thead>
                                <tr>
                                    <th>Mes</th>
                                    <th>Cursos Impartidos</th>
                                    <th>Total Honorarios</th>
                                    <th>Fecha de Pago</th>
                                    <th>Estatus</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {honorarios.map(honorario => (
                                    <React.Fragment key={honorario.id}>
                                        <tr>
                                            <td>
                                                <strong>{honorario.mes}</strong>
                                            </td>
                                            <td>{honorario.cursos} cursos</td>
                                            <td>${formatNumber(honorario.total)}</td>
                                            <td>{new Date(honorario.fechaPago).toLocaleDateString('es-ES')}</td>
                                            <td>
                                                <span className={`${styles.status} ${styles[honorario.estatus.toLowerCase()]}`}>
                                                    {honorario.estatus}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className={styles.btnInscribir}
                                                    onClick={() => toggleDetalle(honorario.id)}
                                                >
                                                    {detalleExpandido === honorario.id ? '📖 Ocultar' : '📄 Ver Detalles'}
                                                </button>
                                            </td>
                                        </tr>
                                        {detalleExpandido === honorario.id && (
                                            <tr className={styles.detalleFila}>
                                                <td colSpan="6">
                                                    <div className={styles.detalleHonorario}>
                                                        <h4>Detalles del Pago - {honorario.mes}</h4>
                                                        <div className={styles.detalleGrid}>
                                                            {honorario.detalles.map((detalle, index) => (
                                                                <div key={index} className={styles.detalleItem}>
                                                                    <span className={styles.detalleCurso}>{detalle.curso}</span>
                                                                    <span className={styles.detalleHoras}>{detalle.horas} horas</span>
                                                                    <span className={styles.detalleMonto}>${formatNumber(detalle.monto)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className={styles.detalleTotal}>
                                                            <strong>Total: ${formatNumber(honorario.total)}</strong>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Información adicional */}
                <div className={styles.infoAdicional}>
                    <h3>Información de Pagos</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <h4>🗓️ Fechas de Pago</h4>
                            <p>Los pagos se realizan el día 5 de cada mes por los cursos impartidos en el mes anterior.</p>
                        </div>
                        <div className={styles.infoItem}>
                            <h4>📋 Comprobantes</h4>
                            <p>Puedes descargar tus comprobantes de pago en la sección de detalles de cada mes.</p>
                        </div>
                        <div className={styles.infoItem}>
                            <h4>❓ Dudas</h4>
                            <p>Para aclaraciones sobre tus honorarios, contacta al departamento de recursos humanos.</p>
                        </div>
                    </div>
                </div>

                {/* Botón volver */}
                <div className={styles.actionsSection}>
                    <Link href="/instructor/dashboard" className={styles.btnVolver}>
                        ← Volver
                    </Link>
                </div>
            </main>
        </div>
    );
}