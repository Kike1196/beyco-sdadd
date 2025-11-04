// app/admin/page.js - VERSIÓN CON DISEÑO PROFESIONAL
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
    const router = useRouter();

    const handleLogout = () => {
        // Opcional: Limpiar datos de sesión
        localStorage.removeItem('userData');
        // Redirigir al login
        router.push('/');
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header con azul oscuro - igual que las otras páginas */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Panel de Administración</h1>
                    <p>Gestiona todos los aspectos del sistema</p>
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
                {/* Mensaje de bienvenida */}
                <div className={styles.welcomeSection}>
                    <div className={styles.welcomeCard}>
                        <div className={styles.welcomeIcon}>👋</div>
                        <div className={styles.welcomeText}>
                            <h2>¡Bienvenido de nuevo, Administrador!</h2>
                            <p>Selecciona una sección para comenzar a gestionar</p>
                        </div>
                    </div>
                </div>

                {/* Navegación principal */}
                <div className={styles.navigationGrid}>
                    <Link href="/admin/usuarios" className={styles.navCard}>
                        <div className={styles.cardIcon}>👥</div>
                        <div className={styles.cardContent}>
                            <h3>Gestión de Usuarios</h3>
                            <p>Administra instructores, secretarias y usuarios del sistema</p>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                    </Link>

                    <Link href="/admin/cursos" className={styles.navCard}>
                        <div className={styles.cardIcon}>📚</div>
                        <div className={styles.cardContent}>
                            <h3>Gestión de Cursos</h3>
                            <p>Crea y administra cursos, horarios y programaciones</p>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                    </Link>

                    <Link href="/admin/empresas" className={styles.navCard}>
                        <div className={styles.cardIcon}>🏢</div>
                        <div className={styles.cardContent}>
                            <h3>Gestión de Empresas</h3>
                            <p>Administra empresas clientes y sus información</p>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                    </Link>

                    <Link href="/admin/honorarios" className={styles.navCard}>
                        <div className={styles.cardIcon}>💰</div>
                        <div className={styles.cardContent}>
                            <h3>Honorarios</h3>
                            <p>Genera recibos y gestiona pagos a instructores</p>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                    </Link>
                </div>

                {/* Estadísticas rápidas */}
                <div className={styles.statsSection}>
                    <h3>Resumen del Sistema</h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>👥</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>24</span>
                                <span className={styles.statLabel}>Usuarios Activos</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📚</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>15</span>
                                <span className={styles.statLabel}>Cursos Activos</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🏢</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>8</span>
                                <span className={styles.statLabel}>Empresas</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>💰</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>12</span>
                                <span className={styles.statLabel}>Pagos Pendientes</span>
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