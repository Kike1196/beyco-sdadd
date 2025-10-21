'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginPage.module.css';
import Link from 'next/link';

const BACKEND_URL = 'http://localhost:8080';

export default function LoginPage() {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const router = useRouter();

    // Función para mostrar notificaciones
    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 5000);
    };

    // Función para cerrar notificación manualmente
    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevenir propagación
        
        // Prevenir completamente el comportamiento por defecto del formulario
        const form = e.target;
        form.setAttribute('novalidate', 'true'); // Deshabilitar validación HTML5
        
        setLoading(true);

        // Validación básica personalizada
        if (!correo.trim() || !contrasena.trim()) {
            showNotification('Por favor, completa todos los campos', 'warning');
            setLoading(false);
            return;
        }

        // Validación de email básica
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            showNotification('Por favor, ingresa un correo electrónico válido', 'warning');
            setLoading(false);
            return;
        }

        try {
            const loginUrl = `${BACKEND_URL}/api/usuarios/login`;
            
            const requestBody = {
                usuario: correo,
                contrasena: contrasena
            };

            console.log('📤 Enviando:', { ...requestBody, contrasena: '***' });
            
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('📨 Status:', response.status);

            if (response.ok) {
                const userData = await response.json();
                console.log('✅ Login exitoso:', userData);
                
                // Mostrar notificación de éxito
                showNotification(`¡Bienvenido ${userData.name}!`, 'success');
                
                // Esperar un momento antes de redirigir para que se vea la notificación
                setTimeout(() => {
                    localStorage.setItem('userData', JSON.stringify(userData));
                    
                    const userRole = userData.role?.toLowerCase();
                    switch (userRole) {
                        case 'administrador':
                            router.push('/admin');
                            break;
                        case 'instructor':
                            router.push('/instructor');
                            break;
                        case 'secretaria':
                            router.push('/secretaria');
                            break;
                        default:
                            showNotification('Rol no reconocido.', 'error');
                    }
                }, 1500);
                
            } else {
                const errorText = await response.text();
                console.error('❌ Error del servidor:', errorText);
                
                // Mensajes de error más amigables
                let friendlyMessage = 'Error al iniciar sesión';
                
                try {
                    // Intentar parsear como JSON primero
                    const errorData = JSON.parse(errorText);
                    friendlyMessage = errorData.message || errorData.error || friendlyMessage;
                } catch {
                    // Si no es JSON, usar el texto directamente pero limpiarlo
                    if (errorText.includes('UNAUTHORIZED') || response.status === 401) {
                        friendlyMessage = 'Correo electrónico o contraseña incorrectos';
                    } else if (errorText.includes('NOT_FOUND') || response.status === 404) {
                        friendlyMessage = 'El servicio no está disponible en este momento';
                    } else if (response.status >= 500) {
                        friendlyMessage = 'Error del servidor. Por favor, intenta más tarde';
                    } else {
                        // Limpiar mensajes HTML o técnicos
                        friendlyMessage = errorText.length > 100 ? 
                            'Error al procesar la solicitud' : errorText;
                    }
                }
                
                showNotification(friendlyMessage, 'error');
            }
            
        } catch (err) {
            console.error('💥 Error de conexión:', err);
            if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
                showNotification('No se puede conectar al servidor. Verifica tu conexión a internet.', 'error');
            } else {
                showNotification('Error inesperado. Por favor, intenta nuevamente.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Manejar cambios en los inputs para resetear cualquier estado de validación
    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        // Remover cualquier estado de error del navegador
        e.target.setCustomValidity('');
    };

    return (
        <div className={styles.container}>
            {/* Sistema de Notificaciones Personalizadas */}
            {notification.show && (
                <div className={`${styles.notification} ${styles[`notification${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`]}`}>
                    <div className={styles.notificationContent}>
                        <span className={styles.notificationIcon}>
                            {notification.type === 'success' && '✓'}
                            {notification.type === 'error' && '✕'}
                            {notification.type === 'warning' && '⚠'}
                        </span>
                        <span className={styles.notificationMessage}>
                            {notification.message}
                        </span>
                        <button 
                            className={styles.notificationClose}
                            onClick={closeNotification}
                            type="button"
                            aria-label="Cerrar notificación"
                        >
                            ×
                        </button>
                    </div>
                    <div className={styles.notificationProgress}></div>
                </div>
            )}

            <div className={styles.loginBox}>
                <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
                <h1 className={styles.title}>¡Bienvenido!</h1>
                
                {/* Form sin validación HTML5 */}
                <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.inputGroup}>
                        <label htmlFor="correo">Correo Electrónico</label>
                        <input 
                            id="correo" 
                            type="email" 
                            value={correo} 
                            onChange={handleInputChange(setCorreo)}
                            onInvalid={(e) => e.preventDefault()} // Prevenir validación HTML5
                            placeholder=""
                            required 
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="contrasena">Contraseña</label>
                        <input 
                            id="contrasena" 
                            type="password" 
                            value={contrasena} 
                            onChange={handleInputChange(setContrasena)}
                            onInvalid={(e) => e.preventDefault()} // Prevenir validación HTML5
                            placeholder=""
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        className={styles.loginButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className={styles.loadingText}>
                                <span className={styles.spinner}></span>
                                Iniciando sesión...
                            </span>
                        ) : (
                            'Iniciar sesión'
                        )}
                    </button>
                </form>
                <Link href="/recuperar-contrasena" className={styles.forgotPassword}>
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>
        </div>
    );
}