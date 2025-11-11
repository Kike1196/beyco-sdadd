'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📊 Cargando estadísticas del sistema...');
            
            // Cargar todas las estadísticas en paralelo
            const [cursosRes, usuariosRes, instructoresRes] = await Promise.all([
                fetch('http://localhost:8080/api/cursos').catch(e => ({ ok: false, error: e })),
                fetch('http://localhost:8080/api/usuarios').catch(e => ({ ok: false, error: e })),
                fetch('http://localhost:8080/api/instructores').catch(e => ({ ok: false, error: e }))
            ]);

            let totalCursos = 0;
            let totalUsuarios = 0;
            let totalInstructores = 0;
            let cursosEsteMes = 0;
            let pagosPendientes = 0;

            // ✅ Procesar cursos
            if (cursosRes.ok) {
                const cursos = await cursosRes.json();
                console.log('📚 Cursos cargados:', cursos.length);
                
                totalCursos = cursos.length;
                
                // Calcular cursos de este mes
                const hoy = new Date();
                const mesActual = hoy.getMonth();
                const añoActual = hoy.getFullYear();
                
                cursosEsteMes = cursos.filter(curso => {
                    if (!curso.fechaIngreso) return false;
                    const fechaCurso = new Date(curso.fechaIngreso);
                    return fechaCurso.getMonth() === mesActual && 
                           fechaCurso.getFullYear() === añoActual;
                }).length;
                
                // ✅ Calcular pagos pendientes basados en el campo 'pago' de cada curso
                pagosPendientes = cursos.reduce((total, curso) => {
                    // Si existe el campo 'pago', usarlo
                    if (curso.pago && curso.pago > 0) {
                        return total + parseFloat(curso.pago);
                    }
                    
                    // Si no, calcular el 60% del precio como pago al instructor
                    if (curso.precio && curso.precio > 0) {
                        const precio = typeof curso.precio === 'object' ? 
                            parseFloat(curso.precio.toString()) : 
                            parseFloat(curso.precio);
                        return total + (precio * 0.6); // 60% para el instructor
                    }
                    
                    return total;
                }, 0);
                
                console.log('💰 Total pagos pendientes calculados:', pagosPendientes);
            } else {
                console.warn('⚠️ No se pudieron cargar los cursos');
            }

            // ✅ Procesar usuarios
            if (usuariosRes.ok) {
                const usuarios = await usuariosRes.json();
                console.log('👥 Usuarios cargados:', usuarios.length);
                totalUsuarios = usuarios.length;
            } else {
                console.warn('⚠️ No se pudieron cargar los usuarios');
            }

            // ✅ Procesar instructores
            if (instructoresRes.ok) {
                const instructores = await instructoresRes.json();
                console.log('👨‍🏫 Instructores cargados:', instructores.length);
                totalInstructores = instructores.length;
            } else {
                console.warn('⚠️ No se pudieron cargar los instructores');
            }

            // Empresas (valor fijo por ahora ya que no hay endpoint)
            const totalEmpresas = 6; // Ajusta según necesites o crea un endpoint

            const estadisticas = {
                totalUsuarios,
                totalCursos,
                totalEmpresas,
                pagosPendientes: Math.round(pagosPendientes), // Redondear a entero
                totalInstructores,
                cursosEsteMes
            };

            console.log('✅ Estadísticas finales:', estadisticas);
            setStats(estadisticas);
            
        } catch (error) {
            console.error('❌ Error al cargar estadísticas:', error);
            setError('Error al cargar las estadísticas del sistema');
            
            // Valores por defecto en caso de error
            setStats({
                totalUsuarios: 0,
                totalCursos: 0,
                totalEmpresas: 0,
                pagosPendientes: 0,
                totalInstructores: 0,
                cursosEsteMes: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        router.push('/');
    };

    // Formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Mostrar skeleton loader mientras carga
    if (stats === null) {
        return (
            <div className={styles.pageContainer}>
                <header className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1>Panel de Administración</h1>
                        <p>Gestiona todos los aspectos del sistema</p>
                    </div>
                    <div className={styles.logoSection}>
                        <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
                    </div>
                </header>

                <main className={styles.mainContent}>
                    <div className={styles.welcomeSection}>
                        <div className={styles.welcomeCard}>
                            <div className={styles.welcomeIcon}>👋</div>
                            <div className={styles.welcomeText}>
                                <h2>¡Bienvenido de nuevo, Administrador!</h2>
                                <p>Cargando información del sistema...</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.loadingStats}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Cargando estadísticas del sistema...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
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
                {/* Mostrar error si existe */}
                {error && (
                    <div className={styles.errorBanner}>
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError(null)} className={styles.errorClose}>×</button>
                    </div>
                )}

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
                    <div className={styles.statsSectionHeader}>
                        <h3>Resumen del Sistema</h3>
                        <button 
                            onClick={cargarEstadisticas} 
                            className={styles.btnRefresh}
                            disabled={loading}
                        >
                            {loading ? '⏳' : '🔄'} Actualizar
                        </button>
                    </div>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>👥</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>{stats.totalUsuarios}</span>
                                <span className={styles.statLabel}>Usuarios Activos</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📚</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>{stats.totalCursos}</span>
                                <span className={styles.statLabel}>Cursos Activos</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🏢</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>{stats.totalEmpresas}</span>
                                <span className={styles.statLabel}>Empresas</span>
                            </div>
                        </div>
                        <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
                            <div className={styles.statIcon}>💰</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>{formatCurrency(stats.pagosPendientes)}</span>
                                <span className={styles.statLabel}>Pagos Pendientes</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>👨‍🏫</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>{stats.totalInstructores}</span>
                                <span className={styles.statLabel}>Instructores</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📅</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statNumber}>{stats.cursosEsteMes}</span>
                                <span className={styles.statLabel}>Cursos Este Mes</span>
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