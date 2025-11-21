// app/page.js - LOGIN CON CONEXIÓN A BASE DE DATOS
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginPage.module.css';
import Link from 'next/link';

const BACKEND_URL = 'http://localhost:8080';

// Componente de Notificación (mantener igual)
const NotificationToast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icon = { 
        success: '✓', 
        error: '✕', 
        warning: '⚠', 
        info: 'ℹ' 
    };

    return (
        <div className={`${styles.notification} ${styles[`notification${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
            <div className={styles.notificationContent}>
                <span className={styles.notificationIcon}>
                    {icon[type]}
                </span>
                <span className={styles.notificationMessage}>
                    {message}
                </span>
                <button 
                    className={styles.notificationClose}
                    onClick={onClose}
                    type="button"
                    aria-label="Cerrar notificación"
                >
                    ×
                </button>
            </div>
            <div className={styles.notificationProgress}></div>
        </div>
    );
};

export default function LoginPage() {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [formErrors, setFormErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockTime, setLockTime] = useState(0);
    const [backendStatus, setBackendStatus] = useState('checking'); // checking, online, offline
    const router = useRouter();

    // ✅ VERIFICAR CONEXIÓN CON EL BACKEND
    useEffect(() => {
        const checkBackendConnection = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/health`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 5000
                });
                
                if (response.ok) {
                    setBackendStatus('online');
                } else {
                    setBackendStatus('offline');
                }
            } catch (error) {
                console.error('❌ Error conectando con el backend:', error);
                setBackendStatus('offline');
                showNotification('No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.', 'error');
            }
        };

        checkBackendConnection();
    }, []);

    // ✅ VALIDACIONES COMPLETAS (mantener igual)
    const validaciones = {
        correo: (email) => {
            if (!email?.trim()) {
                return { valido: false, mensaje: 'El correo electrónico es obligatorio' };
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { valido: false, mensaje: 'El formato del correo electrónico no es válido' };
            }
            
            if (email.length > 100) {
                return { valido: false, mensaje: 'El correo electrónico no puede exceder 100 caracteres' };
            }

            return { valido: true, mensaje: '' };
        },

        contrasena: (password) => {
            if (!password?.trim()) {
                return { valido: false, mensaje: 'La contraseña es obligatoria' };
            }
            
            if (password.length < 6) {
                return { valido: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
            }
            
            if (password.length > 50) {
                return { valido: false, mensaje: 'La contraseña no puede exceder 50 caracteres' };
            }

            const caracteresPeligrosos = /[<>"'`]/;
            if (caracteresPeligrosos.test(password)) {
                return { 
                    valido: false, 
                    mensaje: 'La contraseña contiene caracteres no permitidos' 
                };
            }

            return { valido: true, mensaje: '' };
        },

        intentos: (intentosActuales) => {
            if (intentosActuales >= 5) {
                return { 
                    valido: false, 
                    mensaje: 'Demasiados intentos fallidos. Intenta nuevamente en 15 minutos.' 
                };
            }
            return { valido: true, mensaje: '' };
        }
    };

    // Función para mostrar notificaciones
    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
    };

    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    // ✅ VALIDACIÓN EN TIEMPO REAL (mantener igual)
    const validateField = (name, value) => {
        switch (name) {
            case 'correo':
                return validaciones.correo(value);
            case 'contrasena':
                return validaciones.contrasena(value);
            default:
                return { valido: true, mensaje: '' };
        }
    };

    // ✅ MANEJO DE BLOQUEO POR INTENTOS FALLIDOS (mantener igual)
    useEffect(() => {
        const checkLockStatus = () => {
            const lockData = localStorage.getItem('loginLock');
            if (lockData) {
                const { timestamp, attempts } = JSON.parse(lockData);
                const now = Date.now();
                const timeDiff = now - timestamp;
                const lockDuration = 5 * 60 * 1000; // 15 minutos

                if (timeDiff < lockDuration) {
                    setIsLocked(true);
                    setLockTime(Math.ceil((lockDuration - timeDiff) / 1000 / 60));
                    setAttempts(attempts);
                } else {
                    localStorage.removeItem('loginLock');
                    setIsLocked(false);
                    setAttempts(0);
                }
            }
        };

        checkLockStatus();
        const interval = setInterval(checkLockStatus, 60000);

        return () => clearInterval(interval);
    }, []);

    // ✅ MANEJAR BLOQUEO TEMPORAL (mantener igual)
    const handleFailedAttempt = () => {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 5) {
            const lockData = {
                timestamp: Date.now(),
                attempts: newAttempts
            };
            localStorage.setItem('loginLock', JSON.stringify(lockData));
            setIsLocked(true);
            setLockTime(15);
            showNotification('Demasiados intentos fallidos. Tu cuenta está bloqueada por 15 minutos.', 'error');
        } else if (newAttempts >= 3) {
            showNotification(`¡Cuidado! Llevas ${newAttempts} intentos fallidos. Después de 5 intentos tu cuenta se bloqueará.`, 'warning');
        }
    };

    // ✅ FUNCIÓN PARA VALIDAR CREDENCIALES CON EL BACKEND
    const validarCredencialesConBackend = async (email, password) => {
        if (backendStatus === 'offline') {
            return { 
                valido: false, 
                mensaje: 'Servidor no disponible. Intenta más tarde.' 
            };
        }

        try {
            console.log('🔐 Validando credenciales con backend...');
            
            const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correo: email,
                    contrasena: password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { 
                    valido: true, 
                    mensaje: '',
                    usuario: data.usuario
                };
            } else {
                return { 
                    valido: false, 
                    mensaje: data.message || 'Credenciales incorrectas'
                };
            }
        } catch (error) {
            console.error('❌ Error en la petición de login:', error);
            return { 
                valido: false, 
                mensaje: 'Error de conexión con el servidor. Verifica tu conexión.'
            };
        }
    };

    // ✅ VALIDACIÓN COMPLETA DEL FORMULARIO (mantener igual)
    const validateForm = () => {
        const errors = {};
        let hasErrors = false;

        const validacionCorreo = validateField('correo', correo);
        if (!validacionCorreo.valido) {
            errors.correo = validacionCorreo.mensaje;
            hasErrors = true;
        }

        const validacionContrasena = validateField('contrasena', contrasena);
        if (!validacionContrasena.valido) {
            errors.contrasena = validacionContrasena.mensaje;
            hasErrors = true;
        }

        if (isLocked) {
            errors.general = `Cuenta bloqueada. Intenta nuevamente en ${lockTime} minutos.`;
            hasErrors = true;
        }

        setFormErrors(errors);

        if (hasErrors) {
            const firstError = Object.values(errors)[0];
            showNotification(firstError, 'error');
            return false;
        }

        return true;
    };

    // ✅ MANEJAR CAMBIOS EN INPUTS (mantener igual)
    const handleInputChange = (setter, fieldName) => (e) => {
        const value = e.target.value;
        setter(value);
        
        setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
        
        if (touchedFields[fieldName]) {
            const validacion = validateField(fieldName, value);
            if (!validacion.valido) {
                setFormErrors(prev => ({ ...prev, [fieldName]: validacion.mensaje }));
            } else {
                setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
            }
        }
    };

    // ✅ MANEJAR BLUR PARA VALIDACIÓN (mantener igual)
    const handleInputBlur = (fieldName, value) => {
        setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
        
        const validacion = validateField(fieldName, value);
        if (!validacion.valido) {
            setFormErrors(prev => ({ ...prev, [fieldName]: validacion.mensaje }));
        } else {
            setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
        }
    };

    // ✅ MANEJAR ENVÍO DEL FORMULARIO (MODIFICADO PARA USAR BACKEND)
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        setLoading(true);

        // ✅ VALIDAR FORMULARIO COMPLETO
        if (!validateForm()) {
            setLoading(false);
            return;
        }

        // ✅ VALIDAR BLOQUEO TEMPORAL
        if (isLocked) {
            showNotification(`Cuenta temporalmente bloqueada. Intenta nuevamente en ${lockTime} minutos.`, 'error');
            setLoading(false);
            return;
        }

        console.log('🔄 Procesando login para:', correo);

        try {
            // ✅ VALIDAR CREDENCIALES CON BACKEND
            const validacionCredenciales = await validarCredencialesConBackend(correo, contrasena);
            
            if (!validacionCredenciales.valido) {
                handleFailedAttempt();
                showNotification(validacionCredenciales.mensaje, 'error');
                setLoading(false);
                return;
            }

            const usuario = validacionCredenciales.usuario;
            const userRole = usuario.rol || mapearRolDesdeId(usuario.id_rol);
            const userName = usuario.nombre;
            const userId = usuario.id;
            const userRolId = usuario.id_rol;

            console.log(`✅ Login exitoso: ${userName} (${userRole})`);

            // ✅ RESETEAR INTENTOS EN ÉXITO
            setAttempts(0);
            localStorage.removeItem('loginLock');

            // ✅ NOTIFICACIÓN DE ÉXITO
            showNotification(`¡Bienvenido ${userName}! Redirigiendo...`, 'success');

            // ✅ GUARDAR DATOS Y REDIRIGIR
            setTimeout(() => {
                const userData = {
                    id: userId,
                    num_empleado: usuario.num_empleado || userId,
                    name: userName,
                    email: correo,
                    role: userRole,
                    id_rol: userRolId,
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem('userData', JSON.stringify(userData));
                console.log('💾 Datos de usuario guardados:', userData);
                
                // ✅ REDIRECCIÓN SEGÚN ROL
                const rutas = {
                    'administrador': '/admin',
                    'instructor': '/instructor/dashboard',
                    'secretaria': '/secretaria'
                };
                
                const rutaDestino = rutas[userRole] || '/instructor/dashboard';
                console.log(`📍 Redirigiendo a: ${rutaDestino}`);
                router.push(rutaDestino);
                
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error en el login:', error);
            showNotification('Error interno del sistema. Por favor, intenta nuevamente.', 'error');
            handleFailedAttempt();
        } finally {
            setLoading(false);
        }
    };

    // ✅ FUNCIÓN AUXILIAR PARA MAPEAR ROLES
    const mapearRolDesdeId = (idRol) => {
        const mapeoRoles = {
            1: 'administrador',
            2: 'instructor', 
            3: 'secretaria'
        };
        return mapeoRoles[idRol] || 'instructor';
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header con azul oscuro */}
            <header className={styles.header}>
                <div className={styles.logoSection}>
                    <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
                    <div className={styles.logoText}>
                        <span className={styles.logoTitle}></span>
                        <span className={styles.logoSubtitle}></span>
                    </div>
                </div>
                
                {/* Indicador de estado del backend */}
                <div className={`${styles.backendStatus} ${styles[`backendStatus${backendStatus}`]}`}>
                    {backendStatus === 'online' && '🟢 Conectado'}
                    {backendStatus === 'offline' && '🔴 Sin conexión'}
                    {backendStatus === 'checking' && '🟡 Conectando...'}
                </div>
            </header>

            <main className={styles.mainContent}>
                {/* Notificación */}
                {notification.show && (
                    <NotificationToast 
                        message={notification.message}
                        type={notification.type}
                        onClose={closeNotification}
                    />
                )}

                <div className={styles.loginContainer}>
                    <div className={styles.loginCard}>
                        <div className={styles.loginHeader}>
                            <h1 className={styles.loginTitle}>Iniciar Sesión</h1>
                            <p className={styles.loginSubtitle}>Ingresa tus credenciales para acceder al sistema</p>
                            
                            {/* ✅ ALERTA DE BLOQUEO */}
                            {isLocked && (
                                <div className={styles.lockWarning}>
                                    ⚠️ Cuenta bloqueada temporalmente. 
                                    <br />
                                    Intenta nuevamente en <strong>{lockTime} minutos</strong>.
                                </div>
                            )}

                            {/* ✅ ALERTA DE BACKEND OFFLINE */}
                            {backendStatus === 'offline' && (
                                <div className={styles.backendOfflineWarning}>
                                    ⚠️ El servidor no está disponible. 
                                    <br />
                                    Verifica que el backend esté ejecutándose en {BACKEND_URL}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className={styles.loginForm}>
                            {/* Campo Correo */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="correo" className={styles.inputLabel}>
                                    Correo Electrónico *
                                </label>
                                <input 
                                    id="correo" 
                                    type="email" 
                                    value={correo} 
                                    onChange={handleInputChange(setCorreo, 'correo')}
                                    onBlur={() => handleInputBlur('correo', correo)}
                                    placeholder="usuario@ejemplo.com"
                                    className={`${styles.formInput} ${formErrors.correo ? styles.inputError : ''}`}
                                    disabled={isLocked || loading || backendStatus === 'offline'}
                                    required 
                                />
                                {formErrors.correo && (
                                    <span className={styles.errorText}>{formErrors.correo}</span>
                                )}
                            </div>

                            {/* Campo Contraseña */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="contrasena" className={styles.inputLabel}>
                                    Contraseña *
                                </label>
                                <input 
                                    id="contrasena" 
                                    type="password" 
                                    value={contrasena} 
                                    onChange={handleInputChange(setContrasena, 'contrasena')}
                                    onBlur={() => handleInputBlur('contrasena', contrasena)}
                                    placeholder="••••••••"
                                    className={`${styles.formInput} ${formErrors.contrasena ? styles.inputError : ''}`}
                                    disabled={isLocked || loading || backendStatus === 'offline'}
                                    required
                                />
                                {formErrors.contrasena && (
                                    <span className={styles.errorText}>{formErrors.contrasena}</span>
                                )}
                                <div className={styles.passwordHelper}>
                                    Mínimo 6 caracteres
                                </div>
                            </div>

                            {/* Contador de Intentos */}
                            {attempts > 0 && !isLocked && (
                                <div className={styles.attemptsWarning}>
                                    ⚠️ Intentos fallidos: {attempts}/5
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className={styles.loginButton}
                                disabled={loading || isLocked || backendStatus === 'offline'}
                            >
                                {loading ? (
                                    <span className={styles.loadingText}>
                                        <span className={styles.spinner}></span>
                                        Iniciando sesión...
                                    </span>
                                ) : isLocked ? (
                                    'Cuenta Bloqueada'
                                ) : backendStatus === 'offline' ? (
                                    'Servidor No Disponible'
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </button>
                        </form>

                        <div className={styles.loginFooter}>
                            <Link href="/recuperar-contrasena" className={styles.forgotPassword}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}