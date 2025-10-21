'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
    const router = useRouter();

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
            </header>
            
            <div className={styles.welcomeMessage}>
                <h1>¡Bienvenido de nuevo, Administrador!</h1>
            </div>

            <nav className={styles.navigation}>
                <Link href="/admin/usuarios" className={styles.navButton}>
                    <div className={styles.icon}>👤</div>
                    <span>Usuarios</span>
                </Link>
                <Link href="/admin/cursos" className={styles.navButton}>
                    <div className={styles.icon}>📚</div>
                    <span>Cursos</span> 
                </Link>
                <Link href="/admin/empresas" className={styles.navButton}>
                    <div className={styles.icon}>🏢</div>
                    <span>Empresas</span>
                </Link>
                <Link href="/admin/honorarios" className={styles.navButton}>
                    <div className={styles.icon}>💰</div>
                    <span>Honorarios</span>
                </Link>
            </nav>

            <button onClick={() => router.back()} className={styles.backButton}>
                Atrás
            </button>
        </div>
    );
}