'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SecretariaDashboard.module.css';

export default function SecretariaDashboard() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('userData');
        router.push('/');
    };

    const navigateTo = (path) => {
        router.push(`/secretaria/${path}`);
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header con diseño profesional */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Panel de Secretaría</h1>
                    <p>Gestiona alumnos, documentos y recibos</p>
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
                {/* Mensaje de bienvenida */}
                <div className={styles.welcomeSection}>
                    <div className={styles.welcomeCard}>
                        <div className={styles.welcomeIcon}>👩‍💼</div>
                        <div className={styles.welcomeText}>
                            <h2>¡Bienvenida de nuevo, Secretaría!</h2>
                            <p>Sistema de gestión académica y administrativa</p>
                        </div>
                    </div>
                </div>

                {/* Navegación principal - AHORA CON NAVEGACIÓN */}
                <div className={styles.navigationGrid}>
                    <button 
                        className={styles.navCard}
                        onClick={() => navigateTo('inscribirAlumnos')}
                    >
                        <div className={styles.cardIcon}>📋</div>
                        <div className={styles.cardContent}>
                            <h3>Inscribir Alumnos</h3>
                            <p>Gestionar inscripciones de alumnos a cursos</p>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                    </button>

                    <button 
                        className={styles.navCard}
                        onClick={() => navigateTo('documentos')}
                    >
                        <div className={styles.cardIcon}>📄</div>
                        <div className={styles.cardContent}>
                            <h3>Documentos</h3>
                            <p>Generar y gestionar documentos académicos</p>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                    </button>

                    <button 
                        className={styles.navCard}
                        onClick={() => navigateTo('recibos')}
                    >
                        <div className={styles.cardIcon}>🧾</div>
                        <div className={styles.cardContent}>
                            <h3>Recibos</h3>
                            <p>Administrar recibos de pago y facturación</p>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                    </button>

                    <button 
                        className={styles.navCard}
                        onClick={() => navigateTo('evaluaciones')}
                    >
                        <div className={styles.cardIcon}>📊</div>
                        <div className={styles.cardContent}>
                            <h3>Evaluaciones</h3>
                            <p>Gestionar evaluaciones y calificaciones</p>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                    </button>
                </div>

                {/* Estadísticas rápidas */}
                <div className={styles.statsSection}>
                    <h3>Resumen del Sistema</h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>👥</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>156</span>
                                <span className={styles.statLabel}>Alumnos Activos</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📚</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>24</span>
                                <span className={styles.statLabel}>Cursos Activos</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📄</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>89</span>
                                <span className={styles.statLabel}>Documentos</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>💰</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>45</span>
                                <span className={styles.statLabel}>Pagos Pendientes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actividades recientes */}
                <div className={styles.activitiesSection}>
                    <div className={styles.sectionHeader}>
                        <h3>📋 Actividades Recientes</h3>
                        <p>Últimas acciones en el sistema</p>
                    </div>
                    
                    <div className={styles.activitiesList}>
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon}>✅</div>
                            <div className={styles.activityContent}>
                                <strong>Nueva inscripción completada</strong>
                                <span>Juan Pérez - Seguridad Industrial</span>
                                <small>Hace 2 horas</small>
                            </div>
                        </div>
                        
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon}>📄</div>
                            <div className={styles.activityContent}>
                                <strong>Documento generado</strong>
                                <span>Constancia de estudios - María García</span>
                                <small>Hace 4 horas</small>
                            </div>
                        </div>
                        
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon}>💰</div>
                            <div className={styles.activityContent}>
                                <strong>Pago registrado</strong>
                                <span>Recibo #2456 - Carlos López</span>
                                <small>Hace 6 horas</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de cerrar sesión */}
                <div className={styles.actionsSection}>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <span className={styles.logoutIcon}>🚪</span>
                        Cerrar Sesión
                    </button>
                </div>
            </main>
        </div>
    );
}