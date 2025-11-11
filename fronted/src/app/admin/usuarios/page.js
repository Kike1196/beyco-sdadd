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

// ✅ FUNCIÓN MEJORADA DE NORMALIZACIÓN
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
        const normalized = rolName?.toLowerCase();
        switch (normalized) {
            case 'administrador': return 1;
            case 'instructor': return 2;
            case 'secretaria': return 3;
            default: return 4;
        }
    };

    // Capitalizar primera letra
    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    return {
        numEmpleado: usuario.numEmpleado || usuario.Num_Empleado || usuario.id || Math.random().toString(36).substr(2, 9),
        nombre: usuario.nombre || usuario.Nombre || '',
        apellidoPaterno: usuario.apellidoPaterno || usuario.Apellido_paterno || usuario.apellido_paterno || usuario.paterno || '',
        apellidoMaterno: usuario.apellidoMaterno || usuario.Apellido_materno || usuario.apellido_materno || usuario.materno || '',
        correo: usuario.correo || usuario.Correo || usuario.email || '',
        contrasena: usuario.contrasena || usuario.Contrasena || usuario.password || '',
        idRol: usuario.idRol || usuario.Id_Rol || usuario.id_rol || mapRolNameToId(usuario.rol) || 4,
        rol: capitalize(usuario.rol) || mapRolIdToName(usuario.idRol || usuario.Id_Rol || usuario.id_rol) || 'Usuario',
        activo: usuario.activo !== undefined ? usuario.activo : 
                (usuario.Activo !== undefined ? usuario.Activo : true),
        fechaIngreso: usuario.fechaIngreso || usuario.Fecha_Ingreso || usuario.fecha_ingreso || usuario.fechaCreacion || new Date().toISOString().split('T')[0],
        preguntaRecuperacion: usuario.preguntaRecuperacion || usuario.Pregunta_recuperacion || usuario.pregunta_recuperacion || usuario.pregunta || '',
        respuestaRecuperacion: usuario.respuestaRecuperacion || usuario.Respuesta_recuperacion || usuario.respuesta_recuperacion || usuario.respuesta || '',
        firma: usuario.firma || usuario.Firma || ''
    };
};

// ✅ VALIDACIONES COMPLETAS
const validaciones = {
    nombre: (nombre) => {
        if (!nombre?.trim()) {
            return { valido: false, mensaje: 'El nombre es obligatorio' };
        }
        if (nombre.length < 2) {
            return { valido: false, mensaje: 'El nombre debe tener al menos 2 caracteres' };
        }
        if (nombre.length > 50) {
            return { valido: false, mensaje: 'El nombre no puede exceder 50 caracteres' };
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
            return { valido: false, mensaje: 'El nombre solo puede contener letras y espacios' };
        }
        return { valido: true, mensaje: '' };
    },

    apellidoPaterno: (apellido) => {
        if (!apellido?.trim()) {
            return { valido: false, mensaje: 'El apellido paterno es obligatorio' };
        }
        if (apellido.length < 2) {
            return { valido: false, mensaje: 'El apellido paterno debe tener al menos 2 caracteres' };
        }
        if (apellido.length > 30) {
            return { valido: false, mensaje: 'El apellido paterno no puede exceder 30 caracteres' };
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(apellido)) {
            return { valido: false, mensaje: 'El apellido paterno solo puede contener letras' };
        }
        return { valido: true, mensaje: '' };
    },

    apellidoMaterno: (apellido) => {
        if (apellido && apellido.trim()) {
            if (apellido.length < 2) {
                return { valido: false, mensaje: 'El apellido materno debe tener al menos 2 caracteres' };
            }
            if (apellido.length > 30) {
                return { valido: false, mensaje: 'El apellido materno no puede exceder 30 caracteres' };
            }
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(apellido)) {
                return { valido: false, mensaje: 'El apellido materno solo puede contener letras' };
            }
        }
        return { valido: true, mensaje: '' };
    },

    correo: (correo, usuariosExistentes = [], usuarioActual = null) => {
        if (!correo?.trim()) {
            return { valido: false, mensaje: 'El correo electrónico es obligatorio' };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            return { valido: false, mensaje: 'El formato del correo electrónico no es válido' };
        }
        
        if (correo.length > 100) {
            return { valido: false, mensaje: 'El correo electrónico no puede exceder 100 caracteres' };
        }

        const correoDuplicado = usuariosExistentes.some(usuario => 
            usuario.correo.toLowerCase() === correo.toLowerCase() && 
            usuario.numEmpleado !== usuarioActual?.numEmpleado
        );
        
        if (correoDuplicado) {
            return { valido: false, mensaje: 'El correo electrónico ya está registrado' };
        }

        return { valido: true, mensaje: '' };
    },

    contrasena: (contrasena, esNuevoUsuario = false) => {
        if (esNuevoUsuario && !contrasena?.trim()) {
            return { valido: false, mensaje: 'La contraseña es obligatoria para nuevos usuarios' };
        }
        
        if (contrasena && contrasena.trim()) {
            if (contrasena.length < 6) {
                return { valido: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
            }
            if (contrasena.length > 50) {
                return { valido: false, mensaje: 'La contraseña no puede exceder 50 caracteres' };
            }
        }
        
        return { valido: true, mensaje: '' };
    },

    rol: (rol) => {
        if (!rol) {
            return { valido: false, mensaje: 'El rol es obligatorio' };
        }
        const rolesPermitidos = ['Administrador', 'Instructor', 'Secretaria'];
        if (!rolesPermitidos.includes(rol)) {
            return { valido: false, mensaje: 'El rol seleccionado no es válido' };
        }
        return { valido: true, mensaje: '' };
    },

    fechaIngreso: (fecha) => {
        if (!fecha) {
            return { valido: false, mensaje: 'La fecha de ingreso es obligatoria' };
        }
        
        const fechaIngreso = new Date(fecha);
        const fechaActual = new Date();
        const fechaMinima = new Date('2000-01-01');
        
        if (fechaIngreso > fechaActual) {
            return { valido: false, mensaje: 'La fecha de ingreso no puede ser futura' };
        }
        
        if (fechaIngreso < fechaMinima) {
            return { valido: false, mensaje: 'La fecha de ingreso no puede ser anterior al año 2000' };
        }
        
        return { valido: true, mensaje: '' };
    },

    preguntaRecuperacion: (pregunta) => {
        if (!pregunta?.trim()) {
            return { valido: false, mensaje: 'La pregunta de seguridad es obligatoria' };
        }
        if (pregunta.length < 10) {
            return { valido: false, mensaje: 'La pregunta de seguridad debe tener al menos 10 caracteres' };
        }
        if (pregunta.length > 100) {
            return { valido: false, mensaje: 'La pregunta de seguridad no puede exceder 100 caracteres' };
        }
        return { valido: true, mensaje: '' };
    },

    respuestaRecuperacion: (respuesta) => {
        if (!respuesta?.trim()) {
            return { valido: false, mensaje: 'La respuesta de seguridad es obligatoria' };
        }
        if (respuesta.length < 3) {
            return { valido: false, mensaje: 'La respuesta de seguridad debe tener al menos 3 caracteres' };
        }
        if (respuesta.length > 50) {
            return { valido: false, mensaje: 'La respuesta de seguridad no puede exceder 50 caracteres' };
        }
        return { valido: true, mensaje: '' };
    },

    firma: (archivo) => {
        if (archivo && archivo.trim()) {
            const extensionesPermitidas = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx'];
            const extension = archivo.toLowerCase().substring(archivo.lastIndexOf('.'));
            
            if (!extensionesPermitidas.includes(extension)) {
                return { 
                    valido: false, 
                    mensaje: `Tipo de archivo no permitido. Formatos aceptados: ${extensionesPermitidas.join(', ')}` 
                };
            }
            
            if (archivo.length > 200) {
                return { valido: false, mensaje: 'El nombre del archivo es demasiado largo' };
            }
        }
        return { valido: true, mensaje: '' };
    }
};

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
    const [touchedFields, setTouchedFields] = useState({});

    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
    };
    
    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    const handleAtrasClick = () => {
        if (isEditing || isAdding) {
            showConfirmation(
                "Salir sin guardar",
                "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?",
                () => {
                    router.push('/admin');
                }
            );
        } else {
            router.push('/admin');
        }
    };

    // ✅ CARGA DE USUARIOS MEJORADA
    useEffect(() => {
        const loadUsuarios = async () => {
            try {
                setLoading(true);
                console.log('🔄 Cargando usuarios...');
                
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
                console.log('📦 Respuesta del backend:', result);
                
                // ✅ EXTRAER USUARIOS DE LA RESPUESTA
                let data = [];
                if (result.success && Array.isArray(result.usuarios)) {
                    data = result.usuarios;
                    console.log('✅ Encontrados en result.usuarios');
                } else if (Array.isArray(result.usuarios)) {
                    data = result.usuarios;
                    console.log('✅ Encontrados en result.usuarios (sin success)');
                } else if (result.success && Array.isArray(result.data)) {
                    data = result.data;
                    console.log('✅ Encontrados en result.data');
                } else if (Array.isArray(result)) {
                    data = result;
                    console.log('✅ Array directo');
                }
                
                console.log('📊 Total usuarios:', data.length);
                
                const normalizedData = data.map(normalizeUsuario);
                console.log('✨ Usuarios normalizados:', normalizedData.length);
                
                setUsuarios(normalizedData);
                showNotification(`${normalizedData.length} usuarios cargados correctamente`, 'success');
                
            } catch (error) {
                console.error("❌ Error cargando usuarios:", error);
                showNotification("Error al cargar los usuarios: " + error.message, 'error');
                setUsuarios([]);
            } finally {
                setLoading(false);
            }
        };
        loadUsuarios();
    }, []);

    const validateField = (name, value) => {
        switch (name) {
            case 'nombre':
                return validaciones.nombre(value);
            case 'apellidoPaterno':
                return validaciones.apellidoPaterno(value);
            case 'apellidoMaterno':
                return validaciones.apellidoMaterno(value);
            case 'correo':
                return validaciones.correo(value, usuarios, selectedUsuario);
            case 'contrasena':
                return validaciones.contrasena(value, isAdding);
            case 'rol':
                return validaciones.rol(value);
            case 'fechaIngreso':
                return validaciones.fechaIngreso(value);
            case 'preguntaRecuperacion':
                return validaciones.preguntaRecuperacion(value);
            case 'respuestaRecuperacion':
                return validaciones.respuestaRecuperacion(value);
            case 'firma':
                return validaciones.firma(value);
            default:
                return { valido: true, mensaje: '' };
        }
    };

    const handleSelectUsuario = (usuario) => {
        if (isAdding || isEditing) {
            showNotification("Termina la edición actual antes de seleccionar otro usuario", 'warning');
            return;
        }
        
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
        setTouchedFields({});
    };

    const handleAgregarClick = () => {
        if (isEditing) {
            showNotification("Termina la edición actual antes de agregar un nuevo usuario", 'warning');
            return;
        }

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
        setTouchedFields({});
        
        setTimeout(() => {
            const tableContainer = document.querySelector(`.${styles.tableContainer}`);
            if (tableContainer) {
                tableContainer.scrollTop = 0;
            }
        }, 100);

        showNotification("Modo de agregar usuario activado. Completa todos los campos obligatorios.", 'info');
    };

    const handleModificarClick = () => {
        if (!selectedUsuario) {
            showNotification("Selecciona un usuario para modificar.", 'warning');
            return;
        }

        if (selectedUsuario.numEmpleado.toString().includes('new-user-')) {
            showNotification("No puedes modificar un usuario que no ha sido guardado", 'error');
            return;
        }

        setIsEditing(true);
        setIsAdding(false);
        setFormErrors({});
        setTouchedFields({});
        showNotification("Modo de edición activado. Modifica los campos necesarios.", 'info');
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
                    setTouchedFields({});
                    closeConfirmation();
                    showNotification("Edición cancelada", 'info');
                }
            );
        } else {
            setSelectedUsuario(null);
            setUsuarioData({});
            setFormErrors({});
            setTouchedFields({});
            showNotification("Selección limpiada", 'info');
        }
    };

    const validateForm = () => {
        const errors = {};
        let hasErrors = false;

        const camposObligatorios = [
            'nombre', 'apellidoPaterno', 'correo', 'rol', 'fechaIngreso', 
            'preguntaRecuperacion', 'respuestaRecuperacion'
        ];

        camposObligatorios.forEach(campo => {
            const validacion = validateField(campo, usuarioData[campo]);
            if (!validacion.valido) {
                errors[campo] = validacion.mensaje;
                hasErrors = true;
            }
        });

        if (isAdding) {
            const validacionContrasena = validateField('contrasena', usuarioData.contrasena);
            if (!validacionContrasena.valido) {
                errors.contrasena = validacionContrasena.mensaje;
                hasErrors = true;
            }
        }

        const camposOpcionales = ['apellidoMaterno', 'firma'];
        camposOpcionales.forEach(campo => {
            if (usuarioData[campo]) {
                const validacion = validateField(campo, usuarioData[campo]);
                if (!validacion.valido) {
                    errors[campo] = validacion.mensaje;
                    hasErrors = true;
                }
            }
        });

        setFormErrors(errors);

        if (hasErrors) {
            const firstError = Object.values(errors)[0];
            showNotification(`Error de validación: ${firstError}`, 'error');
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
            const usuarioTemporal = selectedUsuario.numEmpleado.toString().includes('new-user-');
            
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
                    if (result.success && Array.isArray(result.usuarios)) {
                        data = result.usuarios;
                    } else if (Array.isArray(result.usuarios)) {
                        data = result.usuarios;
                    } else if (result.success && Array.isArray(result.data)) {
                        data = result.data;
                    } else if (Array.isArray(result)) {
                        data = result;
                    }
                    const normalizedData = data.map(normalizeUsuario);
                    setUsuarios(normalizedData);
                }
                
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}`);
            }
            
            setIsEditing(false);
            setIsAdding(false);
            setSelectedUsuario(null);
            setFormErrors({});
            setTouchedFields({});
            
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

    const handleToggleStatus = (usuario, e) => {
        e.stopPropagation();
        
        if (!usuario) return;

        if (usuario.rol === 'Administrador' && usuario.activo) {
            const administradoresActivos = usuarios.filter(u => 
                u.rol === 'Administrador' && u.activo && u.numEmpleado !== usuario.numEmpleado
            ).length;
            
            if (administradoresActivos === 0) {
                showNotification("No puedes desactivar el único administrador activo del sistema", 'error');
                return;
            }
        }

        showConfirmation(
            "Cambiar Estado",
            `¿Estás seguro de que quieres ${usuario.activo ? 'desactivar' : 'activar'} a ${usuario.nombre}?`,
            async () => {
                try {
                    const nuevoEstado = !usuario.activo;
                    
                    setUsuarios(prev => prev.map(u => 
                        u.numEmpleado === usuario.numEmpleado 
                        ? { ...u, activo: nuevoEstado }
                        : u
                    ));
                    
                    if (selectedUsuario?.numEmpleado === usuario.numEmpleado) {
                        setSelectedUsuario(prev => ({ ...prev, activo: nuevoEstado }));
                    }
                    
                    const newStatus = nuevoEstado ? 'activado' : 'desactivado';
                    showNotification(`Usuario ${newStatus} correctamente.`, 'success');
                    
                } catch (error) {
                    console.error('Error cambiando estado:', error);
                    showNotification('Error al cambiar estado del usuario: ' + error.message, 'error');
                } finally {
                    closeConfirmation();
                }
            }
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
        setUsuarioData(prev => ({ ...prev, [name]: value }));
        
        setTouchedFields(prev => ({ ...prev, [name]: true }));
        
        if (touchedFields[name]) {
            const validacion = validateField(name, value);
            if (!validacion.valido) {
                setFormErrors(prev => ({ ...prev, [name]: validacion.mensaje }));
            } else {
                setFormErrors(prev => ({ ...prev, [name]: '' }));
            }
        }
        
        e.stopPropagation();
    };

    const handleInputBlur = (e) => {
        const { name, value } = e.target;
        setTouchedFields(prev => ({ ...prev, [name]: true }));
        
        const validacion = validateField(name, value);
        if (!validacion.valido) {
            setFormErrors(prev => ({ ...prev, [name]: validacion.mensaje }));
        } else {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddSignature = () => {
        if (!selectedUsuario) {
            showNotification("Selecciona un usuario para agregar firma.", 'warning');
            return;
        }
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf,.doc,.docx';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    showNotification("El archivo es demasiado grande. El tamaño máximo permitido es 5MB.", 'error');
                    return;
                }
                
                const validacion = validaciones.firma(file.name);
                if (!validacion.valido) {
                    showNotification(validacion.mensaje, 'error');
                    return;
                }
                
                setUsuarioData(prev => ({ ...prev, firma: file.name }));
                showNotification(`Firma ${file.name} agregada correctamente para ${selectedUsuario.nombre}.`, 'success');
            }
        };
        input.click();
    };

    const filteredUsuarios = useMemo(() => 
        showInactive ? usuarios : usuarios.filter(usuario => usuario.activo),
        [usuarios, showInactive]
    );

    const usuariosActivos = usuarios.filter(u => u.activo).length;
    const usuariosInactivos = usuarios.filter(u => !u.activo).length;

    const handleToggleShowInactive = () => {
        setShowInactive(!showInactive);
    };

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
                        <h1>Gestión de usuarios</h1>
                    </div>
                    <div className={styles.modoInfo}>
                        {(isEditing || isAdding) && (
                            <span className={styles.warningText}>
                                ⚠ {isAdding ? 'Agregando nuevo usuario' : 'Editando usuario'} - Recuerda guardar los cambios
                            </span>
                        )}
                    </div>
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
                <div className={styles.statsSection}>
                    <div className={styles.statsHeader}>
                        <h2>Total: {usuarios.length}</h2>
                        <div className={styles.statsDetails}>
                            <span 
                                className={`${styles.statActive} ${!showInactive ? styles.statSelected : ''}`}
                                onClick={handleToggleShowInactive}
                                style={{cursor: 'pointer'}}
                            >
                                Activos: {usuariosActivos}
                            </span>
                            <span 
                                className={`${styles.statInactive} ${showInactive ? styles.statSelected : ''}`}
                                onClick={handleToggleShowInactive}
                                style={{cursor: 'pointer'}}
                            >
                                Inactivos: {usuariosInactivos}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.filterInfo}>
                    {showInactive ? (
                        <span>Mostrando todos los usuarios (activos e inactivos)</span>
                    ) : (
                        <span>Mostrando solo usuarios activos</span>
                    )}
                    {(isEditing || isAdding) && (
                        <span className={styles.editingWarning}>
                            • Modo edición activo
                        </span>
                    )}
                </div>

                <div className={styles.tableContainer}>
                    {loading ? (
                        <p className={styles.loading}>Cargando usuarios...</p>
                    ) : usuarios.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '3rem'}}>
                            <p style={{fontSize: '1.2rem', color: '#dc3545'}}>No hay usuarios registrados</p>
                        </div>
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
                                {isAdding && (
                                    <tr className={`${styles.selectedRow} ${styles.editingRow}`}>
                                        <td>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    name="nombre"
                                                    value={usuarioData.nombre || ''}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    className={`${styles.editInput} ${formErrors.nombre ? styles.inputError : ''}`}
                                                    placeholder="Nombre *"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                {formErrors.nombre && <span className={styles.errorText}>{formErrors.nombre}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    name="apellidoPaterno"
                                                    value={usuarioData.apellidoPaterno || ''}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    className={`${styles.editInput} ${formErrors.apellidoPaterno ? styles.inputError : ''}`}
                                                    placeholder="Apellido Paterno *"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                {formErrors.apellidoPaterno && <span className={styles.errorText}>{formErrors.apellidoPaterno}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    name="apellidoMaterno"
                                                    value={usuarioData.apellidoMaterno || ''}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    className={`${styles.editInput} ${formErrors.apellidoMaterno ? styles.inputError : ''}`}
                                                    placeholder="Apellido Materno"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                {formErrors.apellidoMaterno && <span className={styles.errorText}>{formErrors.apellidoMaterno}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="email"
                                                    name="correo"
                                                    value={usuarioData.correo || ''}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    className={`${styles.editInput} ${formErrors.correo ? styles.inputError : ''}`}
                                                    placeholder="correo@ejemplo.com *"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                {formErrors.correo && <span className={styles.errorText}>{formErrors.correo}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    name="rol"
                                                    value={usuarioData.rol || ''}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    className={`${styles.editSelect} ${formErrors.rol ? styles.inputError : ''}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <option value="">Seleccionar rol *</option>
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
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="date"
                                                    name="fechaIngreso"
                                                    value={usuarioData.fechaIngreso || ''}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    className={`${styles.editInput} ${formErrors.fechaIngreso ? styles.inputError : ''}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                {formErrors.fechaIngreso && <span className={styles.errorText}>{formErrors.fechaIngreso}</span>}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                
                                {filteredUsuarios.map(usuario => (
                                    <tr 
                                        key={usuario.numEmpleado}
                                        onClick={() => handleSelectUsuario(usuario)}
                                        className={`${selectedUsuario?.numEmpleado === usuario.numEmpleado ? styles.selectedRow : ''} ${!usuario.activo ? styles.inactiveRow : ''} ${isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? styles.editingRow : ''}`}
                                    >
                                        <td>
                                            {isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        name="nombre"
                                                        value={usuarioData.nombre || ''}
                                                        onChange={handleInputChange}
                                                        onBlur={handleInputBlur}
                                                        className={`${styles.editInput} ${formErrors.nombre ? styles.inputError : ''}`}
                                                        placeholder="Nombre *"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    {formErrors.nombre && <span className={styles.errorText}>{formErrors.nombre}</span>}
                                                </div>
                                            ) : (
                                                usuario.nombre
                                            )}
                                        </td>

                                        <td>
                                            {isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        name="apellidoPaterno"
                                                        value={usuarioData.apellidoPaterno || ''}
                                                        onChange={handleInputChange}
                                                        onBlur={handleInputBlur}
                                                        className={`${styles.editInput} ${formErrors.apellidoPaterno ? styles.inputError : ''}`}
                                                        placeholder="Apellido Paterno *"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    {formErrors.apellidoPaterno && <span className={styles.errorText}>{formErrors.apellidoPaterno}</span>}
                                                </div>
                                            ) : (
                                                usuario.apellidoPaterno
                                            )}
                                        </td>

                                        <td>
                                            {isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        name="apellidoMaterno"
                                                        value={usuarioData.apellidoMaterno || ''}
                                                        onChange={handleInputChange}
                                                        onBlur={handleInputBlur}
                                                        className={`${styles.editInput} ${formErrors.apellidoMaterno ? styles.inputError : ''}`}
                                                        placeholder="Apellido Materno"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    {formErrors.apellidoMaterno && <span className={styles.errorText}>{formErrors.apellidoMaterno}</span>}
                                                </div>
                                            ) : (
                                                usuario.apellidoMaterno
                                            )}
                                        </td>

                                        <td>
                                            {isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="email"
                                                        name="correo"
                                                        value={usuarioData.correo || ''}
                                                        onChange={handleInputChange}
                                                        onBlur={handleInputBlur}
                                                        className={`${styles.editInput} ${formErrors.correo ? styles.inputError : ''}`}
                                                        placeholder="correo@ejemplo.com *"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    {formErrors.correo && <span className={styles.errorText}>{formErrors.correo}</span>}
                                                </div>
                                            ) : (
                                                usuario.correo
                                            )}
                                        </td>

                                        <td>
                                            {isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        name="rol"
                                                        value={usuarioData.rol || ''}
                                                        onChange={handleInputChange}
                                                        onBlur={handleInputBlur}
                                                        className={`${styles.editSelect} ${formErrors.rol ? styles.inputError : ''}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <option value="">Seleccionar rol *</option>
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

                                        <td>
                                            <span 
                                                className={`${styles.estado} ${usuario.activo ? styles.activo : styles.inactivo} ${styles.clickableEstado}`}
                                                onClick={(e) => handleToggleStatus(usuario, e)}
                                                title={`Clic para ${usuario.activo ? 'desactivar' : 'activar'}`}
                                            >
                                                {usuario.activo ? '☑ Activo' : '☐ Inactivo'}
                                            </span>
                                        </td>

                                        <td>
                                            {isEditing && selectedUsuario?.numEmpleado === usuario.numEmpleado ? (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="date"
                                                        name="fechaIngreso"
                                                        value={usuarioData.fechaIngreso || ''}
                                                        onChange={handleInputChange}
                                                        onBlur={handleInputBlur}
                                                        className={`${styles.editInput} ${formErrors.fechaIngreso ? styles.inputError : ''}`}
                                                        onClick={(e) => e.stopPropagation()}
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

                {(isEditing || isAdding) && selectedUsuario && (
                    <div className={styles.additionalFields}>
                        <h3>Información Adicional {isAdding && '(Nuevo Usuario)'}</h3>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Contraseña {isAdding ? '(Obligatoria)' : '(Opcional - dejar vacío para no cambiar)'}</label>
                                <input
                                    type="password"
                                    name="contrasena"
                                    value={usuarioData.contrasena || ''}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    className={`${styles.editInput} ${formErrors.contrasena ? styles.inputError : ''}`}
                                    placeholder="Nueva contraseña"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {formErrors.contrasena && <span className={styles.errorText}>{formErrors.contrasena}</span>}
                                {!formErrors.contrasena && (
                                    <span className={styles.helperText}>
                                        Mínimo 6 caracteres
                                    </span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Pregunta de Seguridad *</label>
                                <input
                                    type="text"
                                    name="preguntaRecuperacion"
                                    value={usuarioData.preguntaRecuperacion || ''}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    className={`${styles.editInput} ${formErrors.preguntaRecuperacion ? styles.inputError : ''}`}
                                    placeholder="Ej: ¿Cuál es tu color favorito?"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {formErrors.preguntaRecuperacion && <span className={styles.errorText}>{formErrors.preguntaRecuperacion}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Respuesta de Seguridad *</label>
                                <input
                                    type="text"
                                    name="respuestaRecuperacion"
                                    value={usuarioData.respuestaRecuperacion || ''}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    className={`${styles.editInput} ${formErrors.respuestaRecuperacion ? styles.inputError : ''}`}
                                    placeholder="Respuesta a la pregunta"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {formErrors.respuestaRecuperacion && <span className={styles.errorText}>{formErrors.respuestaRecuperacion}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Firma Digital (Opcional)</label>
                                <div className={styles.signatureSection}>
                                    <button 
                                        type="button" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddSignature();
                                        }}
                                        className={styles.btnFirma}
                                    >
                                        📎 Agregar Firma
                                    </button>
                                    {usuarioData.firma && (
                                        <div>
                                            <span className={styles.fileName}>{usuarioData.firma}</span>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUsuarioData(prev => ({ ...prev, firma: '' }));
                                                    showNotification("Firma removida", 'info');
                                                }}
                                                className={styles.btnRemoverFirma}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                    {formErrors.firma && <span className={styles.errorText}>{formErrors.firma}</span>}
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
                        <button 
                            onClick={handleModificarClick} 
                            className={styles.btnModificar}
                            disabled={!selectedUsuario}
                        >
                            Modificar
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