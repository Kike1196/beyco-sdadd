// app/instructor/evidencias/page.js - PÁGINA DE EVIDENCIAS (MODIFICADA)
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

    // Modal para subir evidencias (VERSIÓN CON TEXTO NEGRO)
    const ModalSubirEvidencia = ({ curso, onClose, onEvidenciaSubida }) => {
        const [archivos, setArchivos] = useState([]);
        const [tipoEvidencia, setTipoEvidencia] = useState('foto');
        const [descripcion, setDescripcion] = useState('');
        const [subiendo, setSubiendo] = useState(false);

        const handleArchivoChange = (e) => {
            const files = Array.from(e.target.files);
            setArchivos(files);
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (archivos.length === 0) {
                alert('Por favor selecciona al menos un archivo');
                return;
            }

            setSubiendo(true);
            try {
                // Simular subida de archivos
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                console.log('📤 Subiendo evidencias:', {
                    cursoId: curso.id,
                    tipo: tipoEvidencia,
                    archivos: archivos.map(f => f.name),
                    descripcion
                });

                onEvidenciaSubida({
                    cursoId: curso.id,
                    tipo: tipoEvidencia,
                    archivos: archivos.map(f => ({ nombre: f.name, tipo: f.type })),
                    descripcion,
                    fecha: new Date().toISOString()
                });

                onClose();
            } catch (error) {
                console.error('Error subiendo evidencias:', error);
                alert('Error al subir las evidencias');
            } finally {
                setSubiendo(false);
            }
        };

        return (
            <div className={styles.modalOverlay} onClick={onClose}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
                                >
                                    <option value="foto">Fotografía</option>
                                    <option value="documento">Documento</option>
                                    <option value="lista_asistencia">Lista de Asistencia</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Descripción:</label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Descripción de la evidencia que estás subiendo..."
                                    rows="3"
                                    className={styles.textareaInput}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Archivos:</label>
                                <div className={styles.fileInputContainer}>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleArchivoChange}
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className={styles.fileInput}
                                        id="fileInput"
                                    />
                                    <label htmlFor="fileInput" className={styles.fileInputLabel}>
                                        📁 Elegir archivos
                                    </label>
                                    <div className={styles.fileInfo}>
                                        <span className={styles.fileStatus}>
                                            {archivos.length === 0 
                                                ? 'Ningún archivo seleccionado' 
                                                : `${archivos.length} archivo(s) seleccionado(s)`
                                            }
                                        </span>
                                        <small className={styles.fileFormats}>
                                            Formatos permitidos: JPG, PNG, PDF (Máx. 10MB por archivo)
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {archivos.length > 0 && (
                                <div className={styles.archivosSeleccionados}>
                                    <h4>Archivos seleccionados:</h4>
                                    <ul>
                                        {archivos.map((archivo, index) => (
                                            <li key={index} className={styles.archivoItem}>
                                                <span className={styles.archivoIcon}>📎</span>
                                                <div className={styles.archivoInfo}>
                                                    <span className={styles.archivoNombre}>{archivo.name}</span>
                                                    <span className={styles.archivoTamaño}>
                                                        ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
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
                                {subiendo ? '📤 Subiendo...' : '📤 Subir Evidencias'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };
// Modal para ver evidencias existentes
const ModalVerEvidencias = ({ curso, onClose }) => {
    const [evidencias, setEvidencias] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // Simular carga de evidencias existentes
        const cargarEvidencias = async () => {
            setCargando(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Evidencias de ejemplo
                const evidenciasEjemplo = [
                    {
                        id: 1,
                        tipo: 'lista_asistencia',
                        descripcion: 'Lista de asistencia del curso completo',
                        archivos: [{ nombre: 'lista_asistencia_curso_2.pdf', tipo: 'application/pdf' }],
                        fecha: '2025-04-02T10:00:00Z',
                        subidoPor: 'Ana Solis'
                    },
                    {
                        id: 2,
                        tipo: 'foto',
                        descripcion: 'Fotos de la sesión práctica',
                        archivos: [
                            { nombre: 'practica_1.jpg', tipo: 'image/jpeg' },
                            { nombre: 'practica_2.jpg', tipo: 'image/jpeg' }
                        ],
                        fecha: '2025-04-02T14:30:00Z',
                        subidoPor: 'Ana Solis'
                    },
                    {
                        id: 3,
                        tipo: 'documento',
                        descripcion: 'Documento de evaluación teórica',
                        archivos: [{ nombre: 'evaluacion_teorica.pdf', tipo: 'application/pdf' }],
                        fecha: '2025-04-02T16:00:00Z',
                        subidoPor: 'Ana Solis'
                    }
                ];
                
                setEvidencias(evidenciasEjemplo);
            } catch (error) {
                console.error('Error cargando evidencias:', error);
            } finally {
                setCargando(false);
            }
        };

        cargarEvidencias();
    }, [curso.id]);

    const getIconoTipo = (tipo) => {
        const iconos = {
            foto: '📷',
            documento: '📄',
            lista_asistencia: '📋'
        };
        return iconos[tipo] || '📁';
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
                                    <div key={evidencia.id} className={styles.evidenciaCard}>
                                        <div className={styles.evidenciaHeader}>
                                            <span className={styles.evidenciaIcon}>
                                                {getIconoTipo(evidencia.tipo)}
                                            </span>
                                            <div className={styles.evidenciaInfo}>
                                                <h4 className={styles.evidenciaTipo}>
                                                    {evidencia.tipo === 'foto' ? 'FOTOGRAFÍA' : 
                                                     evidencia.tipo === 'documento' ? 'DOCUMENTO' : 
                                                     'LISTA DE ASISTENCIA'}
                                                </h4>
                                                <span className={styles.evidenciaFecha}>
                                                    {formatFecha(evidencia.fecha)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <p className={styles.evidenciaDescripcion}>
                                            {evidencia.descripcion}
                                        </p>
                                        
                                        <div className={styles.evidenciaArchivos}>
                                            <strong>Archivos:</strong>
                                            <ul>
                                                {evidencia.archivos.map((archivo, index) => (
                                                    <li key={index}>
                                                        📎 {archivo.nombre}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        <div className={styles.evidenciaFooter}>
                                            <span className={styles.subidoPor}>
                                                Subido por: {evidencia.subidoPor}
                                            </span>
                                            <button className={styles.btnDescargar}>
                                                ⬇️ Descargar
                                            </button>
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
            </div>
        </div>
    );
};

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
            console.log('👤 Datos de usuario:', userData);
            return userData;
        } catch (error) {
            console.error('Error obteniendo datos del usuario:', error);
            return null;
        }
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

    const cargarCursosDesdeBackend = async (instructorId) => {
        try {
            console.log('🔄 Cargando cursos para instructor ID:', instructorId);
            
            const response = await fetch(`http://localhost:8080/api/instructor-cursos/instructor/${instructorId}`);
            
            console.log('🔍 Status de respuesta:', response.status);

            if (response.ok) {
                const cursosData = await response.json();
                console.log('✅ Cursos cargados del backend:', cursosData);
                return cursosData;
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

        } catch (error) {
            console.error('❌ Error en cargarCursosDesdeBackend:', error);
            throw error;
        }
    };

    const procesarCurso = (curso) => {
        console.log('🔧 Procesando curso:', curso);
        
        const fechaIngreso = curso.fechaIngreso || curso.Fecha_Imparticion;
        const horas = curso.horas || 8;
        const alumnosInscritos = curso.alumnosInscritos || 0;
        const lugar = curso.lugar || curso.Lugar || 'Por definir';
        const empresa = curso.empresa || 'Empresa no especificada';
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
        try {
            const userData = getUserData();
            if (!userData) {
                router.push('/');
                return;
            }

            console.log('🎯 Cargando cursos para evidencias:', userData);
            
            try {
                const cursosCargados = await cargarCursosDesdeBackend(userData.id);
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
                    showNotification(`Cargados ${cursosProcesados.length} cursos para gestión de evidencias`, 'success');
                }
                
            } catch (backendError) {
                console.log('🔄 Falló conexión con backend, usando datos de ejemplo');
                throw new Error('modo-desarrollo');
            }
            
        } catch (error) {
            console.error('💥 Error en cargarDatos:', error);
            
            if (error.message === 'modo-desarrollo') {
                showNotification('Modo desarrollo: Mostrando datos de ejemplo', 'warning');
                const userData = getUserData();
                const cursosEjemplo = [
                    { 
                        Id_Curso: 2, 
                        Nombre_curso: "Manejo de Materiales y Residuos Peligrosos", 
                        Fecha_Imparticion: "2025-04-02", 
                        Lugar: "Patio de Maniobras",
                        empresa: "Industrias PEMEX",
                        instructor: userData?.nombre || "Ana Solis",
                        Clave_STPS: "STPS-MP-004",
                        horas: 8,
                        alumnosInscritos: 7
                    },
                    { 
                        Id_Curso: 25, 
                        Nombre_curso: "Soporte Vital Básico (BLS)", 
                        Fecha_Imparticion: "2025-11-20", 
                        Lugar: "Auditorio B", 
                        empresa: "Servicios Corporativos",
                        instructor: userData?.nombre || "Ana Solis",
                        Clave_STPS: "BEY-SOP-001",
                        horas: 8,
                        alumnosInscritos: 5
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
        console.log('✅ Evidencia subida:', evidenciaData);
        showNotification('Evidencias subidas correctamente', 'success');
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
            {/* Notificaciones */}
            {notification.show && (
                <NotificationToast 
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}

            {/* Modal Subir Evidencia */}
            {modalSubir.show && (
                <ModalSubirEvidencia 
                    curso={modalSubir.curso} 
                    onClose={handleCerrarModalSubir}
                    onEvidenciaSubida={handleEvidenciaSubida}
                />
            )}

            {/* Modal Ver Evidencias */}
            {modalVer.show && (
                <ModalVerEvidencias 
                    curso={modalVer.curso} 
                    onClose={handleCerrarModalVer}
                />
            )}

            {/* Header */}
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
                {/* Información de la página */}
                <div className={styles.infoSection}>
                    <div className={styles.infoCard}>
                        <h3>📁 Tipos de Evidencias Aceptadas</h3>
                        <ul>
                            <li>📷 Fotografías de sesiones prácticas</li>
                            <li>📋 Listas de asistencia</li>
                            <li>📄 Documentos de trabajo</li>
                        </ul>
                    </div>
                </div>

                {/* Tabla de Cursos */}
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
                                                    <span className={styles.estudiantesLabel}>estudiantes</span>
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

                {/* Botones de acción */}
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