// app/admin/cursos/page.js - VERSIÓN SIMPLIFICADA
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
        <div className={`${styles.notification} ${styles[`notification${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
            <div className={styles.notificationContent}>
                <span className={styles.notificationIcon}>{icon[type]}</span>
                <span className={styles.notificationMessage}>{message}</span>
                <button onClick={onClose} className={styles.notificationClose}>×</button>
            </div>
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
            <td>
                <input 
                    type="number" 
                    name="pago" 
                    value={curso.pago || ''} 
                    onChange={onChange} 
                    placeholder="Monto del pago" 
                    min="0" 
                    step="0.01"
                    className={styles.pagoInput}
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
                    const instructoresRes = await fetch('http://localhost:8080/api/instructores');
                    if (instructoresRes.ok) {
                        const instructoresData = await instructoresRes.json();
                        setInstructores(instructoresData);
                    } else {
                        console.error('Error cargando instructores:', instructoresRes.status);
                        showNotification(`Error cargando instructores: ${instructoresRes.status}`, 'warning');
                    }
                } catch (error) {
                    console.error("Error cargando instructores:", error);
                    showNotification("Error al cargar la lista de instructores", 'error');
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
            i.numEmpleado === curso.instructorId ||
            normalizeString(`${i.nombre} ${i.apellidoPaterno} ${i.apellidoMaterno}`).includes(normalizeString(curso.instructor))
        );
        const instructorId = instructorEncontrado ? instructorEncontrado.numEmpleado : '';
        
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
            lugar: curso.lugar || '',
            pago: curso.pago || ''
        });
    };

    const handleAgregarClick = () => {
        setIsAdding(true);
        setIsEditing(false);
        setSelectedCurso(null);
        setFormErrors({});
        setCursoData({ 
            fechaIngreso: new Date().toISOString().split('T')[0],
            horas: 8,
            pago: ''
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

        if (!cursoData.nombre) errors.nombre = "El nombre del curso es obligatorio.";
        if (!cursoData.fechaIngreso) {
            errors.fechaIngreso = "La fecha es obligatoria.";
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
        
        const datosParaEnviar = {
            nombre: cursoData.nombre,
            stps: cursoData.stps,
            horas: parseInt(cursoData.horas),
            fechaIngreso: cursoData.fechaIngreso,
            instructorId: parseInt(cursoData.instructorId),
            empresaId: parseInt(cursoData.empresaId),
            lugar: cursoData.lugar,
            pago: cursoData.pago ? parseFloat(cursoData.pago) : 0
        };
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(datosParaEnviar),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Error ${response.status} del servidor`);
            }

            // Recargar la lista de cursos para ver los cambios
            const cursosRes = await fetch('http://localhost:8080/api/cursos');
            if (!cursosRes.ok) throw new Error('Error al cargar cursos actualizados');
            
            const cursosActualizados = await cursosRes.json();
            setCursos(cursosActualizados);
            
            showNotification(`Curso ${isAdding ? 'creado' : 'actualizado'} correctamente.`, 'success');
            executeCancel();
            
        } catch (error) {
            console.error('Error al guardar:', error);
            showNotification("Error al guardar: " + error.message, 'error');
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
                const nuevosCursos = cursos.filter(c => c.id !== selectedCurso.id);
                setCursos(nuevosCursos);
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
            `¿Estás seguro de que quieres eliminar el curso "${selectedCurso.nombre}"? Esta acción no se puede deshacer.`,
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
            if (cursoSeleccionado) {
                updatedCursoData.stps = cursoSeleccionado.stps || '';
                if (cursoSeleccionado.horas) {
                    updatedCursoData.horas = cursoSeleccionado.horas;
                }
                // El precio del catálogo se puede usar como valor por defecto para el pago
                if (cursoSeleccionado.precio && !cursoData.pago) {
                    updatedCursoData.pago = cursoSeleccionado.precio;
                }
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

    // Función para formatear moneda
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '-';
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header con azul oscuro */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Gestión de Cursos</h1>
                    <p>Sistema completo con gestión de pagos</p>
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

                {/* Controles principales */}
                <div className={styles.controls}>
                    <div className={styles.controlsLeft}>
                        <button onClick={() => router.back()} className={styles.btnAtras}>
                            ← Volver 
                        </button>
                    </div>
                    <div className={styles.controlsRight}>
                        <button 
                            onClick={() => window.location.reload()}
                            className={styles.btnActualizar}
                            disabled={loading}
                        >
                            🔄 Actualizar
                        </button>
                    </div>
                </div>

                {/* Panel de búsqueda y filtros */}
                <div className={styles.searchPanel}>
                    <div className={styles.searchContainer}>
                        <input 
                            type="text" 
                            placeholder="Buscar cursos..." 
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterOptions}>
                        <label className={styles.filterLabel}>
                            <input 
                                type="radio" 
                                name="filter" 
                                value="nombre" 
                                checked={filterBy === 'nombre'} 
                                onChange={(e) => setFilterBy(e.target.value)} 
                            /> 
                            <span className={styles.filterText}>Nombre de curso</span>
                        </label>
                        <label className={styles.filterLabel}>
                            <input 
                                type="radio" 
                                name="filter" 
                                value="instructor" 
                                checked={filterBy === 'instructor'} 
                                onChange={(e) => setFilterBy(e.target.value)} 
                            /> 
                            <span className={styles.filterText}>Instructor</span>
                        </label>
                        <label className={styles.filterLabel}>
                            <input 
                                type="radio" 
                                name="filter" 
                                value="empresa" 
                                checked={filterBy === 'empresa'} 
                                onChange={(e) => setFilterBy(e.target.value)} 
                            /> 
                            <span className={styles.filterText}>Empresa</span>
                        </label>
                    </div>
                </div>

                {/* Tabla de cursos */}
                <div className={styles.tableSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Lista de Cursos</h2>
                        <span className={styles.counterBadge}>{filteredCursos.length}</span>
                    </div>
                    
                    <div className={styles.tableContainer}>
                        {loading ? (
                            <div className={styles.loading}>
                                ⏳ Cargando cursos...
                            </div>
                        ) : filteredCursos.length === 0 ? (
                            <div className={styles.noData}>
                                📝 No se encontraron cursos
                                {searchTerm && (
                                    <p>Intenta con otros términos de búsqueda</p>
                                )}
                            </div>
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
                                        <th>Pago</th>
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
                                                className={`${styles.tableRow} ${
                                                    selectedCurso?.id === curso.id ? styles.selectedRow : ''
                                                }`}
                                            >
                                                <td className={styles.cursoNombre}>{curso.nombre}</td>
                                                <td className={styles.cursoStps}>{curso.stps}</td>
                                                <td className={styles.cursoHoras}>{curso.horas}</td>
                                                <td className={styles.cursoFecha}>
                                                    {curso.fechaIngreso ? new Date(curso.fechaIngreso).toLocaleDateString('es-ES') : 'Sin fecha'}
                                                </td>
                                                <td className={styles.cursoInstructor}>{curso.instructor}</td>
                                                <td className={styles.cursoEmpresa}>{curso.empresa}</td>
                                                <td className={styles.cursoLugar}>{curso.lugar}</td>
                                                <td className={styles.cursoPago}>
                                                    {formatCurrency(curso.pago)}
                                                </td>
                                            </tr>
                                        )
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Panel de acciones */}
                <div className={styles.actionsPanel}>
                    <div className={styles.actionsSection}>
                        <h3>Acciones</h3>
                        <div className={styles.actionButtons}>
                            <button 
                                onClick={handleAgregarClick} 
                                className={styles.btnAgregar} 
                                disabled={isAdding || isEditing}
                            >
                                ➕ Agregar Curso
                            </button>
                            <button 
                                onClick={handleModificarClick} 
                                className={styles.btnModificar} 
                                disabled={!selectedCurso || isAdding || isEditing}
                            >
                                ✏️ Modificar
                            </button>
                            <button 
                                onClick={handleEliminarClick} 
                                className={styles.btnEliminar} 
                                disabled={!selectedCurso || isAdding || isEditing}
                            >
                                🗑️ Eliminar
                            </button>
                            <button 
                                onClick={handleGuardarClick} 
                                className={styles.btnGuardar} 
                                disabled={!isAdding && !isEditing}
                            >
                                💾 Guardar
                            </button>
                            {(isAdding || isEditing) && (
                                <button onClick={handleCancelarClick} className={styles.btnCancelar}>
                                    ❌ Cancelar
                                </button>
                            )}
                        </div>
                        
                        {/* Información del curso seleccionado */}
                        {selectedCurso && !isAdding && !isEditing && (
                            <div className={styles.selectedInfo}>
                                <h4>Curso Seleccionado</h4>
                                <p><strong>Nombre:</strong> {selectedCurso.nombre}</p>
                                <p><strong>Instructor:</strong> {selectedCurso.instructor}</p>
                                <p><strong>Empresa:</strong> {selectedCurso.empresa}</p>
                                <p><strong>Pago:</strong> {formatCurrency(selectedCurso.pago)}</p>
                            </div>
                        )}
                    </div>

                    {/* Enlaces rápidos */}
                    <div className={styles.linksSection}>
                        <h3>Navegación Rápida</h3>
                        <div className={styles.linkButtons}>
                            <Link href="/admin/historial" className={styles.btnLink}>
                                📋 Historial de Cursos
                            </Link>
                            <Link href="/admin/catalogo" className={styles.btnLink}>
                                📚 Catálogo de Cursos
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}