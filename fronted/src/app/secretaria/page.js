'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SecretariaDashboard.module.css';
import InscribirAlumnos from './inscribirAlumnos/page';

export default function SecretariaDashboard() {
    const [activeModal, setActiveModal] = useState(null);
    const router = useRouter();

    const handleLogout = () => {
        // Limpiar datos de sesión
        localStorage.removeItem('userData');
        // Redirigir al login
        router.push('/');
    };

    return (
        <div className={styles.dashboardContainer}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>BEYCO Consultores</h1>
                    <p>Sistema de Gestión de Cursos</p>
                </div>
                <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
            </header>

            {/* Menú de opciones */}
            <div className={styles.menuGrid}>
                <button 
                    className={styles.menuCard}
                    onClick={() => setActiveModal('inscribir')}
                >
                    <div className={styles.cardIcon}>📋</div>
                    <h2>Inscribir alumnos</h2>
                    <p>Gestionar inscripciones a cursos</p>
                </button>

                <button className={styles.menuCard}>
                    <div className={styles.cardIcon}>📄</div>
                    <h2>Documentos</h2>
                    <p>Generar y gestionar documentos</p>
                </button>

                <button className={styles.menuCard}>
                    <div className={styles.cardIcon}>🧾</div>
                    <h2>Recibos</h2>
                    <p>Administrar recibos de pago</p>
                </button>

                <button className={styles.menuCard}>
                    <div className={styles.cardIcon}>📊</div>
                    <h2>Evaluaciones</h2>
                    <p>Gestionar evaluaciones de alumnos</p>
                </button>
            </div>

            {/* Modal de inscripción de alumnos */}
            {activeModal === 'inscribir' && (
                <InscribirAlumnos 
                    onClose={() => setActiveModal(null)} 
                />
            )}
            
            {/* Footer */}
            <footer className={styles.footer}>
                <button 
                    onClick={handleLogout} 
                    className={styles.logoutButton}
                >
                    🚪 Cerrar sesión
                </button>
            </footer>
        </div>
    );
}