// app/recuperar-contrasena/page.js - VERSIÓN CON DISEÑO PROFESIONAL
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PasswordRecovery.module.css';
import Link from 'next/link';

export default function PasswordRecoveryPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [pregunta, setPregunta] = useState('');
    const [respuesta, setRespuesta] = useState('');
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const router = useRouter();

    const API_BASE_URL = 'http://localhost:8080';

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
        
        if (!email.trim()) {
            showNotification('Por favor, ingresa tu correo electrónico', 'warning');
            setLoading(false);
            return;
        }

        try {
            console.log('🔍 Buscando pregunta para:', email);
            
            const res = await fetch(`${API_BASE_URL}/api/usuarios/pregunta-seguridad`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: email }),
            });
            
            const data = await res.json();
            console.log('📊 Respuesta del backend:', data);
            
            if (data.success) {
                setPregunta(data.pregunta);
                setStep(2);
                showNotification('Pregunta de seguridad encontrada', 'success');
            } else {
                showNotification(data.error || 'Correo no encontrado', 'error');
            }
        } catch (err) {
            console.error('❌ Error de conexión:', err);
            showNotification('Error de conexión con el servidor', 'error');
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
            const res = await fetch(`${API_BASE_URL}/api/usuarios/verificar-respuesta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    correo: email, 
                    respuesta: respuesta 
                }),
            });
            
            const data = await res.json();
            
            if (data.success) {
                setStep(3);
                showNotification('Respuesta verificada correctamente', 'success');
            } else {
                showNotification(data.error || 'Respuesta incorrecta', 'error');
            }
        } catch (err) {
            console.error('Error de conexión:', err);
            showNotification('Error de conexión con el servidor', 'error');
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
            const res = await fetch(`${API_BASE_URL}/api/usuarios/actualizar-contrasena`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    correo: email, 
                    nuevaContrasena: nuevaContrasena 
                }),
            });
            
            const data = await res.json();
            
            if (data.success) {
                showNotification('Contraseña actualizada con éxito. Serás redirigido al login.', 'success');
                
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } else {
                showNotification(data.error || 'Error al actualizar la contraseña', 'error');
            }
        } catch (err) {
            console.error('Error de conexión:', err);
            showNotification('Error de conexión al actualizar la contraseña', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleEmailSubmit} className={styles.recoveryForm}>
                        <div className={styles.formHeader}>
                            <h2>Recuperar Contraseña</h2>
                            <p>Ingresa tu correo electrónico para comenzar el proceso de recuperación</p>
                        </div>
                        
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.inputLabel}>Correo electrónico</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="usuario@ejemplo.com"
                                className={styles.formInput}
                                required 
                            />
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? (
                                <span className={styles.loadingText}>
                                    <span className={styles.spinner}></span>
                                    Buscando...
                                </span>
                            ) : (
                                'Continuar'
                            )}
                        </button>
                    </form>
                );
            case 2:
                return (
                    <form onSubmit={handleRespuestaSubmit} className={styles.recoveryForm}>
                        <div className={styles.formHeader}>
                            <h2>Pregunta de Seguridad</h2>
                            <p>Responde la siguiente pregunta para verificar tu identidad</p>
                        </div>
                        
                        <div className={styles.preguntaContainer}>
                            <div className={styles.preguntaLabel}>Tu pregunta de seguridad:</div>
                            <div className={styles.preguntaText}>"{pregunta}"</div>
                        </div>
                        
                        <div className={styles.inputGroup}>
                            <label htmlFor="respuesta" className={styles.inputLabel}>Tu respuesta</label>
                            <input 
                                type="text" 
                                id="respuesta" 
                                value={respuesta} 
                                onChange={(e) => setRespuesta(e.target.value)} 
                                placeholder="Escribe tu respuesta aquí"
                                className={styles.formInput}
                                required 
                            />
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? (
                                <span className={styles.loadingText}>
                                    <span className={styles.spinner}></span>
                                    Verificando...
                                </span>
                            ) : (
                                'Continuar'
                            )}
                        </button>
                    </form>
                );
            case 3:
                return (
                    <form onSubmit={handlePasswordUpdateSubmit} className={styles.recoveryForm}>
                        <div className={styles.formHeader}>
                            <h2>Nueva Contraseña</h2>
                            <p>Crea una nueva contraseña segura para tu cuenta</p>
                        </div>
                        
                        <div className={styles.inputGroup}>
                            <label htmlFor="nuevaContrasena" className={styles.inputLabel}>Nueva contraseña</label>
                            <input 
                                type="password" 
                                id="nuevaContrasena" 
                                value={nuevaContrasena} 
                                onChange={(e) => setNuevaContrasena(e.target.value)} 
                                placeholder="Mínimo 6 caracteres"
                                className={styles.formInput}
                                required 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmarContrasena" className={styles.inputLabel}>Confirmar contraseña</label>
                            <input 
                                type="password" 
                                id="confirmarContrasena" 
                                value={confirmarContrasena} 
                                onChange={(e) => setConfirmarContrasena(e.target.value)} 
                                placeholder="Repite tu contraseña"
                                className={styles.formInput}
                                required 
                            />
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? (
                                <span className={styles.loadingText}>
                                    <span className={styles.spinner}></span>
                                    Actualizando...
                                </span>
                            ) : (
                                'Confirmar contraseña'
                            )}
                        </button>
                    </form>
                );
            default:
                return null;
        }
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
            </header>

            <main className={styles.mainContent}>
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

                <div className={styles.recoveryContainer}>
                    <div className={styles.recoveryCard}>
                        {/* Indicador de progreso */}
                        <div className={styles.progressIndicator}>
                            <div className={styles.progressSteps}>
                                <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ''}`}>
                                    <span className={styles.stepNumber}>1</span>
                                    <span className={styles.stepLabel}>Email</span>
                                </div>
                                <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`}>
                                    <span className={styles.stepNumber}>2</span>
                                    <span className={styles.stepLabel}>Verificación</span>
                                </div>
                                <div className={`${styles.progressStep} ${step >= 3 ? styles.active : ''}`}>
                                    <span className={styles.stepNumber}>3</span>
                                    <span className={styles.stepLabel}>Contraseña</span>
                                </div>
                            </div>
                        </div>

                        {renderStep()}

                        <div className={styles.recoveryFooter}>
                            <Link href="/" className={styles.backLink}>
                                ← Volver al inicio de sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}