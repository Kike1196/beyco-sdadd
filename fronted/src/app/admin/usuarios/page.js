'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Usuarios.module.css';

// --- Componente de Notificación ---
const NotificationToast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icon = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

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

// Función para normalizar nombres de campos según la estructura del backend
const normalizeUsuario = (usuario) => {
    const mapRolIdToName = (idRol) => {
        switch (idRol) {
            case 1: return 'Administrador';
            case 2: return 'Instructor';
            case 3: return 'Secretaria';
            default: return 'Usuario';
        }
    };

    const mapRolNameToId = (rolName) => {
        switch (rolName) {
            case 'Administrador': return 1;
            case 'Instructor': return 2;
            case 'Secretaria': return 3;
            default: return 4;
        }
    };

    return {
        numEmpleado: usuario.numEmpleado || usuario.Num_Empleado || usuario.id || Math.random().toString(36).substr(2, 9),
        nombre: usuario.nombre || usuario.Nombre || '',
        apellidoPaterno: usuario.apellidoPaterno || usuario.Apellido_paterno || usuario.paterno || '',
        apellidoMaterno: usuario.apellidoMaterno || usuario.Apellido_materno || usuario.materno || '',
        correo: usuario.correo || usuario.Correo || usuario.email || '',
        contrasena: usuario.contrasena || usuario.Contrasena || usuario.password || '',
        idRol: usuario.idRol || usuario.Id_Rol || mapRolNameToId(usuario.rol) || 4,
        rol: usuario.rol || mapRolIdToName(usuario.idRol) || 'Usuario',
        activo: usuario.activo !== undefined ? usuario.activo : 
                (usuario.Activo !== undefined ? usuario.Activo : true),
        fechaIngreso: usuario.fechaIngreso || usuario.Fecha_Ingreso || usuario.fechaCreacion || new Date().toISOString().split('T')[0],
        preguntaRecuperacion: usuario.preguntaRecuperacion || usuario.Pregunta_recuperacion || usuario.pregunta || '',
        respuestaRecuperacion: usuario.respuestaRecuperacion || usuario.Respuesta_recuperacion || usuario.respuesta || '',
        firma: usuario.firma || usuario.Firma || ''
    };
};

// Función para verificar si es un usuario temporal
const isTemporaryUser = (usuario) => {
    if (!usuario || !usuario.numEmpleado) return false;
    
    if (typeof usuario.numEmpleado === 'string' && usuario.numEmpleado.includes('new-user-')) {
        return true;
    }
    
    if (typeof usuario.numEmpleado === 'number') {
        return false;
    }
    
    const numEmpleadoStr = String(usuario.numEmpleado);
    return numEmpleadoStr.includes('new-user-') || numEmpleadoStr.length > 10;
};

// ✅ COMPONENTE PRINCIPAL CORREGIDO
export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [usuarioData, setUsuarioData] = useState({});
    const [showInactive, setShowInactive] = useState(false);
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });
    const [formErrors, setFormErrors] = useState({});

    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
    };
    
    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    // Función para navegar al dashboard
    const handleAtrasClick = () => {
        router.push('/admin');
    };

    // Cargar usuarios desde la base de datos
    useEffect(() => {
        const loadUsuarios = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8080/api/usuarios', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                
                let data;
                if (result.success && Array.isArray(result.data)) {
                    data = result.data;
                } else if (Array.isArray(result)) {
                    data = result;
                } else {
                    data = [];
                }
                
                const normalizedData = data.map(normalizeUsuario);
                setUsuarios(normalizedData);
                
            } catch (error) {
                console.error("Error cargando usuarios:", error);
                showNotification("Error al cargar los usuarios: " + error.message, 'error');
                
                // Datos de fallback
                const fallbackData = [
                    {
                        numEmpleado: 1,
                        nombre: 'Armando',
                        apellidoPaterno: 'Becerra',
                        apellidoMaterno: 'Campos',
                        correo: 'armando.becerra@beyco.com',
                        contrasena: 'Ingeniería2C',
                        idRol: 2,
                        rol: 'Instructor',
                        activo: true,
                        preguntaRecuperacion: '¿Cuál es tu color favorito?',
                        respuestaRecuperacion: 'Azul',
                        fechaIngreso: '2023-01-15',
                        firma: 'firma_armando.png'
                    }
                ].map(normalizeUsuario);
                setUsuarios(fallbackData);
            } finally {
                setLoading(false);
            }
        };
        loadUsuarios();
    }, []);

    const handleSelectUsuario = (usuario) => {
        if (isAdding) return;
        
        setSelectedUsuario(usuario);
        setIsEditing(false);
        setUsuarioData({
            nombre: usuario.nombre || '',
            apellidoPaterno: usuario.apellidoPaterno || '',
            apellidoMaterno: usuario.apellidoMaterno || '',
            correo: usuario.correo || '',
            contrasena: '',
            rol: usuario.rol || '',
            preguntaRecuperacion: usuario.preguntaRecuperacion || '',
            respuestaRecuperacion: usuario.respuestaRecuperacion || '',
            fechaIngreso: usuario.fechaIngreso || '',
            firma: usuario.firma || ''
        });
        setFormErrors({});
    };

    const handleAgregarClick = () => {
        const newUser = {
            numEmpleado: 'new-user-' + Date.now(),
            nombre: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            correo: '',
            contrasena: '',
            rol: '',
            idRol: 4,
            activo: true,
            preguntaRecuperacion: '',
            respuestaRecuperacion: '',
            fechaIngreso: new Date().toISOString().split('T')[0],
            firma: ''
        };
        
        setSelectedUsuario(newUser);
        setIsAdding(true);
        setIsEditing(true);
        setUsuarioData({
            nombre: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            correo: '',
            contrasena: '',
            rol: '',
            preguntaRecuperacion: '',
            respuestaRecuperacion: '',
            fechaIngreso: new Date().toISOString().split('T')[0],
            firma: ''
        });
        setFormErrors({});
        
        // Scroll a la parte superior de la tabla para ver la nueva fila
        setTimeout(() => {
            const tableContainer = document.querySelector(`.${styles.tableContainer}`);
            if (tableContainer) {
                tableContainer.scrollTop = 0;
            }
        }, 100);
    };

    const handleModificarClick = () => {
        if (!selectedUsuario) {
            showNotification("Selecciona un usuario para modificar.", 'warning');
            return;
        }
        setIsEditing(true);
        setIsAdding(false);
        setFormErrors({});
    };

    const handleCancelarClick = () => {
        if (isEditing || isAdding) {
            showConfirmation(
                "Confirmar Cancelación",
                "¿Estás seguro de que quieres cancelar? Perderás todos los cambios no guardados.",
                () => {
                    setIsEditing(false);
                    setIsAdding(false);
                    setSelectedUsuario(null);
                    setUsuarioData({});
                    setFormErrors({});
                    closeConfirmation();
                    showNotification("Edición cancelada", 'info');
                }
            );
        } else {
            setSelectedUsuario(null);
            setUsuarioData({});
            setFormErrors({});
            showNotification("Selección limpiada", 'info');
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!usuarioData.nombre?.trim()) {
            errors.nombre = "El nombre es obligatorio";
        }
        
        if (!usuarioData.apellidoPaterno?.trim()) {
            errors.apellidoPaterno = "El apellido paterno es obligatorio";
        }
        
        if (!usuarioData.correo?.trim()) {
            errors.correo = "El correo electrónico es obligatorio";
        } else if (!/\S+@\S+\.\S+/.test(usuarioData.correo)) {
            errors.correo = "El formato del correo electrónico no es válido";
        }
        
        if (!usuarioData.rol) {
            errors.rol = "El rol es obligatorio";
        }
        
        if (isAdding && !usuarioData.contrasena?.trim()) {
            errors.contrasena = "La contraseña es obligatoria para nuevos usuarios";
        }
        
        if (!usuarioData.fechaIngreso) {
            errors.fechaIngreso = "La fecha de ingreso es obligatoria";
        }
        
        if (!usuarioData.preguntaRecuperacion?.trim()) {
            errors.preguntaRecuperacion = "La pregunta de seguridad es obligatoria";
        }
        
        if (!usuarioData.respuestaRecuperacion?.trim()) {
            errors.respuestaRecuperacion = "La respuesta de seguridad es obligatoria";
        }
        
        setFormErrors(errors);
        
        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            showNotification(firstError, 'error');
            return false;
        }
        
        return true;
    };

    const mapRolNameToId = (rolName) => {
        switch (rolName) {
            case 'Administrador': return 1;
            case 'Instructor': return 2;
            case 'Secretaria': return 3;
            default: return 4;
        }
    };

    const executeSave = async () => {
        if (!validateForm()) {
            closeConfirmation();
            return;
        }

        try {
            const usuarioTemporal = isTemporaryUser(selectedUsuario);
            
            const dataToSend = {
                nombre: usuarioData.nombre.trim(),
                apellidoPaterno: usuarioData.apellidoPaterno.trim(),
                apellidoMaterno: usuarioData.apellidoMaterno?.trim() || '',
                correo: usuarioData.correo.trim(),
                idRol: mapRolNameToId(usuarioData.rol),
                activo: selectedUsuario?.activo !== undefined ? selectedUsuario.activo : true,
                fechaIngreso: usuarioData.fechaIngreso,
                preguntaRecuperacion: usuarioData.preguntaRecuperacion?.trim() || '',
                respuestaRecuperacion: usuarioData.respuestaRecuperacion?.trim() || '',
                firma: usuarioData.firma?.trim() || ''
            };

            if (usuarioData.contrasena?.trim()) {
                dataToSend.contrasena = usuarioData.contrasena.trim();
            }

            let url = 'http://localhost:8080/api/usuarios';
            let method = isAdding || usuarioTemporal ? 'POST' : 'PUT';
            
            if (!isAdding && !usuarioTemporal) {
                dataToSend.numEmpleado = selectedUsuario.numEmpleado;
            }

            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });
            
            if (response.ok) {
                showNotification(
                    `Usuario ${isAdding ? 'creado' : 'actualizado'} correctamente`, 
                    'success'
                );
                
                // Recargar datos
                const reloadResponse = await fetch('http://localhost:8080/api/usuarios');
                if (reloadResponse.ok) {
                    const result = await reloadResponse.json();
                    let data = [];
                    if (result.success && Array.isArray(result.data)) {
                        data = result.data;
                    } else if (Array.isArray(result)) {
                        data = result;
                    }
                    const normalizedData = data.map(normalizeUsuario);
                    setUsuarios(normalizedData);
                }
                
            } else {
                throw new Error(`Error ${response.status}`);
            }
            
            setIsEditing(false);
            setIsAdding(false);
            setSelectedUsuario(null);
            setFormErrors({});
            
        } catch (error) {
            console.error('Error al guardar:', error);
            showNotification("Error al guardar el usuario: " + error.message, 'error');
        } finally {
            closeConfirmation();
        }
    };

    const handleGuardarClick = () => {
        if (validateForm()) {
            showConfirmation(
                "Confirmar Guardado",
                `¿Estás seguro de que quieres ${isAdding ? 'crear este nuevo' : 'guardar los cambios en este'} usuario?`,
                executeSave
            );
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedUsuario) {
            showNotification("Selecciona un usuario para cambiar su estado.", 'warning');
            return;
        }

        try {
            const nuevoEstado = !selectedUsuario.activo;
            
            // Actualizar localmente primero
            setUsuarios(prev => prev.map(u => 
                u.numEmpleado === selectedUsuario.numEmpleado 
                ? { ...u, activo: nuevoEstado }
                : u
            ));
            setSelectedUsuario(prev => ({ ...prev, activo: nuevoEstado }));
            
            const newStatus = nuevoEstado ? 'activado' : 'desactivado';
            showNotification(`Usuario ${newStatus} correctamente.`, 'success');
            
        } catch (error) {
            console.error('Error cambiando estado:', error);
            showNotification('Error al cambiar estado del usuario: ' + error.message, 'error');
        }
    };

    const handleCambiarContraseña = () => {
        if (!selectedUsuario) {
            showNotification("Selecciona un usuario para cambiar la contraseña.", 'warning');
            return;
        }
        setIsEditing(true);
        setUsuarioData(prev => ({ ...prev, contrasena: '' }));
        showNotification("Modo de cambio de contraseña activado. Completa la nueva contraseña y guarda.", 'info');
    };

    const handleAddSignature = () => {
        if (!selectedUsuario) {
            showNotification("Selecciona un usuario para agregar firma.", 'warning');
            return;
        }
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setUsuarioData(prev => ({ ...prev, firma: file.name }));
                showNotification(`Firma ${file.name} agregada para ${selectedUsuario.nombre}.`, 'success');
            }
        };
        input.click();
    };

    const showConfirmation = (title, message, onConfirm) => {
        setConfirmation({ isOpen: true, title, message, onConfirm });
    };

    const closeConfirmation = () => {
        setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUsuarioData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const filteredUsuarios = useMemo(() => 
        showInactive ? usuarios : usuarios.filter(usuario => usuario.activo),
        [usuarios, showInactive]
    );

    const usuariosActivos = usuarios.filter(u => u.activo).length;
    const usuariosInactivos = usuarios.filter(u => !u.activo).length;

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
                    <div className={styles.headerTop}>
                        <h1>Usuarios</h1>
                    </div>
                    <div className={`${styles.modoInfo} ${usuarios.some(u => isTemporaryUser(u)) ? styles.warning : ''}`}>
                        {usuarios.some(u => isTemporaryUser(u)) 
                            ? '' 
                            : 'Bienvenido al panel de administración de usuarios'
                        }
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.statsSection}>
                    <div className={styles.statsHeader}>
                        <h2>Todos {usuarios.length}</h2>
                        <div className={styles.statsDetails}>
                            <span className={styles.statActive}>Activos: {usuariosActivos}</span>
                            <span className={styles.statInactive}>Inactivos: {usuariosInactivos}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.filterInfo}>
                    {showInactive ? (
                        <span>Mostrando todos los usuarios (activos e inactivos)</span>
                    ) : (
                        <span>Mostrando solo usuarios activos</span>
                    )}
                </div>

                <div className={styles.tableContainer}>
                    {loading ? (
                        <p className={styles.loading}>Cargando usuarios...</p>
                    ) : (
                        <table className={styles.usuariosTable}>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>A. Paterno</th>
                                    <th>A. Materno</th>
                                    <th>Correo</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Fecha Ingreso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* ✅ NUEVO: Mostrar fila de agregar cuando esté en modo agregar */}
                                {isAdding && (
                                    <tr className={`${styles.selectedRow} ${styles.editingRow}`}>
                                        <td>
                                            <div>
                                                <input
                                                    type="text"
                                                    name="nombre"
                                                    value={usuarioData.nombre || ''}
                                                    onChange={handleInputChange}
                                                    className={`${styles.editInput} ${formErrors.nombre ? styles.inputError : ''}`}
                                                    placeholder="Nombre"
                                                />
                                                {formErrors.nombre && <span className={styles.errorText}>{formErrors.nombre}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <input
                                                    type="text"
                                                    name="apellidoPaterno"
                                                    value={usuarioData.apellidoPaterno || ''}
                                                    onChange={handleInputChange}
                                                    className={`${styles.editInput} ${formErrors.apellidoPaterno ? styles.inputError : ''}`}
                                                    placeholder="Apellido Paterno"
                                                />
                                                {formErrors.apellidoPaterno && <span className={styles.errorText}>{formErrors.apellidoPaterno}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <input
                                                    type="text"
                                                    name="apellidoMaterno"
                                                    value={usuarioData.apellidoMaterno || ''}
                                                    onChange={handleInputChange}
                                                    className={styles.editInput}
                                                    placeholder="Apellido Materno"
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <input
                                                    type="email"
                                                    name="correo"
                                                    value={usuarioData.correo || ''}
                                                    onChange={handleInputChange}
                                                    className={`${styles.editInput} ${formErrors.correo ? styles.inputError : ''}`}
                                                    placeholder="correo@ejemplo.com"
                                                />
                                                {formErrors.correo && <span className={styles.errorText}>{formErrors.correo}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <select
                                                    name="rol"
                                                    value={usuarioData.rol || ''}
                                                    onChange={handleInputChange}
                                                    className={`${styles.editSelect} ${formErrors.rol ? styles.inputError : ''}`}
                                                >
                                                    <option value="">Seleccionar rol</option>
                                                    <option value="Administrador">Administrador</option>
                                                    <option value="Instructor">Instructor</option>
                                                    <option value="Secretaria">Secretaria</option>
                                                </select>
                                                {formErrors.rol && <span className={styles.errorText}>{formErrors.rol}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.estado} ${styles.activo}`}>
                                                ☑ Activo
                                            </span>
                                        </td>
                                        <td>
                                            <div>
                                                <input
                                                    type="date"
                                                    name="fechaIngreso"
                                                    value={usuarioData.fechaIngreso || ''}
                                                    onChange={handleInputChange}
                                                    className={`${styles.editInput} ${formErrors.fechaIngreso ? styles.inputError : ''}`}
                                                />
                                                {formErrors.fechaIngreso && <span className={styles.errorText}>{formErrors.fechaIngreso}</span>}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                
                                {/* Usuarios existentes */}
                                {filteredUsuarios.map(usuario => (
                                    <tr 
                                        key={usuario.numEmpleado}
                                        onClick={() => handleSelectUsuario(usuario)}
                                        className={`${selectedUsuario?.numEmpleado === usuario.numEmpleado ? styles.selectedRow : ''} ${!usuario.activo ? styles.inactiveRow : ''} ${isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? styles.editingRow : ''}`}
                                    >
                                        {/* Nombre */}
                                        <td>
                                            {isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? (
                                                <div>
                                                    <input
                                                        type="text"
                                                        name="nombre"
                                                        value={usuarioData.nombre || ''}
                                                        onChange={handleInputChange}
                                                        className={`${styles.editInput} ${formErrors.nombre ? styles.inputError : ''}`}
                                                        placeholder="Nombre"
                                                    />
                                                    {formErrors.nombre && <span className={styles.errorText}>{formErrors.nombre}</span>}
                                                </div>
                                            ) : (
                                                usuario.nombre
                                            )}
                                        </td>

                                        {/* Apellido Paterno */}
                                        <td>
                                            {isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? (
                                                <div>
                                                    <input
                                                        type="text"
                                                        name="apellidoPaterno"
                                                        value={usuarioData.apellidoPaterno || ''}
                                                        onChange={handleInputChange}
                                                        className={`${styles.editInput} ${formErrors.apellidoPaterno ? styles.inputError : ''}`}
                                                        placeholder="Apellido Paterno"
                                                    />
                                                    {formErrors.apellidoPaterno && <span className={styles.errorText}>{formErrors.apellidoPaterno}</span>}
                                                </div>
                                            ) : (
                                                usuario.apellidoPaterno
                                            )}
                                        </td>

                                        {/* Apellido Materno */}
                                        <td>
                                            {isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? (
                                                <div>
                                                    <input
                                                        type="text"
                                                        name="apellidoMaterno"
                                                        value={usuarioData.apellidoMaterno || ''}
                                                        onChange={handleInputChange}
                                                        className={styles.editInput}
                                                        placeholder="Apellido Materno"
                                                    />
                                                </div>
                                            ) : (
                                                usuario.apellidoMaterno
                                            )}
                                        </td>

                                        {/* Correo */}
                                        <td>
                                            {isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? (
                                                <div>
                                                    <input
                                                        type="email"
                                                        name="correo"
                                                        value={usuarioData.correo || ''}
                                                        onChange={handleInputChange}
                                                        className={`${styles.editInput} ${formErrors.correo ? styles.inputError : ''}`}
                                                        placeholder="correo@ejemplo.com"
                                                    />
                                                    {formErrors.correo && <span className={styles.errorText}>{formErrors.correo}</span>}
                                                </div>
                                            ) : (
                                                usuario.correo
                                            )}
                                        </td>

                                        {/* Rol */}
                                        <td>
                                            {isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? (
                                                <div>
                                                    <select
                                                        name="rol"
                                                        value={usuarioData.rol || ''}
                                                        onChange={handleInputChange}
                                                        className={`${styles.editSelect} ${formErrors.rol ? styles.inputError : ''}`}
                                                    >
                                                        <option value="">Seleccionar rol</option>
                                                        <option value="Administrador">Administrador</option>
                                                        <option value="Instructor">Instructor</option>
                                                        <option value="Secretaria">Secretaria</option>
                                                    </select>
                                                    {formErrors.rol && <span className={styles.errorText}>{formErrors.rol}</span>}
                                                </div>
                                            ) : (
                                                <span className={`${styles.badge} ${styles[usuario.rol?.toLowerCase()] || styles.badgeDefault}`}>
                                                    {usuario.rol || 'Sin rol'}
                                                </span>
                                            )}
                                        </td>

                                        {/* Estado */}
                                        <td>
                                            <span className={`${styles.estado} ${usuario.activo ? styles.activo : styles.inactivo}`}>
                                                {usuario.activo ? '☑ Activo' : '☐ Inactivo'}
                                            </span>
                                        </td>

                                        {/* Fecha Ingreso */}
                                        <td>
                                            {isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? (
                                                <div>
                                                    <input
                                                        type="date"
                                                        name="fechaIngreso"
                                                        value={usuarioData.fechaIngreso || ''}
                                                        onChange={handleInputChange}
                                                        className={`${styles.editInput} ${formErrors.fechaIngreso ? styles.inputError : ''}`}
                                                    />
                                                    {formErrors.fechaIngreso && <span className={styles.errorText}>{formErrors.fechaIngreso}</span>}
                                                </div>
                                            ) : (
                                                usuario.fechaIngreso ? new Date(usuario.fechaIngreso).toLocaleDateString('es-ES') : '-'
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ✅ CORREGIDO: Campos adicionales para edición - DENTRO del componente */}
                {(isEditing || isAdding) && selectedUsuario && (
                    <div className={styles.additionalFields}>
                        <h3>Información Adicional</h3>
                        <div className={styles.formGrid}>
                            {/* Contraseña */}
                            <div className={styles.formGroup}>
                                <label>Contraseña {isAdding ? '(Obligatoria)' : '(Opcional - dejar vacío para no cambiar)'}</label>
                                <input
                                    type="password"
                                    name="contrasena"
                                    value={usuarioData.contrasena || ''}
                                    onChange={handleInputChange}
                                    className={`${styles.editInput} ${formErrors.contrasena ? styles.inputError : ''}`}
                                    placeholder="Nueva contraseña"
                                />
                                {formErrors.contrasena && <span className={styles.errorText}>{formErrors.contrasena}</span>}
                            </div>

                            {/* Pregunta de Seguridad */}
                            <div className={styles.formGroup}>
                                <label>Pregunta de Seguridad</label>
                                <input
                                    type="text"
                                    name="preguntaRecuperacion"
                                    value={usuarioData.preguntaRecuperacion || ''}
                                    onChange={handleInputChange}
                                    className={`${styles.editInput} ${formErrors.preguntaRecuperacion ? styles.inputError : ''}`}
                                    placeholder="Ej: ¿Cuál es tu color favorito?"
                                />
                                {formErrors.preguntaRecuperacion && <span className={styles.errorText}>{formErrors.preguntaRecuperacion}</span>}
                            </div>

                            {/* Respuesta de Seguridad */}
                            <div className={styles.formGroup}>
                                <label>Respuesta de Seguridad</label>
                                <input
                                    type="text"
                                    name="respuestaRecuperacion"
                                    value={usuarioData.respuestaRecuperacion || ''}
                                    onChange={handleInputChange}
                                    className={`${styles.editInput} ${formErrors.respuestaRecuperacion ? styles.inputError : ''}`}
                                    placeholder="Respuesta a la pregunta"
                                />
                                {formErrors.respuestaRecuperacion && <span className={styles.errorText}>{formErrors.respuestaRecuperacion}</span>}
                            </div>

                            {/* Firma */}
                            <div className={styles.formGroup}>
                                <label>Firma Digital</label>
                                <div className={styles.signatureSection}>
                                    <button 
                                        type="button" 
                                        onClick={handleAddSignature}
                                        className={styles.btnFirma}
                                    >
                                        📎 Agregar Firma
                                    </button>
                                    {usuarioData.firma && (
                                        <span className={styles.fileName}>{usuarioData.firma}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <footer className={styles.footer}>
                    <div className={styles.actionButtons}>
                        <button onClick={handleAgregarClick} className={styles.btnAgregar}>
                            Agregar
                        </button>
                        <button onClick={handleModificarClick} className={styles.btnModificar}>
                            Modificar
                        </button>
                        <button 
                            onClick={handleToggleStatus} 
                            className={selectedUsuario?.activo ? styles.btnDesactivar : styles.btnActivar}
                            disabled={!selectedUsuario}
                        >
                            {selectedUsuario?.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button 
                            onClick={() => setShowInactive(!showInactive)} 
                            className={styles.btnOcultar}
                        >
                            {showInactive ? 'Ocultar Inactivos' : 'Mostrar Inactivos'}
                        </button>
                        <button 
                            onClick={handleGuardarClick} 
                            className={styles.btnGuardar}
                            disabled={!isEditing && !isAdding}
                        >
                            Guardar
                        </button>
                        <button 
                            onClick={handleCancelarClick} 
                            className={styles.btnCancelar}
                        >
                            {isEditing || isAdding ? 'Cancelar' : 'Limpiar'}
                        </button>
                    </div>
                </footer>
            </main>

            <button onClick={handleAtrasClick} className={styles.btnAtras}>
                ← Atrás 
            </button>
        </div>
    );
}