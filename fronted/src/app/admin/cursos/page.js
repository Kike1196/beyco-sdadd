'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Cursos.module.css';

// --- Componente de Notificación ---
const NotificationToast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icon = { success: '✓', error: '✕', warning: '⚠' };

    return (
        <div className={`${styles.notification} ${styles[type]}`}>
            <span className={styles.notificationIcon}>{icon[type]}</span>
            <span className={styles.notificationMessage}>{message}</span>
            <button onClick={onClose} className={styles.notificationClose}>×</button>
            <div className={styles.notificationProgress}></div>
        </div>
    );
};

// --- Componente de Modal de Confirmación ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.confirmModal}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className={styles.modalButtons}>
                    <button onClick={onConfirm} className={styles.btnEliminar}>
                        Aceptar
                    </button>
                    <button onClick={onClose} className={styles.btnCancelar}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Componente para la Fila de Edición ---
const EditRow = ({ curso, onChange, instructores, empresas, catalogoCursos, formErrors }) => {
    return (
        <tr className={styles.editingRow}>
            <td>
                <select 
                    name="nombre" 
                    value={curso.nombre || ''} 
                    onChange={onChange} 
                    className={formErrors.nombre ? styles.inputError : ''}
                    required
                >
                    <option value="">Seleccionar curso</option>
                    {catalogoCursos.map(c => (
                        <option key={c.id} value={c.nombre}>
                            {c.nombre}
                        </option>
                    ))}
                </select>
            </td>
            <td>
                <input 
                    type="text" 
                    name="stps" 
                    value={curso.stps || ''} 
                    onChange={onChange} 
                    placeholder="Clave STPS (automática)" 
                    readOnly 
                    className={styles.readOnlyInput}
                />
            </td>
            <td>
                <input 
                    type="number" 
                    name="horas" 
                    value={curso.horas || ''} 
                    onChange={onChange} 
                    placeholder="Horas" 
                    min="1" 
                    className={formErrors.horas ? styles.inputError : ''}
                    readOnly
                />
            </td>
            <td>
                <input 
                    type="date" 
                    name="fechaIngreso" 
                    value={curso.fechaIngreso || ''} 
                    onChange={onChange} 
                    className={formErrors.fechaIngreso ? styles.inputError : ''}
                    required 
                />
            </td>
            <td>
                <select 
                    name="instructorId" 
                    value={curso.instructorId || ''} 
                    onChange={onChange} 
                    className={formErrors.instructorId ? styles.inputError : ''}
                    required
                >
                    <option value="">Seleccionar instructor</option>
                    {instructores.map(i => (
                        <option key={i.numEmpleado} value={i.numEmpleado}>
                            {i.nombre} {i.apellidoPaterno} {i.apellidoMaterno}
                        </option>
                    ))}
                </select>
            </td>
            <td>
                <select 
                    name="empresaId" 
                    value={curso.empresaId || ''} 
                    onChange={onChange} 
                    className={formErrors.empresaId ? styles.inputError : ''}
                    required
                >
                    <option value="">Seleccionar empresa</option>
                    {empresas.map(e => (
                        <option key={e.id} value={e.id}>
                            {e.nombre}
                        </option>
                    ))}
                </select>
            </td>
            <td>
                <input 
                    type="text" 
                    name="lugar" 
                    value={curso.lugar || ''} 
                    onChange={onChange} 
                    placeholder="Lugar" 
                    className={formErrors.lugar ? styles.inputError : ''}
                    required 
                />
            </td>
        </tr>
    );
};

export default function CursosPage() {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [instructores, setInstructores] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [catalogoCursos, setCatalogoCursos] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCurso, setSelectedCurso] = useState(null);
    const [cursoData, setCursoData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('nombre');
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
    };
    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                
                // Cargar cursos
                const cursosRes = await fetch('http://localhost:8080/api/cursos');
                if (!cursosRes.ok) throw new Error(`Error ${cursosRes.status} cargando cursos`);
                const cursosData = await cursosRes.json();
                setCursos(cursosData);

                // Cargar instructores
                try {
                    const instructoresRes = await fetch('http://localhost:8080/api/usuarios/instructores');
                    if (instructoresRes.ok) {
                        const instructoresData = await instructoresRes.json();
                        setInstructores(instructoresData);
                    }
                } catch (error) {
                    console.warn("Error cargando instructores:", error);
                }

                // CARGAR EMPRESAS - SOLO EJEMPLOS (SIN BACKEND)
                const empresasEjemplo = [
                    { id: 1, nombre: "Manufacturas Coahuilenses S.A. de C.V." },
                    { id: 2, nombre: "Aceros del Norte y Ensambles SAPI" },
                    { id: 3, nombre: "Transportes Rapidos Saltillo S. de R.L." },
                    { id: 4, nombre: "Logstica Industrial del Norte S.A. de C.V." },
                    { id: 5, nombre: "Autopartes Ensambladas de Mxico SAPI" },
                    { id: 6, nombre: "Procesadora de Alimentos del Noreste S. de R.L." }
                ];
                setEmpresas(empresasEjemplo);

                // Cargar catálogo de cursos
                try {
                    const catalogoRes = await fetch('http://localhost:8080/api/catalogo_cursos');
                    if (catalogoRes.ok) {
                        const catalogoData = await catalogoRes.json();
                        setCatalogoCursos(catalogoData);
                    }
                } catch (error) {
                    console.warn("Error cargando catálogo de cursos:", error);
                }

            } catch (error) {
                console.error("Error cargando datos iniciales:", error);
                showNotification("Error al cargar los datos: " + error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const handleSelectCurso = (curso) => {
        if (isAdding || isEditing) return;
        setSelectedCurso(curso);
        const normalizeString = (str) => str.toString().toLowerCase().trim();
        const instructorEncontrado = instructores.find(i => 
            normalizeString(`${i.nombre} ${i.apellidoPaterno} ${i.apellidoMaterno}`).includes(normalizeString(curso.instructor))
        );
        const instructorId = instructorEncontrado ? instructorEncontrado.numEmpleado : '';
        
        // Buscar empresa por nombre exacto
        const empresaEncontrada = empresas.find(e => 
            e.nombre.trim().toLowerCase() === curso.empresa?.trim().toLowerCase()
        );
        const empresaId = empresaEncontrada ? empresaEncontrada.id : '';
        
        const cursoDelCatalogo = catalogoCursos.find(c => 
            normalizeString(c.nombre) === normalizeString(curso.nombre)
        );
        const stpsValue = cursoDelCatalogo ? (cursoDelCatalogo.stps || '') : (curso.stps || '');
        
        setCursoData({
            nombre: curso.nombre || '',
            stps: stpsValue,
            horas: curso.horas || '',
            fechaIngreso: curso.fechaIngreso ? new Date(curso.fechaIngreso).toISOString().split('T')[0] : '',
            instructorId: instructorId,
            empresaId: empresaId,
            lugar: curso.lugar || ''
        });
    };

    const handleAgregarClick = () => {
        setIsAdding(true);
        setIsEditing(false);
        setSelectedCurso(null);
        setFormErrors({});
        setCursoData({ 
            fechaIngreso: new Date().toISOString().split('T')[0],
            horas: 8
        });
    };

    const handleModificarClick = () => {
        if (!selectedCurso) {
            showNotification("Selecciona un curso para modificar.", 'warning');
            return;
        }
        setIsEditing(true);
        setIsAdding(false);
        setFormErrors({});
    };

    const executeCancel = () => {
        setIsAdding(false);
        setIsEditing(false);
        setSelectedCurso(null);
        setCursoData({});
        setFormErrors({});
        closeConfirmation();
    };

    const handleCancelarClick = () => {
        showConfirmation(
            "Confirmar Cancelación",
            "¿Estás seguro de que quieres cancelar? Perderás todos los cambios no guardados.",
            executeCancel
        );
    };

    const validateForm = () => {
        const errors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!cursoData.nombre) errors.nombre = "El nombre del curso es obligatorio.";
        if (!cursoData.fechaIngreso) {
            errors.fechaIngreso = "La fecha es obligatoria.";
        } else {
            const fechaIngresada = new Date(cursoData.fechaIngreso + 'T00:00:00');
            if (fechaIngresada < today) {
                errors.fechaIngreso = "La fecha no puede ser en el pasado.";
            }
        }
        if (!cursoData.instructorId) errors.instructorId = "El instructor es obligatorio.";
        if (!cursoData.empresaId) errors.empresaId = "La empresa es obligatoria.";
        if (!cursoData.lugar || !cursoData.lugar.trim()) errors.lugar = "El lugar es obligatorio.";
        if (!cursoData.horas || parseInt(cursoData.horas, 10) <= 0) errors.horas = "Las horas deben ser un número positivo.";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const executeSave = async () => {
        const method = isAdding ? 'POST' : 'PUT';
        const url = isAdding ? 'http://localhost:8080/api/cursos' : `http://localhost:8080/api/cursos/${selectedCurso.id}`;
        
        // Preparar datos para enviar
        const datosParaEnviar = {
            ...cursoData,
            empresaId: Number(cursoData.empresaId)
        };
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosParaEnviar),
            });
            
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: 'Error desconocido del servidor' }));
                throw new Error(errorBody.message || `Error ${response.status}`);
            }
            
            // Recargar cursos
            const cursosRes = await fetch('http://localhost:8080/api/cursos');
            const data = await cursosRes.json();
            setCursos(data);
            showNotification(`Curso ${isAdding ? 'creado' : 'actualizado'} correctamente.`, 'success');
            executeCancel();
        } catch (error) {
            console.error('Error al guardar:', error);
            showNotification(error.message, 'error');
            closeConfirmation();
        }
    };

    const handleGuardarClick = () => {
        if (!validateForm()) {
            showNotification("Por favor, corrige los campos resaltados.", 'error');
            return;
        }
        showConfirmation(
            "Confirmar Guardado",
            `¿Estás seguro de que quieres ${isAdding ? 'crear este nuevo' : 'guardar los cambios en este'} curso?`,
            executeSave
        );
    };

    const executeDelete = async () => {
        if (!selectedCurso) return;
        try {
            const url = `http://localhost:8080/api/cursos/${selectedCurso.id}`;
            const response = await fetch(url, { method: 'DELETE' });
            if (response.status === 204 || response.ok) {
                setCursos(cursos.filter(c => c.id !== selectedCurso.id));
                setSelectedCurso(null);
                showNotification("Curso eliminado correctamente.", 'success');
            } else {
                const errorBody = await response.json().catch(() => ({ message: 'Error desconocido del servidor' }));
                throw new Error(errorBody.message || `Error ${response.status}`);
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
            showNotification(error.message, 'error');
        } finally {
            closeConfirmation();
        }
    };

    const handleEliminarClick = () => {
        if (!selectedCurso) {
            showNotification("Selecciona un curso para eliminar.", 'warning');
            return;
        }
        showConfirmation(
            "Confirmar Eliminación",
            `¿Estás seguro de que quieres eliminar el curso "${selectedCurso.nombre}"?`,
            executeDelete
        );
    };

    const showConfirmation = (title, message, onConfirm) => {
        setConfirmation({ isOpen: true, title, message, onConfirm });
    };

    const closeConfirmation = () => {
        setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let updatedCursoData = { ...cursoData, [name]: value };
        if (name === 'nombre') {
            const cursoSeleccionado = catalogoCursos.find(c => c.nombre === value);
            updatedCursoData.stps = cursoSeleccionado ? (cursoSeleccionado.stps || '') : '';
            // También actualizar las horas automáticamente desde el catálogo
            if (cursoSeleccionado && cursoSeleccionado.horas) {
                updatedCursoData.horas = cursoSeleccionado.horas;
            }
        }
        setCursoData(updatedCursoData);
    };

    const filteredCursos = useMemo(() => 
        cursos.filter(curso => {
            if (!searchTerm) return true;
            const fieldValue = curso[filterBy]?.toString().toLowerCase();
            return fieldValue?.includes(searchTerm.toLowerCase());
        }), [cursos, searchTerm, filterBy]
    );

    return (
        <div className={styles.pageContainer}>
            {notification.show && (
                <NotificationToast 
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}

            <ConfirmModal
                isOpen={confirmation.isOpen}
                onClose={closeConfirmation}
                onConfirm={confirmation.onConfirm}
                title={confirmation.title}
                message={confirmation.message}
            />

            <header className={styles.header}>
                <div className={styles.titleSection}><h1>Asignación de Cursos</h1></div>
                <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
            </header>

            <main className={styles.mainContent}>
                <div className={styles.toolbar}>
                    <input 
                        type="text" 
                        placeholder="Buscar..." 
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className={styles.filterOptions}>
                        <label>
                            <input type="radio" name="filter" value="nombre" checked={filterBy === 'nombre'} onChange={(e) => setFilterBy(e.target.value)} /> 
                            Nombre de curso
                        </label>
                        <label>
                            <input type="radio" name="filter" value="instructor" checked={filterBy === 'instructor'} onChange={(e) => setFilterBy(e.target.value)} /> 
                            Instructor
                        </label>
                        <label>
                            <input type="radio" name="filter" value="empresa" checked={filterBy === 'empresa'} onChange={(e) => setFilterBy(e.target.value)} /> 
                            Empresa
                        </label>
                    </div>
                </div>
                
                <div className={styles.tableContainer}>
                    {loading ? (
                        <p className={styles.loading}>Cargando cursos...</p>
                    ) : (
                        <table className={styles.cursosTable}>
                            <thead>
                                <tr>
                                    <th>Curso</th>
                                    <th>STPS</th>
                                    <th>Horas</th>
                                    <th>Fecha</th>
                                    <th>Instructor</th>
                                    <th>Empresa</th>
                                    <th>Lugar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isAdding && (
                                    <EditRow 
                                        curso={cursoData} 
                                        onChange={handleInputChange} 
                                        instructores={instructores} 
                                        empresas={empresas} 
                                        catalogoCursos={catalogoCursos} 
                                        formErrors={formErrors}
                                    />
                                )}
                                {filteredCursos.map(curso => (
                                    isEditing && selectedCurso?.id === curso.id ? (
                                        <EditRow
                                            key={curso.id}
                                            curso={cursoData}
                                            onChange={handleInputChange}
                                            instructores={instructores}
                                            empresas={empresas}
                                            catalogoCursos={catalogoCursos}
                                            formErrors={formErrors}
                                        />
                                    ) : (
                                        <tr 
                                            key={curso.id}
                                            onClick={() => handleSelectCurso(curso)}
                                            className={selectedCurso?.id === curso.id ? styles.selectedRow : ''}
                                        >
                                            <td>{curso.nombre}</td>
                                            <td>{curso.stps}</td>
                                            <td>{curso.horas}</td>
                                            <td>{curso.fechaIngreso ? new Date(curso.fechaIngreso).toLocaleDateString('es-ES') : 'Sin fecha'}</td>
                                            <td>{curso.instructor}</td>
                                            <td>{curso.empresa}</td>
                                            <td>{curso.lugar}</td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.actionButtons}>
                        <button onClick={handleAgregarClick} className={styles.btn} disabled={isAdding || isEditing}>Agregar</button>
                        <button onClick={handleModificarClick} className={styles.btn} disabled={!selectedCurso || isAdding || isEditing}>Modificar</button>
                        <button onClick={handleEliminarClick} className={styles.btn} disabled={!selectedCurso || isAdding || isEditing}>Eliminar</button>
                        <button onClick={handleGuardarClick} className={styles.btnGuardar} disabled={!isAdding && !isEditing}>Guardar</button>
                        {(isAdding || isEditing) && (
                            <button onClick={handleCancelarClick} className={styles.btnCancelar}>Cancelar</button>
                        )}
                    </div>
                    <div className={styles.linkButtons}>
                        <button 
                            onClick={() => router.push('/admin/historial')}
                            className={styles.btnLink}
                        >
                            Historial de cursos
                        </button>
                        <button 
                            onClick={() => router.push('/admin/catalogo')}
                            className={styles.btnLink}
                        >
                            Catálogo de cursos
                        </button>
                    </div>
                    <button onClick={() => router.back()} className={styles.btnAtras}>Atrás</button>
                </footer>
            </main>
        </div>
    );
}