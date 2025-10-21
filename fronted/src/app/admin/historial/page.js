'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Historial.module.css';

export default function HistorialCursosPage() {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationError, setValidationError] = useState('');
    const [consultando, setConsultando] = useState(false);
    const router = useRouter();

    // Estados para filtros - solo fechas
    const [filters, setFilters] = useState({
        fechaInicio: '',
        fechaFin: ''
    });

    // Estado para cursos filtrados
    const [filteredCursos, setFilteredCursos] = useState([]);

    // Cargar datos iniciales
    useEffect(() => {
        const loadCursos = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8080/api/cursos');
                if (!response.ok) {
                    throw new Error(`Error ${response.status} cargando cursos`);
                }
                const data = await response.json();
                setCursos(data);
            } catch (error) {
                console.error("Error cargando cursos:", error);
                setError("Error al cargar el historial de cursos");
            } finally {
                setLoading(false);
            }
        };
        loadCursos();
    }, []);

    // Establecer fechas por defecto (últimos 30 días)
    useEffect(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        
        setFilters({
            fechaInicio: startDate.toISOString().split('T')[0],
            fechaFin: endDate.toISOString().split('T')[0]
        });
    }, []);

    // Validaciones de fechas
    const validateDates = (fechaInicio, fechaFin) => {
        setValidationError('');

        // 1. Validar que ambas fechas estén seleccionadas
        if (!fechaInicio || !fechaFin) {
            setValidationError('Ambas fechas deben estar seleccionadas');
            return false;
        }

        // 2. Validar que fecha inicio no sea mayor que fecha fin
        if (fechaInicio > fechaFin) {
            setValidationError('La fecha de inicio no puede ser mayor que la fecha de fin');
            return false;
        }

        // 3. Validar que la fecha fin no sea futura
        const today = new Date().toISOString().split('T')[0];
        if (fechaFin > today) {
            setValidationError('La fecha de fin no puede ser futura');
            return false;
        }

        // 4. Validar que la fecha inicio no sea muy antigua (más de 5 años)
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        const fiveYearsAgoStr = fiveYearsAgo.toISOString().split('T')[0];
        
        if (fechaInicio < fiveYearsAgoStr) {
            setValidationError('La fecha de inicio no puede ser anterior a 5 años');
            return false;
        }

        // 5. Validar que el rango no sea muy extenso (más de 1 año)
        const start = new Date(fechaInicio);
        const end = new Date(fechaFin);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 365) {
            setValidationError('El rango de fechas no puede ser mayor a 1 año');
            return false;
        }

        return true;
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        // Limpiar errores y resultados cuando se cambian las fechas
        setValidationError('');
        setFilteredCursos([]);
    };

    const handleConsultar = () => {
        setConsultando(true);
        setValidationError('');

        // Validar fechas
        if (!validateDates(filters.fechaInicio, filters.fechaFin)) {
            setConsultando(false);
            return;
        }

        // Filtrar cursos
        const resultados = cursos.filter(curso => {
            if (filters.fechaInicio && curso.fechaIngreso < filters.fechaInicio) {
                return false;
            }
            if (filters.fechaFin && curso.fechaIngreso > filters.fechaFin) {
                return false;
            }
            return true;
        });

        setFilteredCursos(resultados);
        setConsultando(false);
    };

    const clearFilters = () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        
        setFilters({
            fechaInicio: startDate.toISOString().split('T')[0],
            fechaFin: endDate.toISOString().split('T')[0]
        });
        setValidationError('');
        setFilteredCursos([]);
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Historial de Cursos</h1>
                </div>
                <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
            </header>

            <main className={styles.mainContent}>
                {error && <div className={styles.error}>{error}</div>}
                {validationError && <div className={styles.validationError}>{validationError}</div>}

                {/* Panel de Filtros - Solo fechas */}
                <div className={styles.searchPanel}>
                    <div className={styles.searchHeader}>
                        <h2>Seleccionar Rango de Fechas</h2>
                    </div>
                    
                    <div className={styles.dateFilters}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Fecha inicio</label>
                            <input
                                type="date"
                                name="fechaInicio"
                                value={filters.fechaInicio}
                                onChange={handleFilterChange}
                                className={styles.formControl}
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <small className={styles.helperText}>
                                Máximo 5 años atrás
                            </small>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Fecha fin</label>
                            <input
                                type="date"
                                name="fechaFin"
                                value={filters.fechaFin}
                                onChange={handleFilterChange}
                                className={styles.formControl}
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <small className={styles.helperText}>
                                No puede ser futura
                            </small>
                        </div>
                    </div>
                    
                    <div className={styles.searchActions}>
                        <button onClick={clearFilters} className={styles.btnSecondary}>
                            Limpiar
                        </button>
                        <button 
                            onClick={handleConsultar} 
                            className={styles.btnPrimary}
                            disabled={consultando}
                        >
                            {consultando ? 'Consultando...' : 'Consultar'}
                        </button>
                    </div>
                </div>

                {/* Información de resultados */}
                <div className={styles.resultsInfo}>
                    <div className={styles.resultsCount}>
                        {filteredCursos.length > 0 
                            ? `${filteredCursos.length} curso(s) encontrado(s)` 
                            : validationError 
                                ? 'Error en filtros' 
                                : 'Selecciona fechas y presiona Consultar'
                        }
                    </div>
                </div>

                {/* Tabla de resultados */}
                <div className={styles.tableContainer}>
                    {loading ? (
                        <p className={styles.loading}>Cargando cursos...</p>
                    ) : consultando ? (
                        <p className={styles.loading}>Consultando cursos...</p>
                    ) : filteredCursos.length === 0 ? (
                        <div className={styles.noResults}>
                            {validationError 
                                ? 'Corrige los errores en los filtros para ver los resultados'
                                : 'No hay cursos para mostrar. Selecciona un rango de fechas y presiona Consultar.'
                            }
                        </div>
                    ) : (
                        <table className={styles.coursesTable}>
                            <thead>
                                <tr>
                                    <th>Curso</th>
                                    <th>Horas</th>
                                    <th>Fecha</th>
                                    <th>Instructor</th>
                                    <th>Empresa</th>
                                    <th>Lugar</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCursos.map(curso => {
                                    const today = new Date().toISOString().split('T')[0];
                                    const status = curso.fechaIngreso > today ? 'Activo' : 'Finalizado';
                                    
                                    return (
                                        <tr key={curso.id}>
                                            <td>{curso.nombre}</td>
                                            <td>{curso.horas}</td>
                                            <td>{curso.fechaIngreso}</td>
                                            <td>{curso.instructor}</td>
                                            <td>{curso.empresa}</td>
                                            <td>{curso.lugar}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${
                                                    status === 'Activo' ? styles.statusActivo : styles.statusFinalizado
                                                }`}>
                                                    {status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.actionButtons}>
                        <button 
                            onClick={() => router.push('/admin/cursos')} 
                            className={styles.btnSecondary}
                        >
                            Volver a Asignación
                        </button>
                    </div>
                </footer>
            </main>
        </div>
    );
}