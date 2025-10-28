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
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 5000);
    };

    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    // Función para mapear Id_Rol a tipo de usuario
    const mapearRolDesdeId = (idRol) => {
        const mapeoRoles = {
            1: 'administrador',
            2: 'instructor', 
            3: 'secretaria'
        };
        return mapeoRoles[idRol] || 'instructor'; // Por defecto instructor
    };

    // Mapeo completo de usuarios basado en tu base de datos
    const obtenerUsuarioPorEmail = (email) => {
        const usuarios = {
            // Administradores (Id_Rol: 1)
            'juan.perez@example.com': { 
                id: 2, 
                nombre: 'Juan Perez', 
                id_rol: 1,
                rol: 'administrador'
            },
            'carlos.perez@example.com': { 
                id: 63, 
                nombre: 'Carlos Perez', 
                id_rol: 1,
                rol: 'administrador'
            },
            'a@a.com': { 
                id: 54, 
                nombre: 'Administrador', 
                id_rol: 1,
                rol: 'administrador'
            },

            // Instructores (Id_Rol: 2)
            'armando.becerra@beyco.com': { 
                id: 1, 
                nombre: 'Armando Becerra', 
                id_rol: 2,
                rol: 'instructor'
            },
            'ana.solis@example.com': { 
                id: 3, 
                nombre: 'Ana Solis', 
                id_rol: 2,
                rol: 'instructor'
            },
            'ana.garcia@beyco.com': { 
                id: 6, 
                nombre: 'Ana Reyes', 
                id_rol: 2,
                rol: 'instructor'
            },
            'david.moreno@beyco.com': { 
                id: 12, 
                nombre: 'David Moreno', 
                id_rol: 2,
                rol: 'instructor'
            },
            'b@b.com': { 
                id: 55, 
                nombre: 'Instructor', 
                id_rol: 2,
                rol: 'instructor'
            },

            // Secretarias (Id_Rol: 3)
            'sofia.reyes@beyco.com': { 
                id: 4, 
                nombre: 'Sofia Reyes', 
                id_rol: 3,
                rol: 'secretaria'
            },
            'c@c.com': { 
                id: 56, 
                nombre: 'Carla Carranza', 
                id_rol: 3,
                rol: 'secretaria'
            }
        };
        
        // Si el usuario existe en el mapeo, usamos sus datos
        if (usuarios[email]) {
            return usuarios[email];
        }
        
        // Para usuarios no mapeados, determinar por email o usar por defecto
        let id_rol = 2; // Por defecto instructor
        let nombre = email.split('@')[0];
        
        if (email.includes('admin') || email.includes('administrador')) {
            id_rol = 1;
        } else if (email.includes('secretaria')) {
            id_rol = 3;
        }
        
        return { 
            id: 1, 
            nombre: nombre, 
            id_rol: id_rol,
            rol: mapearRolDesdeId(id_rol)
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const form = e.target;
        form.setAttribute('novalidate', 'true');
        
        setLoading(true);

        // Validación básica personalizada
        if (!correo.trim() || !contrasena.trim()) {
            showNotification('Por favor, completa todos los campos', 'warning');
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            showNotification('Por favor, ingresa un correo electrónico válido', 'warning');
            setLoading(false);
            return;
        }

        // MODO DESARROLLO
        console.log('🔄 Modo desarrollo - Login con:', correo);

        // Obtener datos del usuario basado en email
        const usuario = obtenerUsuarioPorEmail(correo);
        const userRole = usuario.rol;
        const userName = usuario.nombre;
        const userId = usuario.id;
        const userRolId = usuario.id_rol;

        console.log(`👤 Usuario: ${userName}`);
        console.log(`🎯 ID Rol: ${userRolId} -> Tipo: ${userRole}`);
        console.log(`🔑 ID Usuario: ${userId}`);

        // Simular respuesta exitosa
        showNotification(`¡Bienvenido ${userName}!`, 'success');

        setTimeout(() => {
            const userData = {
                id: userId,
                num_empleado: userId,
                name: userName,
                email: correo,
                role: userRole,
                id_rol: userRolId
            };
            
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log('💾 User data guardado:', userData);
            
            // Redirigir según el rol basado en Id_Rol
            switch (userRole.toLowerCase()) {
                case 'administrador':
                    console.log('👑 Redirigiendo a panel de administrador');
                    router.push('/admin');
                    break;
                case 'instructor':
                    console.log('🎓 Redirigiendo a dashboard de instructor');
                    router.push('/instructor/dashboard');
                    break;
                case 'secretaria':
                    console.log('📋 Redirigiendo a panel de secretaria');
                    router.push('/secretaria');
                    break;
                default:
                    console.log('❓ Rol no reconocido, usando instructor por defecto');
                    router.push('/instructor/dashboard');
            }
        }, 1500);
        
        setLoading(false);
        return;
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        e.target.setCustomValidity('');
    };

    return (
        <div className={styles.container}>
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
                
                <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.inputGroup}>
                        <label htmlFor="correo">Correo Electrónico</label>
                        <input 
                            id="correo" 
                            type="email" 
                            value={correo} 
                            onChange={handleInputChange(setCorreo)}
                            onInvalid={(e) => e.preventDefault()}
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
                            onInvalid={(e) => e.preventDefault()}
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