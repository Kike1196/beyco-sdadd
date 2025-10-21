'use client';

import Link from 'next/link';
import styles from './SecretariaDashboard.module.css';

export default function SecretariaDashboard() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <img src="/logo.jpg" alt="BEYCO Logo" className={styles.logo} />
            </header>
            <main className={styles.mainContent}>
                <h1>Menú Principal</h1>
                <nav className={styles.navigation}>
                    <Link href="/secretaria/documentos" className={styles.navButton}>Documentos</Link>
                    <Link href="/secretaria/recibos" className={styles.navButton}>Recibos</Link>
                    <Link href="/secretaria/evaluaciones" className={styles.navButton}>Evaluaciones</Link>
                    <Link href="/secretaria/dc3" className={styles.navButton}>DC-3</Link>
                    <Link href="/secretaria/diplomas" className={styles.navButton}>Diplomas</Link>
                </nav>
            </main>
        </div>
    );
}