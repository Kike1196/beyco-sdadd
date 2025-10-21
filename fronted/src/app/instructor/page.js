'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './InstructorDashboard.module.css';

export default function InstructorDashboard() {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleBack = () => {
        router.back();
    };

    useEffect(() => {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            setUserName(userData.name);
        }

        const datosDeEjemplo = [
            { id: 1, nombre: "Seguridad industrial", fecha: "9/6/2025", empresa: "Formex", lugar: "Ramos Arizpe", status: "Activo" },
            { id: 2, nombre: "Búsqueda y rescate", fecha: "10/11/2025", empresa: "Nemak", lugar: "Arteaga", status: "Activo" },
            { id: 3, nombre: "C-TPAT", fecha: "9/27/2025", empresa: "Vitti", lugar: "Saltillo", status: "Finalizado" },
        ];
        setCursos(datosDeEjemplo);
        setLoading(false);
    }, []);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <img src="/logo.jpg" alt="BEYCO Logo" className={styles.logo} />
            </header>
            
            <main className={styles.mainContent}>
                <div className={styles.welcome}>
                    <h2>¡Hola, {userName}!</h2>
                </div>

                <h3>Mis cursos</h3>

                {loading ? <p>Cargando cursos...</p> : (
                    <div className={styles.tableContainer}>
                        <table className={styles.cursosTable}>
                            <thead>
                                <tr>
                                    <th>Curso</th>
                                    <th>Fecha</th>
                                    <th>Empresa</th>
                                    <th>Lugar</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursos.map(curso => (
                                    <tr key={curso.id}>
                                        <td>{curso.nombre}</td>
                                        <td>{curso.fecha}</td>
                                        <td>{curso.empresa}</td>
                                        <td>{curso.lugar}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[curso.status.toLowerCase()]}`}>
                                                {curso.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                <button onClick={handleBack} className={styles.backButton}>
                    Atrás
                </button>
            </main>
        </div>
    );
}