'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PasswordRecovery.module.css';
import Link from 'next/link';

export default function PasswordRecoveryPage() {
    const [step, setStep] = useState(1); // 1: Pedir correo, 2: Pregunta, 3: Nueva contraseña
    const [email, setEmail] = useState('');
    const [pregunta, setPregunta] = useState('');
    const [respuesta, setRespuesta] = useState('');
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const router = useRouter();

    // Sistema de notificaciones
    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 5000);
    };

    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Validación de email
        if (!email.trim()) {
            showNotification('Por favor, ingresa tu correo electrónico', 'warning');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/api/usuarios/pregunta-seguridad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: email }),
            });
            
            if (res.ok) {
                const data = await res.json();
                setPregunta(data.pregunta);
                setStep(2);
                showNotification('Pregunta de seguridad encontrada', 'success');
            } else {
                const errorText = await res.text();
                showNotification('Correo no encontrado en el sistema', 'error');
            }
        } catch (err) {
            showNotification('Error de conexión. Verifica tu internet.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRespuestaSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (!respuesta.trim()) {
            showNotification('Por favor, ingresa tu respuesta', 'warning');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/api/usuarios/verificar-respuesta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: email, respuesta: respuesta }),
            });
            
            if (res.ok) {
                setStep(3);
                showNotification('Respuesta verificada correctamente', 'success');
            } else {
                const errorText = await res.text();
                showNotification('Respuesta incorrecta', 'error');
            }
        } catch (err) {
            showNotification('Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdateSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!nuevaContrasena || !confirmarContrasena) {
            showNotification('Por favor, completa ambos campos de contraseña', 'warning');
            return;
        }

        if (nuevaContrasena !== confirmarContrasena) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        if (nuevaContrasena.length < 6) {
            showNotification('La contraseña debe tener al menos 6 caracteres', 'warning');
            return;
        }

        setLoading(true);
        
        try {
            const res = await fetch('http://localhost:8080/api/usuarios/actualizar-contrasena', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: email, nuevaContrasena: nuevaContrasena }),
            });
            
            if (res.ok) {
                showNotification('Contraseña actualizada con éxito. Serás redirigido al login.', 'success');
                
                // Redirigir después de 3 segundos
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } else {
                const errorText = await res.text();
                showNotification('Error al actualizar la contraseña', 'error');
            }
        } catch (err) {
            showNotification('Error de conexión al actualizar la contraseña', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleEmailSubmit} noValidate>
                        <h2>¿No recuerdas tu contraseña?</h2>
                        <p>Ingresa tu correo para recuperar tu cuenta.</p>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Correo electrónico</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="tu.correo@beyco.com"
                                required 
                            />
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Buscando...' : 'Continuar'}
                        </button>
                    </form>
                );
            case 2:
                return (
                    <form onSubmit={handleRespuestaSubmit} noValidate>
                        <h2>Pregunta de seguridad</h2>
                        <p className={styles.pregunta}>{pregunta}</p>
                        <div className={styles.inputGroup}>
                            <label htmlFor="respuesta">Respuesta</label>
                            <input 
                                type="text" 
                                id="respuesta" 
                                value={respuesta} 
                                onChange={(e) => setRespuesta(e.target.value)} 
                                placeholder="Tu respuesta de seguridad"
                                required 
                            />
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Verificando...' : 'Continuar'}
                        </button>
                    </form>
                );
            case 3:
                return (
                    <form onSubmit={handlePasswordUpdateSubmit} noValidate>
                        <h2>Actualiza tu contraseña</h2>
                        <p>Crea una nueva contraseña.</p>
                        <div className={styles.inputGroup}>
                            <label htmlFor="nuevaContrasena">Nueva contraseña</label>
                            <input 
                                type="password" 
                                id="nuevaContrasena" 
                                value={nuevaContrasena} 
                                onChange={(e) => setNuevaContrasena(e.target.value)} 
                                placeholder="Mínimo 6 caracteres"
                                required 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmarContrasena">Confirmar contraseña</label>
                            <input 
                                type="password" 
                                id="confirmarContrasena" 
                                value={confirmarContrasena} 
                                onChange={(e) => setConfirmarContrasena(e.target.value)} 
                                placeholder="Repite tu contraseña"
                                required 
                            />
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Actualizando...' : 'Confirmar contraseña'}
                        </button>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.pageContainer}>
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

            <div className={styles.sidePanel}>
                <img src="/logo.jpg" alt="BEYCO Logo" />
            </div>
            <div className={styles.formPanel}>
                {renderStep()}
                <Link href="/" className={styles.backLink}>Atrás</Link>
            </div>
        </div>
    );
}