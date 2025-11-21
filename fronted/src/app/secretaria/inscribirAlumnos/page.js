'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './InscribirAlumnos.module.css';

export default function InscribirAlumnos() {
    const router = useRouter();
    const [modoRegistro, setModoRegistro] = useState('nuevo');
    const [busqueda, setBusqueda] = useState('');
    const [alumnosEncontrados, setAlumnosEncontrados] = useState([]);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
    const [cursos, setCursos] = useState([]);
    const [instructores, setInstructores] = useState([]);
    const [instructorSeleccionado, setInstructorSeleccionado] = useState(null);
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [usuarioId, setUsuarioId] = useState(null);
    const [esSecretaria, setEsSecretaria] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [pasoActual, setPasoActual] = useState(1);
    const [cargandoInstructores, setCargandoInstructores] = useState(true);
    const [formData, setFormData] = useState({
        curp: '',
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        fechaNacimiento: '',
        puesto: '',
        estadoNacimiento: '',
        rfc: '',
        cursoId: ''
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        console.log('🔍 Buscando usuario en localStorage...');
        
        const usuarioStr = localStorage.getItem('userData') || localStorage.getItem('usuario');
        
        if (usuarioStr) {
            try {
                const usuario = JSON.parse(usuarioStr);
                console.log('👤 Usuario completo:', usuario);
                
                const idUsuario = usuario.id || usuario.Num_Empleado || usuario.userId;
                const rolUsuario = usuario.Id_Rol || usuario.id_rol || usuario.rol || usuario.idRol;
                
                console.log('🔑 ID Usuario:', idUsuario, '| Rol:', rolUsuario);
                
                setUsuarioId(idUsuario);
                
                // Secretaria = rol 3, Instructor = rol 2
                const esSecretaria = rolUsuario == 3;
                setEsSecretaria(esSecretaria);
                
                console.log('👔 Es Secretaria:', esSecretaria);
                
                // SOLO si es instructor (rol 2), autoseleccionar
                if (rolUsuario == 2 && idUsuario) {
                    console.log('👨‍🏫 Usuario identificado como INSTRUCTOR:', idUsuario);
                    setInstructorSeleccionado({
                        id: idUsuario,
                        Num_Empleado: idUsuario,
                        nombre: usuario.nombre || usuario.Nombre || 'Instructor',
                        Nombre: usuario.Nombre || usuario.nombre || 'Instructor'
                    });
                    setPasoActual(1);
                } else if (esSecretaria) {
                    console.log('👔 Usuario identificado como SECRETARIA:', idUsuario);
                    setInstructorSeleccionado(null);
                    setPasoActual(1);
                }
                
            } catch (error) {
                console.error('❌ Error parseando usuario:', error);
            }
        } else {
            console.warn('⚠️ No se encontró usuario en localStorage');
        }
    }, [isClient]);

    useEffect(() => {
        if (isClient && esSecretaria) {
            cargarInstructores();
        } else if (isClient && !esSecretaria && usuarioId) {
            setCargandoInstructores(false);
        }
    }, [isClient, esSecretaria, usuarioId]);

    // Función para verificar endpoints (debugging)
    const verificarEndpoints = async () => {
        try {
            console.log('🔍 Verificando endpoints...');
            
            const instrResponse = await fetch('/api/usuarios/instructores');
            const instrData = await instrResponse.json();
            console.log('🎯 ENDPOINT INSTRUCTORES:', instrData);
            
            if (instrData.instructores && instrData.instructores.length > 0) {
                const primerInstructor = instrData.instructores[0];
                console.log('👤 Primer instructor:', primerInstructor);
                
                const cursosResponse = await fetch(`/api/instructor-cursos/instructor/${primerInstructor.id}`);
                const cursosData = await cursosResponse.json();
                console.log('🎯 ENDPOINT CURSOS:', cursosData);
                
                if (cursosData.cursos) {
                    console.log('📚 Primer curso:', cursosData.cursos[0]);
                }
            }
            
        } catch (error) {
            console.error('❌ Error verificando endpoints:', error);
        }
    };

    const cargarInstructores = async () => {
        try {
            console.log('👨‍🏫 Cargando instructores para inscripción...');
            setCargandoInstructores(true);
            
            const response = await fetch('/api/usuarios/instructores');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📦 Respuesta completa instructores:', result);
            
            if (!result.success) {
                throw new Error(result.error || 'Error en la respuesta del servidor');
            }
            
            const instructoresData = Array.isArray(result.instructores) ? result.instructores : [];
            
            console.log('👥 Instructores data:', instructoresData);
            
            if (instructoresData.length === 0) {
                console.warn('⚠️ No se encontraron instructores');
                setInstructores([]);
                return;
            }
            
            const instructoresNormalizados = instructoresData.map(instructor => {
                console.log('📋 Instructor raw:', instructor);
                return {
                    id: instructor.id || instructor.Num_Empleado,
                    Num_Empleado: instructor.Num_Empleado || instructor.id,
                    Nombre: instructor.Nombre || 'Instructor',
                    ...instructor
                };
            });
            
            console.log('✅ Instructores normalizados:', instructoresNormalizados);
            setInstructores(instructoresNormalizados);
            
        } catch (error) {
            console.error('❌ Error al cargar instructores:', error);
            alert('Error al cargar instructores: ' + error.message);
            setInstructores([]);
        } finally {
            setCargandoInstructores(false);
        }
    };

    const cargarCursosPorInstructor = async (instructorId) => {
        try {
            if (!instructorId) {
                console.warn('⚠️ No hay ID de instructor');
                return;
            }
            
            console.log('📚 Cargando cursos para inscripción, instructor:', instructorId);
            setLoading(true);
            
            const response = await fetch(`/api/instructor-cursos/instructor/${instructorId}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📦 Respuesta completa cursos:', result);
            
            if (!result.success) {
                throw new Error(result.error || 'Error en la respuesta del servidor');
            }
            
            const cursosData = Array.isArray(result.cursos) ? result.cursos : [];
            
            console.log('📚 Cursos data:', cursosData);
            
            const cursosNormalizados = cursosData.map(curso => ({
                id: curso.id,
                nombre: curso.nombre || 'Curso sin nombre',
                fechaIngreso: curso.fechaIngreso,
                lugar: curso.lugar || 'Lugar no especificado',
                empresa: curso.empresa || 'Empresa no especificada',
                examen_practico: curso.examen_practico || false,
                horas: curso.horas || 8,
                stps: curso.stps
            }));
            
            console.log('✅ Cursos normalizados:', cursosNormalizados);
            setCursos(cursosNormalizados);
            
        } catch (error) {
            console.error('❌ Error al cargar cursos:', error);
            alert('Error al cargar cursos: ' + error.message);
            setCursos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSeleccionarInstructor = (instructor) => {
        console.log('👨‍🏫 Instructor seleccionado:', instructor);
        
        const instructorId = instructor.id || instructor.Num_Empleado;
        
        if (!instructorId) {
            alert('Error: No se pudo identificar el ID del instructor.');
            return;
        }
        
        setInstructorSeleccionado(instructor);
        setCursos([]);
        setCursoSeleccionado(null);
        setFormData(prev => ({ ...prev, cursoId: '' }));
        setAlumnoSeleccionado(null);
        setBusqueda('');
        setAlumnosEncontrados([]);
        
        cargarCursosPorInstructor(instructorId);
        setPasoActual(2);
    };

    const handleAvanzarACursos = () => {
        if (usuarioId && !esSecretaria) {
            cargarCursosPorInstructor(usuarioId);
            setPasoActual(2);
        }
    };

    const handleSeleccionarCurso = (curso) => {
        console.log('📚 Curso seleccionado:', curso);
        setCursoSeleccionado(curso);
        setFormData(prev => ({ ...prev, cursoId: curso.id }));
        setPasoActual(3);
    };

    const retrocederPaso = () => {
        if (pasoActual > 1) {
            setPasoActual(pasoActual - 1);
            if (pasoActual === 2) {
                setCursoSeleccionado(null);
                setFormData(prev => ({ ...prev, cursoId: '' }));
            } else if (pasoActual === 3) {
                setAlumnoSeleccionado(null);
                setBusqueda('');
                setAlumnosEncontrados([]);
            }
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        try {
            let fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
            if (isNaN(fechaObj.getTime())) return 'Fecha no disponible';
            return fechaObj.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return 'Fecha no disponible';
        }
    };

    const buscarAlumnos = async () => {
        if (busqueda.trim().length < 2) {
            setAlumnosEncontrados([]);
            return;
        }
        try {
            const response = await fetch(`/api/alumnos/buscar?apellido=${encodeURIComponent(busqueda)}`);
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const result = await response.json();
            setAlumnosEncontrados(result.success && result.data ? result.data : []);
        } catch (error) {
            console.error('❌ Error al buscar alumnos:', error);
            setAlumnosEncontrados([]);
        }
    };

    useEffect(() => {
        if (modoRegistro === 'existente' && isClient && pasoActual === 3) {
            const timer = setTimeout(buscarAlumnos, 500);
            return () => clearTimeout(timer);
        }
    }, [busqueda, modoRegistro, isClient, pasoActual]);

    const seleccionarAlumno = (alumno) => {
        setAlumnoSeleccionado(alumno);
        setAlumnosEncontrados([]);
        setBusqueda('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validarFormulario = () => {
        if (modoRegistro === 'nuevo') {
            const camposRequeridos = ['curp', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'fechaNacimiento', 'puesto', 'estadoNacimiento', 'rfc'];
            const faltantes = camposRequeridos.filter(c => !formData[c]);
            if (faltantes.length > 0) {
                alert('Por favor completa todos los campos requeridos');
                return false;
            }
            if (formData.curp.length !== 18) {
                alert('El CURP debe tener exactamente 18 caracteres');
                return false;
            }
            if (formData.rfc.length < 12 || formData.rfc.length > 13) {
                alert('El RFC debe tener entre 12 y 13 caracteres');
                return false;
            }
        } else if (!alumnoSeleccionado) {
            alert('Por favor selecciona un alumno');
            return false;
        }
        if (!cursoSeleccionado) {
            alert('Por favor selecciona un curso');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;
        setLoading(true);
        
        try {
            let response, endpoint, payload;
            
            if (modoRegistro === 'nuevo') {
                endpoint = '/api/inscripciones/directo-bd';
                payload = { ...formData, cursoId: cursoSeleccionado.id };
            } else {
                endpoint = '/api/inscripciones/existente-bd';
                payload = { 
                    curp: alumnoSeleccionado.Curp || alumnoSeleccionado.curp, 
                    cursoId: cursoSeleccionado.id 
                };
            }
            
            console.log('🚀 Enviando datos:', { endpoint, payload });
            
            response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            // Verificar si la respuesta es JSON válido
            const responseText = await response.text();
            let result;
            
            try {
                result = JSON.parse(responseText);
            } catch (jsonError) {
                console.error('❌ Respuesta no es JSON válido:', responseText);
                throw new Error('Error en el servidor: respuesta inválida');
            }
            
            console.log('📦 Respuesta del servidor:', result);
            
            if (result.success) {
                if (result.data.inscripcionManualRequerida) {
                    // Mostrar alerta con instrucciones detalladas
                    alert(result.message);
                    
                    // Opcional: copiar comando SQL al portapapeles
                    if (result.data.comandoSQL) {
                        navigator.clipboard.writeText(result.data.comandoSQL)
                            .then(() => console.log('Comando copiado al portapapeles'))
                            .catch(() => console.log('No se pudo copiar el comando'));
                    }
                } else {
                    alert(result.message || '✅ Proceso completado exitosamente');
                }
                
                limpiarFormulario();
                setTimeout(() => router.push('/secretaria'), 3000);
            } else {
                throw new Error(result.error || 'Error en el proceso');
            }
            
        } catch (error) {
            console.error('❌ Error en handleSubmit:', error);
            alert(`⚠️ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const limpiarFormulario = () => {
        setFormData({
            curp: '',
            nombre: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            fechaNacimiento: '',
            puesto: '',
            estadoNacimiento: '',
            rfc: '',
            cursoId: ''
        });
        setAlumnoSeleccionado(null);
        setBusqueda('');
        setAlumnosEncontrados([]);
        if (esSecretaria) setInstructorSeleccionado(null);
        setCursoSeleccionado(null);
        setCursos([]);
        setPasoActual(1);
    };

    if (!isClient) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <button onClick={() => router.push('/secretaria')} className={styles.backButton}>
                        ← Volver 
                    </button>
                    <div className={styles.titleSection}>
                        <h1>📋 Inscribir Alumnos {esSecretaria && ''}</h1>
                        <p>Gestiona las inscripciones de nuevos alumnos</p>
                    </div>
                    <div className={styles.logoSection}>
                        <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
                    </div>
                </div>
            </header>
            <main className={styles.mainContent}>
                <div className={styles.pasosContainer}>
                    <div className={`${styles.paso} ${pasoActual >= 1 ? styles.pasoActivo : ''}`}>
                        <div className={styles.pasoNumero}>1</div>
                        <div className={styles.pasoTexto}>
                            {esSecretaria ? 'Seleccionar Instructor' : 'Instructor'}
                        </div>
                    </div>
                    <div className={`${styles.paso} ${pasoActual >= 2 ? styles.pasoActivo : ''}`}>
                        <div className={styles.pasoNumero}>2</div>
                        <div className={styles.pasoTexto}>Seleccionar Curso</div>
                    </div>
                    <div className={`${styles.paso} ${pasoActual >= 3 ? styles.pasoActivo : ''}`}>
                        <div className={styles.pasoNumero}>3</div>
                        <div className={styles.pasoTexto}>Inscribir Alumno</div>
                    </div>
                </div>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h2>Formulario de Inscripción {esSecretaria && ''}</h2>
                        <p>
                            {esSecretaria
                                ? 'Complete los pasos para inscribir alumnos a los cursos'
                                : 'Complete los pasos para inscribir alumnos a sus cursos'}
                        </p>
                        {pasoActual === 3 && (
                            <div className={styles.modoSelector}>
                                <button
                                    type="button"
                                    className={`${styles.modoBtn} ${modoRegistro === 'nuevo' ? styles.modoActivo : ''}`}
                                    onClick={() => {
                                        setModoRegistro('nuevo');
                                        setAlumnoSeleccionado(null);
                                        setBusqueda('');
                                        setAlumnosEncontrados([]);
                                    }}
                                >
                                    👤 Nuevo Alumno
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.modoBtn} ${modoRegistro === 'existente' ? styles.modoActivo : ''}`}
                                    onClick={() => {
                                        setModoRegistro('existente');
                                        setFormData({
                                            curp: '',
                                            nombre: '',
                                            apellidoPaterno: '',
                                            apellidoMaterno: '',
                                            fechaNacimiento: '',
                                            puesto: '',
                                            estadoNacimiento: '',
                                            rfc: '',
                                            cursoId: cursoSeleccionado?.id || ''
                                        });
                                    }}
                                >
                                    📚 Inscribir a Curso
                                </button>
                            </div>
                        )}
                    </div>

                    {pasoActual === 1 && (
                        <div key="paso-1" className={styles.pasoSection}>
                            <h3>👨‍🏫 Paso 1: {esSecretaria ? 'Seleccionar Instructor' : 'Instructor Asignado'}</h3>
                            <p>
                                {esSecretaria
                                    ? 'Seleccione el instructor para ver sus cursos disponibles'
                                    : 'Usted está asignado como instructor para este curso'}
                            </p>
                            {esSecretaria ? (
                                <>
                                    {cargandoInstructores ? (
                                        <div key="cargando-instructores" className={styles.cargando}>
                                            <div className={styles.spinner}></div>
                                            <p>Cargando instructores...</p>
                                        </div>
                                    ) : (
                                        <div key="lista-instructores" className={styles.instructoresGrid}>
                                            {instructores.length > 0 ? (
                                                instructores.map((instructor, index) => {
                                                    const instructorKey = instructor.Num_Empleado || instructor.id || `inst-${index}`;
                                                    return (
                                                        <div
                                                            key={instructorKey}
                                                            className={`${styles.instructorCard} ${
                                                                instructorSeleccionado?.id === instructor.id ? styles.instructorSeleccionado : ''
                                                            }`}
                                                            onClick={() => handleSeleccionarInstructor(instructor)}
                                                        >
                                                            <div className={styles.instructorInfo}>
                                                                <strong>{instructor.Nombre || instructor.nombre}</strong>
                                                                <span>ID: {instructor.Num_Empleado || instructor.id || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div key="no-instructores" className={styles.noInstructores}>
                                                    <p>No se encontraron instructores</p>
                                                    <button onClick={cargarInstructores} className={styles.reloadButton} style={{ marginTop: '1rem' }}>
                                                        🔄 Recargar Instructores
                                                    </button>
                                                    <button onClick={verificarEndpoints} className={styles.reloadButton} style={{ marginTop: '0.5rem', backgroundColor: '#6c757d' }}>
                                                        🐛 Debug Endpoints
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div key="info-instructor" className={styles.instructorInfoCard}>
                                    <div className={styles.instructorDetalles}>
                                        <p><strong>Instructor:</strong> {instructorSeleccionado?.nombre || 'Usted'}</p>
                                        <p><strong>ID:</strong> {usuarioId}</p>
                                        <p><strong>Rol:</strong> Instructor</p>
                                    </div>
                                    <button
                                        onClick={handleAvanzarACursos}
                                        className={styles.submitButton}
                                        style={{ marginTop: '1rem', width: '100%' }}
                                        disabled={loading}
                                    >
                                        {loading ? '⏳ Cargando...' : 'Ver Mis Cursos →'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {pasoActual === 2 && (
                        <div key="paso-2" className={styles.pasoSection}>
                            <div className={styles.pasoHeader}>
                                <h3>📚 Paso 2: Seleccionar Curso</h3>
                                <button type="button" onClick={retrocederPaso} className={styles.btnRetroceder}>
                                    ← Volver {esSecretaria ? 'a Instructores' : 'al Inicio'}
                                </button>
                            </div>
                            {instructorSeleccionado && (
                                <div key="info-instructor-seleccionado" className={styles.instructorInfoCard}>
                                    <p><strong>Instructor:</strong> {instructorSeleccionado.Nombre || instructorSeleccionado.nombre}</p>
                                    <p><strong>ID:</strong> {instructorSeleccionado.Num_Empleado || instructorSeleccionado.id}</p>
                                </div>
                            )}
                            {loading ? (
                                <div key="cargando-cursos" className={styles.cargando}>
                                    <div className={styles.spinner}></div>
                                    <p>Cargando cursos...</p>
                                </div>
                            ) : (
                                <div key="lista-cursos" className={styles.cursosGrid}>
                                    {cursos.length > 0 ? (
                                        cursos.map((curso) => (
                                            <div
                                                key={`curso-${curso.id}`}
                                                className={`${styles.cursoCard} ${
                                                    cursoSeleccionado && cursoSeleccionado.id === curso.id ? styles.cursoSeleccionado : ''
                                                }`}
                                                onClick={() => handleSeleccionarCurso(curso)}
                                            >
                                                <div className={styles.cursoInfo}>
                                                    <strong>{curso.nombre}</strong>
                                                    <span>📅 {formatearFecha(curso.fechaIngreso)}</span>
                                                    <span>🏢 {curso.empresa}</span>
                                                    <span>📍 {curso.lugar}</span>
                                                    <span>⏱️ {curso.horas} horas</span>
                                                    {curso.examen_practico && <span className={styles.examenPractico}>✓ Incluye examen práctico</span>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div key="no-cursos" className={styles.noCursos}>
                                            <p>⚠️ No se encontraron cursos para este instructor</p>
                                            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                                                Instructor ID: {instructorSeleccionado?.Num_Empleado || instructorSeleccionado?.id || usuarioId}
                                            </p>
                                            <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.3rem' }}>
                                                Verifique que este instructor tenga cursos asignados en la tabla 'cursos' de la base de datos
                                            </p>
                                            <button
                                                onClick={() => {
                                                    const idInstructor = instructorSeleccionado?.Num_Empleado || instructorSeleccionado?.id || usuarioId;
                                                    console.log('🔄 Recargando cursos para instructor:', idInstructor);
                                                    cargarCursosPorInstructor(idInstructor);
                                                }}
                                                className={styles.reloadButton}
                                                style={{ marginTop: '1rem' }}
                                            >
                                                🔄 Recargar Cursos
                                            </button>
                                            <button onClick={verificarEndpoints} className={styles.reloadButton} style={{ marginTop: '0.5rem', backgroundColor: '#6c757d' }}>
                                                🐛 Debug Endpoints
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {pasoActual === 3 && (
                        <div key="paso-3" className={styles.pasoSection}>
                            <div className={styles.pasoHeader}>
                                <h3>👤 Paso 3: Inscribir Alumno</h3>
                                <button type="button" onClick={retrocederPaso} className={styles.btnRetroceder}>
                                    ← Volver a Cursos
                                </button>
                            </div>
                            {cursoSeleccionado && (
                                <div key="info-curso-seleccionado" className={styles.cursoInfoCard}>
                                    <h4>Curso Seleccionado:</h4>
                                    <p><strong>Nombre:</strong> {cursoSeleccionado.nombre}</p>
                                    <p><strong>Fecha:</strong> {formatearFecha(cursoSeleccionado.fechaIngreso)}</p>
                                    <p><strong>Empresa:</strong> {cursoSeleccionado.empresa}</p>
                                    <p><strong>Lugar:</strong> {cursoSeleccionado.lugar}</p>
                                    {instructorSeleccionado && <p><strong>Instructor:</strong> {instructorSeleccionado.Nombre || instructorSeleccionado.nombre}</p>}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className={styles.inscriptionForm}>
                                {modoRegistro === 'existente' && (
                                    <div key="busqueda-alumnos" className={styles.busquedaSection}>
                                        <div className={styles.searchBox}>
                                            <label>🔍 Buscar Alumno por Apellido</label>
                                            <input
                                                type="text"
                                                placeholder="Escriba el apellido del alumno..."
                                                value={busqueda}
                                                onChange={(e) => setBusqueda(e.target.value)}
                                                className={styles.searchInput}
                                            />
                                        </div>
                                        {alumnosEncontrados.length > 0 && (
                                            <div key="resultados-busqueda" className={styles.resultados}>
                                                {alumnosEncontrados.map((alumno) => (
                                                    <div
                                                        key={`alumno-${alumno.Curp}`}
                                                        className={styles.resultadoItem}
                                                        onClick={() => seleccionarAlumno(alumno)}
                                                    >
                                                        <div className={styles.alumnoInfo}>
                                                            <strong>{alumno.Nombre} {alumno.Apellido_paterno} {alumno.Apellido_materno}</strong>
                                                            <span className={styles.curp}>CURP: {alumno.Curp}</span>
                                                            <span className={styles.puesto}>{alumno.Puesto}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {alumnoSeleccionado && (
                                            <div key="alumno-seleccionado" className={styles.alumnoSeleccionado}>
                                                <div className={styles.seleccionadoHeader}>
                                                    <h4>✓ Alumno Seleccionado</h4>
                                                    <button type="button" onClick={() => setAlumnoSeleccionado(null)} className={styles.btnCambiar}>
                                                        Cambiar
                                                    </button>
                                                </div>
                                                <div className={styles.alumnoDetalles}>
                                                    <p><strong>Nombre:</strong> {alumnoSeleccionado.Nombre} {alumnoSeleccionado.Apellido_paterno} {alumnoSeleccionado.Apellido_materno}</p>
                                                    <p><strong>CURP:</strong> {alumnoSeleccionado.Curp}</p>
                                                    <p><strong>RFC:</strong> {alumnoSeleccionado.RFC}</p>
                                                    <p><strong>Puesto:</strong> {alumnoSeleccionado.Puesto}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {modoRegistro === 'nuevo' && (
                                    <div key="formulario-nuevo" className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="curp">CURP *</label>
                                            <input
                                                type="text"
                                                id="curp"
                                                name="curp"
                                                value={formData.curp}
                                                onChange={handleInputChange}
                                                maxLength={18}
                                                placeholder="18 caracteres"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="nombre">Nombre *</label>
                                            <input
                                                type="text"
                                                id="nombre"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleInputChange}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="apellidoPaterno">Apellido Paterno *</label>
                                            <input
                                                type="text"
                                                id="apellidoPaterno"
                                                name="apellidoPaterno"
                                                value={formData.apellidoPaterno}
                                                onChange={handleInputChange}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="apellidoMaterno">Apellido Materno *</label>
                                            <input
                                                type="text"
                                                id="apellidoMaterno"
                                                name="apellidoMaterno"
                                                value={formData.apellidoMaterno}
                                                onChange={handleInputChange}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="fechaNacimiento">Fecha de Nacimiento *</label>
                                            <input
                                                type="date"
                                                id="fechaNacimiento"
                                                name="fechaNacimiento"
                                                value={formData.fechaNacimiento}
                                                onChange={handleInputChange}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="puesto">Puesto *</label>
                                            <input
                                                type="text"
                                                id="puesto"
                                                name="puesto"
                                                value={formData.puesto}
                                                onChange={handleInputChange}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="estadoNacimiento">Estado de Nacimiento *</label>
                                            <input
                                                type="text"
                                                id="estadoNacimiento"
                                                name="estadoNacimiento"
                                                value={formData.estadoNacimiento}
                                                onChange={handleInputChange}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="rfc">RFC *</label>
                                            <input
                                                type="text"
                                                id="rfc"
                                                name="rfc"
                                                value={formData.rfc}
                                                onChange={handleInputChange}
                                                maxLength={13}
                                                placeholder="12 o 13 caracteres"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className={styles.formActions}>
                                    <button type="button" onClick={() => router.push('/secretaria')} className={styles.cancelButton} disabled={loading}>
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={loading || !cursoSeleccionado || (modoRegistro === 'existente' && !alumnoSeleccionado)}
                                    >
                                        {loading ? '⏳ Procesando...' : modoRegistro === 'nuevo' ? 'Registrar e Inscribir' : 'Inscribir a Curso'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
                <div className={styles.quickStats}>
                    <h3>📊 {esSecretaria ? 'Sistema' : 'Mis Cursos'}</h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>{esSecretaria ? instructores.length : cursos.length}</span>
                            <span className={styles.statLabel}>{esSecretaria ? 'Instructores' : 'Cursos'}</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>
                                {esSecretaria ? cursos.length : cursos.filter(c => c.examen_practico).length}
                            </span>
                            <span className={styles.statLabel}>{esSecretaria ? 'Cursos Cargados' : 'Con Práctico'}</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>-</span>
                            <span className={styles.statLabel}>Alumnos</span>
                        </div>
                    </div>
                    {usuarioId && (
                        <div className={styles.instructorInfo}>
                            <p><strong>👤 Usuario Actual:</strong></p>
                            <p>ID: {usuarioId}</p>
                            <p>Rol: {esSecretaria ? '👔 Secretaría' : '👨‍🏫 Instructor'}</p>
                            {instructorSeleccionado && (
                                <>
                                    <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #e9ecef' }} />
                                    <p><strong>Instructor Seleccionado:</strong></p>
                                    <p>{instructorSeleccionado.Nombre || instructorSeleccionado.nombre}</p>
                                    <p>ID: {instructorSeleccionado.Num_Empleado || instructorSeleccionado.id}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}