'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Evidencia.module.css';

// Componente de Notificación
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

// FUNCIONES PARA EL BACKEND SPRING BOOT - CORREGIDAS
const subirEvidenciaReal = async (formData) => {
    try {
        console.log('📤 Enviando evidencia al backend Spring Boot...');
        
        const response = await fetch('http://localhost:8080/api/evidencia/subir', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            let errorText;
            try {
                errorText = await response.text();
            } catch {
                errorText = `Error ${response.status}: ${response.statusText}`;
            }
            console.error('❌ Error del servidor:', errorText);
            throw new Error(errorText || `Error ${response.status}`);
        }

        const resultado = await response.json();
        console.log('✅ Evidencia subida exitosamente:', resultado);
        return resultado;
        
    } catch (error) {
        console.error('❌ Error subiendo evidencia:', error);
        throw new Error(`Error al subir la evidencia: ${error.message}`);
    }
};

// FUNCIÓN CORREGIDA PARA CARGAR EVIDENCIAS
const cargarEvidenciasReales = async (cursoId) => {
    try {
        console.log('🔄 Cargando evidencias para curso:', cursoId);
        
        const response = await fetch(`http://localhost:8080/api/evidencia/curso/${cursoId}`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const resultado = await response.json();
        console.log('✅ Respuesta completa del servidor:', resultado);
        
        // CORREGIDO: El backend devuelve {success: true, data: array, total: number}
        if (resultado.success && resultado.data) {
            console.log(`📊 Se encontraron ${resultado.data.length} evidencias para el curso ${cursoId}`);
            return resultado.data; // Devolver solo el array de evidencias
        } else {
            console.warn('⚠️ Respuesta inesperada del servidor:', resultado);
            return [];
        }
        
    } catch (error) {
        console.error('❌ Error cargando evidencias:', error);
        throw error;
    }
};

const descargarArchivoReal = async (idEvidencia, nombreArchivo) => {
    try {
        console.log('📥 Descargando archivo con ID:', idEvidencia);
        
        const response = await fetch(`http://localhost:8080/api/evidencia/descargar/${idEvidencia}`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo || `evidencia_${idEvidencia}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Archivo descargado exitosamente');
        
    } catch (error) {
        console.error('❌ Error descargando archivo:', error);
        throw new Error(`Error al descargar el archivo: ${error.message}`);
    }
};

    // FUNCIÓN CORREGIDA PARA ELIMINAR EVIDENCIAS
    const eliminarEvidenciaReal = async (idEvidencia) => {
        try {
            console.log('🗑️ Eliminando evidencia con ID:', idEvidencia);
            
            // ✅ CORREGIDO: Usar la URL correcta sin "/eliminar/"
            const response = await fetch(`http://localhost:8080/api/evidencia/${idEvidencia}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                let errorText;
                try {
                    const errorData = await response.json();
                    errorText = errorData.error || `Error ${response.status}: ${response.statusText}`;
                } catch {
                    errorText = `Error ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorText);
            }

            // Intentar parsear la respuesta como JSON
            try {
                const resultado = await response.json();
                console.log('✅ Evidencia eliminada exitosamente:', resultado);
                return resultado;
            } catch (jsonError) {
                // Si no hay contenido JSON, devolver éxito
                console.log('✅ Evidencia eliminada (respuesta vacía)');
                return { success: true, message: 'Evidencia eliminada correctamente' };
            }
            
        } catch (error) {
            console.error('❌ Error eliminando evidencia:', error);
            throw new Error(`Error al eliminar la evidencia: ${error.message}`);
        }
    };

// Modal para subir evidencias
const ModalSubirEvidencia = ({ curso, onClose, onEvidenciaSubida }) => {
    const [archivos, setArchivos] = useState([]);
    const [tipoEvidencia, setTipoEvidencia] = useState('foto');
    const [descripcion, setDescripcion] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [subiendo, setSubiendo] = useState(false);
    const [previewUrls, setPreviewUrls] = useState([]);

    const handleArchivoChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Limpiar previsualizaciones anteriores
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        
        setArchivos(files);
        
        // Generar URLs de previsualización
        const urls = files.map(file => {
            if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'application/pdf') {
                return URL.createObjectURL(file);
            }
            return null;
        });
        
        setPreviewUrls(urls);
    };

    // Limpiar URLs al desmontar
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [previewUrls]);

    const removeFile = (index) => {
        const newArchivos = [...archivos];
        const newPreviewUrls = [...previewUrls];
        
        if (newPreviewUrls[index]) {
            URL.revokeObjectURL(newPreviewUrls[index]);
        }
        
        newArchivos.splice(index, 1);
        newPreviewUrls.splice(index, 1);
        
        setArchivos(newArchivos);
        setPreviewUrls(newPreviewUrls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (archivos.length === 0) {
            alert('Por favor selecciona al menos un archivo');
            return;
        }

        if (archivos.length > 1) {
            alert('El sistema actualmente solo permite subir un archivo a la vez');
            return;
        }

        const maxFileSizeMB = 50;
        const archivo = archivos[0];
        
        if (archivo.size > maxFileSizeMB * 1024 * 1024) {
            alert(`El archivo excede el límite de ${maxFileSizeMB}MB.`);
            return;
        }

        const tipoPermitido = archivo.type.startsWith('image/') || 
                             archivo.type.startsWith('video/') || 
                             archivo.type === 'application/pdf';
        
        if (!tipoPermitido) {
            alert('Tipo de archivo no permitido. Solo se permiten imágenes, videos y PDF.');
            return;
        }

        setSubiendo(true);
        try {
            console.log('🚀 INICIANDO SUBIDA DE EVIDENCIA ====================');

            // CREAR FORM DATA CON LOS NOMBRES EXACTOS QUE ESPERA EL BACKEND
            const formData = new FormData();
            
            formData.append('archivo', archivo);
            formData.append('cursos_Id_Curso', curso.id.toString());
            formData.append('Tipo_Evidencia', tipoEvidencia);
            formData.append('Descripcion', descripcion);
            
            if (observaciones) {
                formData.append('Observaciones', observaciones);
            }

            console.log('🔍 VERIFICANDO FORM DATA ANTES DE ENVIAR:');
            for (let [key, value] of formData.entries()) {
                if (key === 'archivo') {
                    console.log(`  ${key}:`, {
                        nombre: value.name,
                        tamaño: value.size,
                        tipo: value.type
                    });
                } else {
                    console.log(`  ${key}:`, value);
                }
            }

            // LLAMADA AL BACKEND
            const resultado = await subirEvidenciaReal(formData);
            
            console.log('✅ RESULTADO DE LA SUBIDA:', resultado);

            if (resultado.success) {
                console.log('🎉 Evidencia subida y guardada exitosamente en el servidor');
                
                // Limpiar previsualizaciones
                previewUrls.forEach(url => URL.revokeObjectURL(url));
                setPreviewUrls([]);

                // Notificar éxito
                onEvidenciaSubida({
                    id: resultado.data?.idEvidencia || Math.random().toString(36).substr(2, 9),
                    cursoId: curso.id,
                    tipo: tipoEvidencia,
                    descripcion: descripcion,
                    archivo: archivo.name,
                    fecha: new Date().toISOString(),
                    subidoPor: 'Tú'
                });

                onClose();
            } else {
                throw new Error(resultado.error || 'Error desconocido del servidor');
            }
            
        } catch (error) {
            console.error('💥 ERROR DETALLADO EN handleSubmit:', error);
            
            let mensajeError = 'Error al subir la evidencia: ';
            
            if (error.message.includes('400')) {
                mensajeError += 'Datos inválidos. Revisa que todos los campos estén completos.';
            } else if (error.message.includes('500')) {
                mensajeError += 'Error interno del servidor. Contacta al administrador.';
            } else if (error.message.includes('Failed to fetch')) {
                mensajeError += 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else {
                mensajeError += error.message;
            }
            
            alert(mensajeError + '\n\nRevisa la consola para más detalles.');
        } finally {
            setSubiendo(false);
        }
    };

    const getTipoDisplay = (tipo) => {
        const tipos = {
            'foto': 'Fotografía',
            'video': 'Video', 
            'documento': 'Documento',
            'lista_asistencia': 'Lista de Asistencia'
        };
        return tipos[tipo] || tipo;
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={`${styles.modalContent} ${styles.modalWithScroll}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div>
                        <h3>Subir Evidencias</h3>
                        <p className={styles.cursoNombreModal}>{curso.nombre}</p>
                    </div>
                    <button className={styles.modalClose} onClick={onClose}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className={styles.evidenciaForm}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Tipo de Evidencia:</label>
                            <select 
                                value={tipoEvidencia} 
                                onChange={(e) => setTipoEvidencia(e.target.value)}
                                className={styles.selectInput}
                                required
                            >
                                <option value="foto">Fotografía</option>
                                <option value="video">Video</option>
                                <option value="documento">Documento</option>
                                <option value="lista_asistencia">Lista de asistencia</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Descripción:</label>
                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Describe la evidencia que estás subiendo..."
                                rows="3"
                                className={styles.textareaInput}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Observaciones (opcional):</label>
                            <textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                placeholder="Observaciones adicionales..."
                                rows="2"
                                className={styles.textareaInput}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Archivo:</label>
                            <div className={styles.fileInputContainer}>
                                <input
                                    type="file"
                                    onChange={handleArchivoChange}
                                    accept="image/*,video/*,.pdf"
                                    className={styles.fileInput}
                                    id="fileInput"
                                    required
                                />
                                <label htmlFor="fileInput" className={styles.fileInputLabel}>
                                    📁 Seleccionar archivo
                                </label>
                                <div className={styles.fileInfo}>
                                    <span className={styles.fileStatus}>
                                        {archivos.length === 0 
                                            ? 'Ningún archivo seleccionado' 
                                            : `${archivos.length} archivo(s) seleccionado(s)`
                                        }
                                    </span>
                                    <small className={styles.fileFormats}>
                                        Formatos permitidos: Imágenes (JPG, PNG, etc.), Videos, PDF (Máx. 50MB)
                                    </small>
                                </div>
                            </div>
                        </div>

                        {archivos.length > 0 && (
                            <div className={styles.previsualizacionSection}>
                                <h4 className={styles.previsualizacionTitle}>
                                    📋 Previsualización
                                </h4>
                                <div className={styles.previsualizacionGrid}>
                                    {archivos.map((archivo, index) => (
                                        <div key={index} className={styles.previewItem}>
                                            <div className={styles.previewHeader}>
                                                <span className={styles.previewType}>
                                                    {archivo.type.startsWith('image/') ? '🖼️ Imagen' : 
                                                     archivo.type.startsWith('video/') ? '🎥 Video' : 
                                                     archivo.type === 'application/pdf' ? '📄 PDF' : '📁 Archivo'}
                                                </span>
                                                <button 
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className={styles.previewRemove}
                                                    title="Quitar archivo"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            {archivo.type.startsWith('image/') && (
                                                <div className={styles.previewImageContainer}>
                                                    <img 
                                                        src={previewUrls[index]} 
                                                        alt={`Previsualización de ${archivo.name}`}
                                                        className={styles.previewImage}
                                                    />
                                                </div>
                                            )}
                                            {archivo.type.startsWith('video/') && (
                                                <div className={styles.previewVideoContainer}>
                                                    <video 
                                                        controls 
                                                        className={styles.previewVideo}
                                                    >
                                                        <source src={previewUrls[index]} type={archivo.type} />
                                                        Tu navegador no soporta la reproducción de video.
                                                    </video>
                                                </div>
                                            )}
                                            <div className={styles.previewInfo}>
                                                <span className={styles.previewName}>{archivo.name}</span>
                                                <span className={styles.previewSize}>
                                                    ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.modalFooter}>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className={styles.btnCancelar}
                            disabled={subiendo}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className={styles.btnSubir}
                            disabled={subiendo || archivos.length === 0}
                        >
                            {subiendo ? '📤 Subiendo...' : '📤 Subir Evidencia'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal para ver evidencias existentes - CORREGIDO
const ModalVerEvidencias = ({ curso, onClose }) => {
    const [evidencias, setEvidencias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [eliminando, setEliminando] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(null);

    const showLocalNotification = (message, type = 'error') => {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1005;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease-out;
        `;
        
        if (type === 'error') {
            notification.style.background = '#dc3545';
        } else if (type === 'success') {
            notification.style.background = '#28a745';
        } else if (type === 'warning') {
            notification.style.background = '#ffc107';
            notification.style.color = '#000';
        } else {
            notification.style.background = '#17a2b8';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    };

    // CARGAR EVIDENCIAS AL ABRIR EL MODAL - CORREGIDO
    useEffect(() => {
        const cargarEvidencias = async () => {
            setCargando(true);
            setError(null);
            try {
                console.log('🔄 Cargando evidencias para curso:', curso.id);
                
                const evidenciasBD = await cargarEvidenciasReales(curso.id);
                console.log('✅ Evidencias cargadas del backend:', evidenciasBD);
                
                // CORREGIDO: Asegurarse de que evidenciasBD es un array
                if (Array.isArray(evidenciasBD)) {
                    setEvidencias(evidenciasBD);
                    console.log(`📊 Se establecieron ${evidenciasBD.length} evidencias en el estado`);
                } else {
                    console.warn('⚠️ Las evidencias no son un array:', evidenciasBD);
                    setEvidencias([]);
                }
                
            } catch (error) {
                console.error('❌ Error cargando evidencias:', error);
                setError('No se pudieron cargar las evidencias: ' + error.message);
                setEvidencias([]);
            } finally {
                setCargando(false);
            }
        };

        cargarEvidencias();
    }, [curso.id]);

    const handleEliminarEvidencia = async (evidencia) => {
        setEliminando(evidencia.idEvidencia);
        try {
            console.log('🗑️ Eliminando evidencia:', evidencia.idEvidencia);
            
            await eliminarEvidenciaReal(evidencia.idEvidencia);
            
            console.log('✅ Evidencia eliminada exitosamente');
            
            // Actualizar la lista de evidencias
            setEvidencias(prev => prev.filter(e => e.idEvidencia !== evidencia.idEvidencia));
            setShowConfirmDelete(null);
            showLocalNotification('Evidencia eliminada correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error eliminando evidencia:', error);
            
            let mensajeError = 'Error al eliminar la evidencia: ';
            
            if (error.message.includes('404')) {
                mensajeError += 'La evidencia no fue encontrada.';
            } else if (error.message.includes('500')) {
                mensajeError += 'Error interno del servidor. Intenta nuevamente.';
            } else if (error.message.includes('Failed to fetch')) {
                mensajeError += 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else {
                mensajeError += error.message;
            }
            
            showLocalNotification(mensajeError, 'error');
        } finally {
            setEliminando(null);
        }
    };

    const ConfirmDeleteModal = ({ evidencia, onConfirm, onCancel }) => {
        if (!evidencia) return null;

        return (
            <div className={styles.confirmDeleteOverlay}>
                <div className={styles.confirmDeleteModal}>
                    <div className={styles.confirmDeleteHeader}>
                        <h4>⚠️ Confirmar Eliminación</h4>
                    </div>
                    <div className={styles.confirmDeleteBody}>
                        <p>¿Estás seguro de que deseas eliminar esta evidencia?</p>
                        <div className={styles.evidenciaInfo}>
                            <strong>Tipo:</strong> {getTipoDisplay(evidencia.tipoEvidencia)}<br/>
                            <strong>Descripción:</strong> {evidencia.descripcion}<br/>
                            <strong>Archivo:</strong> {evidencia.archivoRuta}<br/>
                            <strong>Fecha:</strong> {formatFecha(evidencia.fechaSubida)}
                        </div>
                        <p className={styles.warningText}>
                            <strong>⚠️ ADVERTENCIA:</strong> Esta acción no se puede deshacer y el archivo se perderá permanentemente.
                        </p>
                        <div className={styles.debugInfo}>
                            <small>ID de evidencia: {evidencia.idEvidencia}</small>
                        </div>
                    </div>
                    <div className={styles.confirmDeleteFooter}>
                        <button 
                            onClick={onCancel}
                            className={styles.btnCancelarDelete}
                            disabled={eliminando}
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={() => onConfirm(evidencia)}
                            className={styles.btnConfirmarDelete}
                            disabled={eliminando}
                        >
                            {eliminando ? '🗑️ Eliminando...' : '🗑️ Sí, Eliminar Permanentemente'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handlePreviewImage = (evidencia) => {
        if (evidencia.tipoEvidencia === 'foto' || evidencia.archivoRuta.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            const imageUrl = `http://localhost:8080/api/evidencia/descargar/${evidencia.idEvidencia}`;
            setPreviewImage({
                url: imageUrl,
                nombre: evidencia.archivoRuta,
                descripcion: evidencia.descripcion,
                idEvidencia: evidencia.idEvidencia
            });
        }
    };

    const closePreview = () => {
        setPreviewImage(null);
    };

    const ImagePreviewModal = () => {
        if (!previewImage) return null;

        return (
            <div className={styles.imagePreviewOverlay} onClick={closePreview}>
                <div className={styles.imagePreviewContent} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.imagePreviewHeader}>
                        <h4>{previewImage.nombre}</h4>
                        <button className={styles.imagePreviewClose} onClick={closePreview}>×</button>
                    </div>
                    <div className={styles.imagePreviewBody}>
                        <img 
                            src={previewImage.url} 
                            alt={previewImage.descripcion}
                            className={styles.fullSizeImage}
                            onError={(e) => {
                                console.error('Error cargando imagen:', e);
                                e.target.style.display = 'none';
                                const errorDiv = e.target.nextSibling;
                                if (errorDiv) errorDiv.style.display = 'block';
                            }}
                        />
                        <div className={styles.imageError} style={{display: 'none'}}>
                            <div className={styles.errorIcon}>⚠️</div>
                            <p>No se pudo cargar la imagen</p>
                            <button 
                                onClick={() => descargarArchivoReal(previewImage.idEvidencia, previewImage.nombre)}
                                className={styles.btnDescargar}
                            >
                                ⬇️ Descargar archivo
                            </button>
                        </div>
                    </div>
                    <div className={styles.imagePreviewFooter}>
                        <p>{previewImage.descripcion}</p>
                        <div className={styles.previewActions}>
                            <button 
                                onClick={() => descargarArchivoReal(previewImage.idEvidencia, previewImage.nombre)}
                                className={styles.btnDescargar}
                            >
                                ⬇️ Descargar
                            </button>
                            <button 
                                onClick={() => {
                                    closePreview();
                                    setShowConfirmDelete(evidencias.find(e => e.idEvidencia === previewImage.idEvidencia));
                                }}
                                className={styles.btnEliminar}
                                title="Eliminar evidencia"
                            >
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleDescargar = async (evidencia) => {
        try {
            await descargarArchivoReal(evidencia.idEvidencia, evidencia.archivoRuta);
            showLocalNotification('Archivo descargado correctamente', 'success');
        } catch (error) {
            console.error('❌ Error descargando archivo:', error);
            showLocalNotification('Error al descargar el archivo: ' + error.message, 'error');
        }
    };

    // FUNCIONES AUXILIARES
    const getIconoTipo = (tipo) => {
        const iconos = {
            'foto': '📷',
            'video': '🎥',
            'documento': '📄',
            'lista_asistencia': '📋'
        };
        return iconos[tipo] || '📁';
    };

    const getTipoDisplay = (tipo) => {
        const tipos = {
            'foto': 'FOTOGRAFÍA',
            'video': 'VIDEO',
            'documento': 'DOCUMENTO',
            'lista_asistencia': 'LISTA DE ASISTENCIA'
        };
        return tipos[tipo] || tipo.toUpperCase();
    };

    const getEstatusDisplay = (estatus) => {
        const estatusMap = {
            'pendiente': '⏳ Pendiente',
            'aprobada': '✅ Aprobada', 
            'rechazada': '❌ Rechazada'
        };
        return estatusMap[estatus] || estatus;
    };

    const getEstatusClass = (estatus) => {
        const clases = {
            'pendiente': styles.estatusPendiente,
            'aprobada': styles.estatusAprobada,
            'rechazada': styles.estatusRechazada
        };
        return clases[estatus] || '';
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div>
                        <h3>Evidencias del Curso</h3>
                        <p className={styles.cursoNombreModal}>{curso.nombre}</p>
                    </div>
                    <button className={styles.modalClose} onClick={onClose}>×</button>
                </div>
                
                <div className={styles.modalBody}>
                    {error && (
                        <div className={styles.errorMessage}>
                            ⚠️ {error}
                        </div>
                    )}
                    
                    {cargando ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Cargando evidencias...</p>
                        </div>
                    ) : evidencias.length > 0 ? (
                        <div className={styles.evidenciasList}>
                            <div className={styles.evidenciasHeader}>
                                <span className={styles.totalEvidencias}>
                                    Total: {evidencias.length} evidencia(s)
                                </span>
                            </div>
                            
                            <div className={styles.evidenciasGrid}>
                                {evidencias.map(evidencia => (
                                    <div key={evidencia.idEvidencia} className={styles.evidenciaCard}>
                                        <div className={styles.evidenciaHeader}>
                                            <span className={styles.evidenciaIcon}>
                                                {getIconoTipo(evidencia.tipoEvidencia)}
                                            </span>
                                            <div className={styles.evidenciaInfo}>
                                                <h4 className={styles.evidenciaTipo}>
                                                    {getTipoDisplay(evidencia.tipoEvidencia)}
                                                </h4>
                                                <span className={styles.evidenciaFecha}>
                                                    {formatFecha(evidencia.fechaSubida)}
                                                </span>
                                                <span className={`${styles.evidenciaEstatus} ${getEstatusClass(evidencia.estatus)}`}>
                                                    {getEstatusDisplay(evidencia.estatus)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <p className={styles.evidenciaDescripcion}>
                                            {evidencia.descripcion}
                                        </p>
                                        
                                        {evidencia.observaciones && (
                                            <div className={styles.evidenciaObservaciones}>
                                                <strong>Observaciones:</strong>
                                                <p>{evidencia.observaciones}</p>
                                            </div>
                                        )}
                                        
                                        <div className={styles.evidenciaArchivos}>
                                            <strong>Archivo:</strong>
                                            <div className={styles.archivoInfo}>
                                                <span>📎 {evidencia.archivoRuta}</span>
                                                <div className={styles.archivoAcciones}>
                                                    {(evidencia.tipoEvidencia === 'foto' || evidencia.archivoRuta.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                                                        <button 
                                                            onClick={() => handlePreviewImage(evidencia)}
                                                            className={styles.btnPrevisualizar}
                                                            title="Previsualizar imagen"
                                                        >
                                                            👁️ Ver
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDescargar(evidencia)}
                                                        className={styles.btnDescargar}
                                                    >
                                                        ⬇️ Descargar
                                                    </button>
                                                    <button 
                                                        onClick={() => setShowConfirmDelete(evidencia)}
                                                        className={styles.btnEliminar}
                                                        title="Eliminar evidencia"
                                                        disabled={eliminando === evidencia.idEvidencia}
                                                    >
                                                        {eliminando === evidencia.idEvidencia ? '🗑️...' : '🗑️ Eliminar'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noEvidencias}>
                            <div className={styles.noDataIcon}>📁</div>
                            <h4>No hay evidencias registradas</h4>
                            <p>Este curso no tiene evidencias subidas aún.</p>
                        </div>
                    )}
                </div>
                
                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.btnCerrar}>
                        Cerrar
                    </button>
                </div>

                <ImagePreviewModal />

                <ConfirmDeleteModal 
                    evidencia={showConfirmDelete}
                    onConfirm={handleEliminarEvidencia}
                    onCancel={() => setShowConfirmDelete(null)}
                />
            </div>
        </div>
    );
};

// Página principal
export default function EvidenciasPage() {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [modalSubir, setModalSubir] = useState({ show: false, curso: null });
    const [modalVer, setModalVer] = useState({ show: false, curso: null });

    const router = useRouter();

    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
    };
    
    const closeNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    const getUserData = () => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            return userData;
        } catch (error) {
            console.error('Error obteniendo datos del usuario:', error);
            return null;
        }
    };

    const cargarCursosConAlumnosReales = async (instructorId) => {
        try {
            console.log('🔄 Cargando cursos con alumnos para instructor:', instructorId);
            
            const response = await fetch(`http://localhost:8080/api/instructor-cursos/instructor/${instructorId}/completo`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Cursos con alumnos cargados:', data);
                
                if (data.success) {
                    return data.cursos || [];
                } else {
                    throw new Error(data.error || 'Error en la respuesta');
                }
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error cargando cursos con alumnos:', error);
            throw error;
        }
    };

    const determinarEstadoCurso = (fechaIngreso) => {
        if (!fechaIngreso) return 'Programado';
        
        const hoy = new Date();
        const fechaCurso = new Date(fechaIngreso);
        
        if (fechaCurso < hoy) return 'Finalizado';
        
        const unaSemanaDespues = new Date();
        unaSemanaDespues.setDate(hoy.getDate() + 7);
        
        if (fechaCurso <= unaSemanaDespues) return 'Activo';
        
        return 'Programado';
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '';
        try {
            return new Date(fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return fecha;
        }
    };

    const procesarCurso = (curso) => {
        console.log('🔧 Procesando curso:', curso);
        
        const fechaIngreso = curso.fechaIngreso || curso.Fecha_Imparticion;
        const horas = curso.horas || 8;
        const alumnosInscritos = curso.alumnosInscritos || 0;
        const lugar = curso.lugar || curso.Lugar || 'Por definir';
        const empresa = curso.empresa || curso.Empresa || 'Empresa no especificada';
        const nombre = curso.nombre || curso.Nombre_curso;
        const stps = curso.stps || curso.Clave_STPS;
        
        return {
            id: curso.id || curso.Id_Curso,
            nombre: nombre,
            fechaIngreso: fechaIngreso,
            lugar: lugar,
            empresa: empresa,
            instructor: curso.instructor || 'Instructor no asignado',
            stps: stps,
            horas: horas,
            alumnosInscritos: alumnosInscritos,
            estado: determinarEstadoCurso(fechaIngreso),
            examenPractico: curso.examenPractico || false,
            precio: curso.precio || 0
        };
    };

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const userData = getUserData();
            if (!userData) {
                router.push('/');
                return;
            }

            console.log('🎯 Cargando cursos para evidencias:', userData);
            
            try {
                const cursosCargados = await cargarCursosConAlumnosReales(userData.id);
                console.log('📊 Cursos recibidos del backend:', cursosCargados);
                
                const cursosProcesados = Array.isArray(cursosCargados) 
                    ? cursosCargados.map(curso => procesarCurso(curso))
                    : [];
                
                console.log('🎨 Cursos procesados:', cursosProcesados);
                
                setCursos(cursosProcesados);
                setLoading(false);
                
                if (cursosProcesados.length === 0) {
                    showNotification('No tienes cursos asignados para subir evidencias', 'info');
                } else {
                    const totalAlumnos = cursosProcesados.reduce((sum, curso) => sum + curso.alumnosInscritos, 0);
                    showNotification(`Cargados ${cursosProcesados.length} cursos con ${totalAlumnos} alumnos para gestión de evidencias`, 'success');
                }
                
            } catch (backendError) {
                console.log('🔄 Falló conexión con backend, usando datos de ejemplo');
                throw new Error('modo-desarrollo');
            }
            
        } catch (error) {
            console.error('💥 Error en cargarDatos:', error);
            
            if (error.message === 'modo-desarrollo') {
                showNotification('Modo desarrollo: Mostrando datos de ejemplo', 'warning');
                const cursosEjemplo = [
                    { 
                        Id_Curso: 1, 
                        Nombre_curso: "Manejo de Materiales y Residuos Peligrosos", 
                        Fecha_Imparticion: "2025-04-01", 
                        Lugar: "Patio de Maniobras",
                        Empresa: "Aceros del Norte y Ensambles SAPI",
                        Clave_STPS: "STPS-MP-004",
                        alumnosInscritos: 15
                    },
                    { 
                        Id_Curso: 2, 
                        Nombre_curso: "Trabajos en Espacios Confinados (NOM-033)", 
                        Fecha_Imparticion: "2025-04-04", 
                        Lugar: "Cocina",
                        Empresa: "Aceros del Norte y Ensambles SAPI",
                        Clave_STPS: "BEYCO-02202-001S",
                        alumnosInscritos: 12
                    },
                    { 
                        Id_Curso: 3, 
                        Nombre_curso: "Operación Segura de Montacargas", 
                        Fecha_Imparticion: "2025-11-03", 
                        Lugar: "Nave 1",
                        Empresa: "Aceros del Norte y Ensambles SAPI",
                        Clave_STPS: "BEYCO-OS-002",
                        alumnosInscritos: 8
                    },
                    { 
                        Id_Curso: 4, 
                        Nombre_curso: "Soporte Vital Básico (BLS)", 
                        Fecha_Imparticion: "2025-11-19", 
                        Lugar: "Auditorio B. Servicios Corporativos", 
                        Empresa: "Servicios Corporativos Globales S.A.",
                        Clave_STPS: "BEY-SOP-00C",
                        alumnosInscritos: 20
                    }
                ].map(curso => procesarCurso(curso));
                
                setCursos(cursosEjemplo);
                setLoading(false);
            } else {
                showNotification('Error al cargar los cursos: ' + error.message, 'error');
                setLoading(false);
            }
        }
    };

    const handleSubirEvidencia = (curso) => {
        setModalSubir({ show: true, curso });
    };

    const handleVerEvidencias = (curso) => {
        setModalVer({ show: true, curso });
    };

    const handleEvidenciaSubida = (evidenciaData) => {
        console.log('✅ Evidencia subida y guardada en BD:', evidenciaData);
        showNotification('Evidencia subida y guardada correctamente en el sistema', 'success');
    };

    const handleCerrarModalSubir = () => {
        setModalSubir({ show: false, curso: null });
    };

    const handleCerrarModalVer = () => {
        setModalVer({ show: false, curso: null });
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    return (
        <div className={styles.pageContainer}>
            {notification.show && (
                <NotificationToast 
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}

            {modalSubir.show && (
                <ModalSubirEvidencia 
                    curso={modalSubir.curso} 
                    onClose={handleCerrarModalSubir}
                    onEvidenciaSubida={handleEvidenciaSubida}
                />
            )}

            {modalVer.show && (
                <ModalVerEvidencias 
                    curso={modalVer.curso} 
                    onClose={handleCerrarModalVer}
                />
            )}

            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Gestión de Evidencias</h1>
                    <p>Sube y consulta evidencias de tus cursos</p>
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
                <div className={styles.infoSection}>
                    <div className={styles.infoCard}>
                        <h3>📁 Tipos de Evidencias Aceptadas</h3>
                        <ul>
                            <li>📷 Fotografías de sesiones prácticas</li>
                            <li>🎥 Videos de demostraciones</li>
                            <li>📄 Documentos de trabajo y evaluaciones</li>
                            <li>📋 Listas de asistencia</li>
                        </ul>
                        <p><small>Formatos: Imágenes, Videos, PDF (Máx. 50MB por archivo)</small></p>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <div className={styles.tableHeader}>
                        <h3>Cursos para Gestión de Evidencias</h3>
                        <div className={styles.tableActions}>
                            <span className={styles.totalCursos}>
                                {loading ? 'Cargando...' : `${cursos.length} curso(s)`}
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Cargando cursos...</p>
                        </div>
                    ) : (
                        <table className={styles.cursosTable}>
                            <thead>
                                <tr>
                                    <th>Curso</th>
                                    <th>Fecha</th>
                                    <th>Lugar</th>
                                    <th>Empresa</th>
                                    <th>Estudiantes</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursos.length > 0 ? (
                                    cursos.map(curso => (
                                        <tr key={curso.id}>
                                            <td>
                                                <div className={styles.cursoInfo}>
                                                    <strong className={styles.cursoNombre}>{curso.nombre}</strong>
                                                    <div className={styles.cursoDetalles}>
                                                        <span className={styles.cursoClave}>Clave: {curso.stps}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.fechaInfo}>
                                                    <span className={styles.fechaPrincipal}>{formatFecha(curso.fechaIngreso)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.lugar}>{curso.lugar}</span>
                                            </td>
                                            <td>
                                                <span className={styles.empresa}>{curso.empresa}</span>
                                            </td>
                                            <td>
                                                <div className={styles.estudiantesInfo}>
                                                    <span className={styles.cantidadEstudiantes}>{curso.alumnosInscritos}</span> 
                                                    <span className={styles.estudiantesLabel}>
                                                        {curso.alumnosInscritos === 1 ? 'estudiante' : 'estudiantes'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.status} ${styles[curso.estado?.toLowerCase()]}`}>
                                                    {curso.estado}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.accionesEvidencias}>
                                                    <button 
                                                        onClick={() => handleSubirEvidencia(curso)}
                                                        className={styles.btnSubirEvidencia}
                                                        title="Subir nuevas evidencias"
                                                    >
                                                        📤 Subir
                                                    </button>
                                                    <button 
                                                        onClick={() => handleVerEvidencias(curso)}
                                                        className={styles.btnVerEvidencias}
                                                        title="Ver evidencias existentes"
                                                    >
                                                        👁️ Ver
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className={styles.noData}>
                                            <div className={styles.noDataContent}>
                                                <div className={styles.noDataIcon}>📁</div>
                                                <h4>No hay cursos asignados</h4>
                                                <p>No tienes cursos disponibles para gestión de evidencias.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className={styles.actionsSection}>
                    <Link href="/instructor/dashboard" className={styles.btnVolver}>
                        ← Volver 
                    </Link>
                    <button onClick={() => cargarDatos()} className={styles.btnRecargar}>
                        🔄 Actualizar
                    </button>
                </div>
            </main>
        </div>
    );
}