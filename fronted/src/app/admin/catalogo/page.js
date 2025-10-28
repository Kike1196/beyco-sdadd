// app/admin/catalogo/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Catalogo.module.css';

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
const EditRow = ({ curso, onChange, formErrors, isEditing }) => {
    return (
        <tr className={styles.editingRow}>
            <td>
                <input 
                    type="text" 
                    name="nombre" 
                    value={curso.nombre || ''} 
                    onChange={onChange} 
                    placeholder="Nombre del curso"
                    className={formErrors.nombre ? styles.inputError : ''}
                    required
                />
                {formErrors.nombre && <div className={styles.errorText}>{formErrors.nombre}</div>}
            </td>
            <td>
                {isEditing ? (
                    <>
                        <input 
                            type="text" 
                            name="stps" 
                            value={curso.stps || ''} 
                            onChange={onChange} 
                            placeholder="Clave STPS"
                            className={formErrors.stps ? styles.inputError : ''}
                            required
                            title="No se puede modificar la Clave STPS en cursos existentes"
                        />
                        <div className={styles.fieldNote}>
                            ⚠️ No modificar la Clave STPS en cursos existentes
                        </div>
                    </>
                ) : (
                    <input 
                        type="text" 
                        name="stps" 
                        value={curso.stps || ''} 
                        onChange={onChange} 
                        placeholder="Clave STPS"
                        className={formErrors.stps ? styles.inputError : ''}
                        required
                    />
                )}
                {formErrors.stps && <div className={styles.errorText}>{formErrors.stps}</div>}
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
                    required
                />
                {formErrors.horas && <div className={styles.errorText}>{formErrors.horas}</div>}
            </td>
            <td>
                <input 
                    type="number" 
                    name="precio" 
                    value={curso.precio || ''} 
                    onChange={onChange} 
                    placeholder="Precio" 
                    min="0" 
                    step="0.01"
                    max="999999.99"
                    className={formErrors.precio ? styles.inputError : ''}
                    required
                />
                {formErrors.precio && <div className={styles.errorText}>{formErrors.precio}</div>}
            </td>
            <td>
                <select 
                    name="examenPractico" 
                    value={curso.examenPractico?.toString() || 'false'} 
                    onChange={onChange}
                    className={formErrors.examenPractico ? styles.inputError : ''}
                >
                    <option value="true">Si</option>
                    <option value="false">No</option>
                </select>
                {formErrors.examenPractico && <div className={styles.errorText}>{formErrors.examenPractico}</div>}
            </td>
        </tr>
    );
};

export default function CatalogoPage() {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCurso, setSelectedCurso] = useState(null);
    const [cursoData, setCursoData] = useState({});
    const [originalCursoData, setOriginalCursoData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

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
        const loadCursos = async () => {
            try {
                setLoading(true);
                console.log("🔍 Cargando cursos desde API...");
                
                const response = await fetch('http://localhost:8080/api/catalogo_cursos');
                console.log("📡 Response status:", response.status);
                
                if (!response.ok) throw new Error(`Error ${response.status} cargando cursos`);
                
                const cursosData = await response.json();
                console.log("✅ Datos recibidos:", cursosData);
                setCursos(cursosData);

            } catch (error) {
                console.error("❌ Error cargando cursos:", error);
                showNotification("Error al cargar los cursos: " + error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        loadCursos();
    }, []);

    const handleSelectCurso = (curso) => {
        if (isAdding || isEditing) return;
        setSelectedCurso(curso);
        const cursoDataToSet = {
            nombre: curso.nombre || '',
            stps: curso.stps || '',
            horas: curso.horas || '',
            precio: curso.precio || '',
            examenPractico: curso.examenPractico || false
        };
        setCursoData(cursoDataToSet);
        setOriginalCursoData({...cursoDataToSet}); // Guardar copia de los datos originales
    };

    const handleAgregarClick = () => {
        setIsAdding(true);
        setIsEditing(false);
        setSelectedCurso(null);
        setFormErrors({});
        setCursoData({ 
            nombre: '',
            stps: '',
            horas: 8,
            precio: 0,
            examenPractico: false
        });
        setOriginalCursoData({});
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
        setOriginalCursoData({});
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

        console.log("🔄 Validando formulario...", {
            cursoData,
            originalCursoData,
            isEditing,
            isAdding
        });

        // Validaciones básicas
        if (!cursoData.nombre || !cursoData.nombre.trim()) {
            errors.nombre = "El nombre del curso es obligatorio.";
        }

        if (!cursoData.stps || !cursoData.stps.trim()) {
            errors.stps = "La clave STPS es obligatoria.";
        } else if (isAdding) {
            // Para nuevos cursos, siempre verificar duplicados
            const claveExistente = cursos.find(curso => 
                curso.stps.toLowerCase() === cursoData.stps.toLowerCase()
            );
            if (claveExistente) {
                errors.stps = "Esta Clave STPS ya está en uso por otro curso.";
            }
        } else if (isEditing) {
            // Para edición, solo verificar duplicados si la clave STPS cambió
            const claveCambio = cursoData.stps !== originalCursoData.stps;
            console.log("🔑 Cambio de Clave STPS:", { 
                actual: cursoData.stps, 
                original: originalCursoData.stps, 
                cambio: claveCambio 
            });
            
            if (claveCambio) {
                const claveExistente = cursos.find(curso => 
                    curso.stps.toLowerCase() === cursoData.stps.toLowerCase() && 
                    curso.id !== selectedCurso.id
                );
                if (claveExistente) {
                    errors.stps = "Esta Clave STPS ya está en uso por otro curso. Usa una clave única o mantén la original.";
                }
            }
        }
        
        if (!cursoData.horas || parseInt(cursoData.horas, 10) <= 0) {
            errors.horas = "Las horas deben ser un número positivo.";
        }
        
        if (!cursoData.precio || parseFloat(cursoData.precio) < 0) {
            errors.precio = "El precio debe ser un número positivo.";
        } else if (parseFloat(cursoData.precio) > 999999.99) {
            errors.precio = "El precio no puede ser mayor a 999,999.99";
        }
        
        console.log("📋 Errores de validación:", errors);
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const executeSave = async () => {
        const method = isAdding ? 'POST' : 'PUT';
        const url = isAdding ? 
            'http://localhost:8080/api/catalogo_cursos' : 
            `http://localhost:8080/api/catalogo_cursos/${selectedCurso.id}`;
        
        try {
            const cursoToSend = {
                ...cursoData,
                horas: parseInt(cursoData.horas),
                precio: parseFloat(cursoData.precio),
                examenPractico: cursoData.examenPractico === 'true' || cursoData.examenPractico === true
            };

            console.log("📤 Enviando datos:", {
                cursoToSend,
                originalData: originalCursoData,
                cambios: {
                    nombre: cursoData.nombre !== originalCursoData.nombre,
                    stps: cursoData.stps !== originalCursoData.stps,
                    horas: cursoData.horas !== originalCursoData.horas,
                    precio: cursoData.precio !== originalCursoData.precio,
                    examenPractico: cursoData.examenPractico !== originalCursoData.examenPractico
                }
            });

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cursoToSend),
            });
            
            console.log("📨 Response status:", response.status);
            
            if (!response.ok) {
                let errorMessage = `Error ${response.status}`;
                try {
                    const errorText = await response.text();
                    console.error("❌ Error response:", errorText);
                    
                    // Manejar errores específicos
                    if (errorText.includes('Duplicate entry') || errorText.includes('clave STPS') || errorText.includes('unique_clave_stps')) {
                        errorMessage = "Ya existe un curso con esa Clave STPS. Por favor, usa una clave única o mantén la clave original.";
                    } else if (errorText.includes('foreign key constraint') || errorText.includes('Cannot delete or update a parent row')) {
                        errorMessage = "No se puede modificar la Clave STPS porque está siendo usada en cursos asignados. Puedes modificar los otros campos (nombre, horas, precio, examen).";
                    } else if (errorText.includes('Data truncation') || errorText.includes('Out of range value')) {
                        errorMessage = "El precio es demasiado alto. El máximo permitido es 999,999.99";
                    } else if (errorText.includes('Precio')) {
                        errorMessage = "Error en el precio. Asegúrate de que sea un número válido.";
                    } else {
                        errorMessage = errorText;
                    }
                } catch (e) {
                    console.error("Error parsing error response:", e);
                }
                throw new Error(errorMessage);
            }
            
            // Recargar la lista de cursos
            console.log("🔄 Recargando lista de cursos...");
            const cursosRes = await fetch('http://localhost:8080/api/catalogo_cursos');
            const data = await cursosRes.json();
            setCursos(data);
            
            showNotification(`Curso ${isAdding ? 'agregado al catálogo' : 'actualizado'} correctamente.`, 'success');
            executeCancel();

        } catch (error) {
            console.error('❌ Error al guardar:', error);
            showNotification(error.message, 'error');
            closeConfirmation();
        }
    };

    const handleGuardarClick = () => {
        console.log("💾 Intentando guardar...", { cursoData, originalCursoData });
        if (!validateForm()) {
            showNotification("Por favor, corrige los campos resaltados.", 'error');
            return;
        }
        showConfirmation(
            "Confirmar Guardado",
            `¿Estás seguro de que quieres ${isAdding ? 'agregar este nuevo curso al catálogo' : 'guardar los cambios en este curso'}?`,
            executeSave
        );
    };

    const executeDelete = async () => {
        if (!selectedCurso) return;
        
        try {
            const url = `http://localhost:8080/api/catalogo_cursos/${selectedCurso.id}`;
            console.log("🗑️ Eliminando curso:", url);
            
            const response = await fetch(url, { method: 'DELETE' });
            console.log("📨 Delete response status:", response.status);
            
            if (response.status === 204 || response.ok) {
                setCursos(cursos.filter(c => c.id !== selectedCurso.id));
                setSelectedCurso(null);
                showNotification("Curso eliminado del catálogo correctamente.", 'success');
            } else {
                let errorText = await response.text();
                console.error("❌ Error response:", errorText);
                
                // Manejar errores específicos de eliminación
                if (errorText.includes('foreign key constraint') || errorText.includes('Cannot delete or update a parent row')) {
                    showNotification("No se puede eliminar el curso porque está siendo usado en cursos asignados. Se ha desactivado en su lugar.", 'warning');
                    // Recargar la lista para reflejar el cambio de estatus
                    const cursosRes = await fetch('http://localhost:8080/api/catalogo_cursos');
                    const data = await cursosRes.json();
                    setCursos(data);
                    setSelectedCurso(null);
                } else {
                    throw new Error(errorText || `Error ${response.status}`);
                }
            }
        } catch (error) {
            console.error("❌ Error al eliminar:", error);
            if (!error.message.includes('foreign key constraint')) {
                showNotification(error.message, 'error');
            }
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
            `¿Estás seguro de que quieres eliminar el curso "${selectedCurso.nombre}" del catálogo?`,
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
        setCursoData(prev => ({ ...prev, [name]: value }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSearch = () => {
        // No se necesita llamar a la API. El filtrado es 100% local.
        // `useMemo` ya se encarga de recalcular `filteredCursos` cuando `searchTerm` cambia.
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        handleSearch();
    };

    const filteredCursos = useMemo(() => {
        // Si hay término de búsqueda, filtrar localmente como respaldo
        if (!searchTerm.trim()) return cursos;
        
        const searchLower = searchTerm.toLowerCase();
        return cursos.filter(curso => 
            curso.nombre.toLowerCase().includes(searchLower) || 
            curso.stps.toLowerCase().includes(searchLower)
        );
    }, [cursos, searchTerm]);

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
                <div className={styles.titleSection}>
                    <h1>Catálogo de Cursos</h1>
                    <p>Gestión de cursos disponibles en el sistema</p>
                </div>
                <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
            </header>

            <main className={styles.mainContent}>
                <div className={styles.toolbar}>
                    <div className={styles.searchContainer}>
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre o clave STPS..." 
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch} className={styles.btnBuscar}>
                            🔍 Buscar
                        </button>
                        {searchTerm && (
                            <button onClick={handleClearSearch} className={styles.btnLimpiar}>
                                ✕
                            </button>
                        )}
                    </div>
                    <div className={styles.infoText}>
                        {filteredCursos.length} {filteredCursos.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
                        {searchTerm && ` para "${searchTerm}"`}
                    </div>
                </div>
                
                <div className={styles.tableContainer}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Cargando catálogo de cursos...</p>
                        </div>
                    ) : (
                        <>
                            <table className={styles.cursosTable}>
                                <thead>
                                    <tr>
                                        <th>Curso</th>
                                        <th>Clave STPS</th>
                                        <th>Horas</th>
                                        <th>Precio</th>
                                        <th>Examen práctico</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isAdding && (
                                        <EditRow 
                                            curso={cursoData} 
                                            onChange={handleInputChange} 
                                            formErrors={formErrors}
                                            isEditing={false} // Para agregar, no es edición
                                        />
                                    )}
                                    {filteredCursos.map(curso => (
                                        isEditing && selectedCurso?.id === curso.id ? (
                                            <EditRow
                                                key={curso.id}
                                                curso={cursoData}
                                                onChange={handleInputChange}
                                                formErrors={formErrors}
                                                isEditing={true} // Para modificar, sí es edición
                                            />
                                        ) : (
                                            <tr 
                                                key={curso.id}
                                                onClick={() => handleSelectCurso(curso)}
                                                className={selectedCurso?.id === curso.id ? styles.selectedRow : ''}
                                            >
                                                <td className={styles.nombreCurso}>{curso.nombre}</td>
                                                <td className={styles.claveStps}>{curso.stps}</td>
                                                <td className={styles.horas}>{curso.horas} hrs</td>
                                                <td className={styles.precio}>${curso.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                                <td>
                                                    <span className={`${styles.examenBadge} ${curso.examenPractico ? styles.examenSi : styles.examenNo}`}>
                                                        {curso.examenPractico ? 'Si' : 'No'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    ))}
                                </tbody>
                            </table>
                            
                            {filteredCursos.length === 0 && !isAdding && (
                                <div className={styles.noResults}>
                                    <p>No se encontraron cursos</p>
                                    {searchTerm && (
                                        <button 
                                            onClick={handleClearSearch}
                                            className={styles.btnLimpiarBusqueda}
                                        >
                                            Limpiar búsqueda
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.actionButtons}>
                        <button onClick={handleAgregarClick} className={styles.btn} disabled={isAdding || isEditing}>
                            ➕ Agregar
                        </button>
                        <button onClick={handleModificarClick} className={styles.btn} disabled={!selectedCurso || isAdding || isEditing}>
                            ✏️ Modificar
                        </button>
                        <button onClick={handleEliminarClick} className={styles.btnEliminar} disabled={!selectedCurso || isAdding || isEditing}>
                            🗑️ Eliminar
                        </button>
                        <button onClick={handleGuardarClick} className={styles.btnGuardar} disabled={!isAdding && !isEditing}>
                            💾 Guardar
                        </button>
                        {(isAdding || isEditing) && (
                            <button onClick={handleCancelarClick} className={styles.btnCancelar}>
                                ❌ Cancelar
                            </button>
                        )}
                    </div>
                    <button onClick={() => router.back()} className={styles.btnAtras}>
                        ← Atrás
                    </button>
                </footer>
            </main>
        </div>
    );
}