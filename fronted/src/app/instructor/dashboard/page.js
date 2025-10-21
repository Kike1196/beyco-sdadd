// app/instructor/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import './Dashboard.css';

export default function InstructorDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inicio');

    useEffect(() => {
        cargarDashboard();
    }, []);

    const cargarDashboard = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/dashboard/instructor/1');
            const data = await response.json();
            setDashboard(data);
        } catch (error) {
            console.error('Error:', error);
            // Usar datos de ejemplo si falla
            setDashboard(obtenerDatosEjemplo());
        } finally {
            setLoading(false);
        }
    };

    const obtenerDatosEjemplo = () => ({
        estadisticas: { cursosActivos: 3, totalEstudiantes: 45, cursosCompletados: 12, proximaSesion: 1 },
        cursos: [
            { id: 1, titulo: "Spring Boot Avanzado", fechaInicio: "2025-10-25", estado: "Activo", totalEstudiantes: 15, progreso: 75.5 },
            { id: 2, titulo: "Microservicios", fechaInicio: "2025-10-20", estado: "Activo", totalEstudiantes: 12, progreso: 60.0 },
            { id: 3, titulo: "AWS Fundamentals", fechaInicio: "2025-11-01", estado: "Programado", totalEstudiantes: 0, progreso: 0.0 }
        ],
        anuncios: [
            { id: 1, titulo: "Recordatorio importante", contenido: "Revisar material para próxima sesión", importante: true, fecha: "2025-10-18 10:30:00" },
            { id: 2, titulo: "Nuevos recursos", contenido: "Se agregaron ejercicios prácticos", importante: false, fecha: "2025-10-17 14:20:00" }
        ],
        instructor: { id: 1, nombre: "María González", especialidad: "Desarrollo Backend", email: "maria.gonzalez@beyco.com", telefono: "+52 55 1234 5678" }
    });

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="header">
                <div className="user-info">
                    <h1>¡Bienvenida, {dashboard?.instructor?.nombre}!</h1>
                    <p>{dashboard?.instructor?.especialidad}</p>
                </div>
                <div className="logo">
                    <h2>BEYCO</h2>
                    <span>Consultores</span>
                </div>
            </header>

            {/* Navegación */}
            <nav className="tabs">
                <button 
                    className={activeTab === 'inicio' ? 'active' : ''} 
                    onClick={() => setActiveTab('inicio')}
                >
                    🏠 Inicio
                </button>
                <button 
                    className={activeTab === 'cursos' ? 'active' : ''} 
                    onClick={() => setActiveTab('cursos')}
                >
                    📚 Mis Cursos
                </button>
                <button 
                    className={activeTab === 'comunicacion' ? 'active' : ''} 
                    onClick={() => setActiveTab('comunicacion')}
                >
                    💬 Comunicación
                </button>
                <button 
                    className={activeTab === 'recursos' ? 'active' : ''} 
                    onClick={() => setActiveTab('recursos')}
                >
                    📁 Recursos
                </button>
            </nav>

            {/* Contenido Principal */}
            <main className="main-content">
                {activeTab === 'inicio' && <VistaInicio dashboard={dashboard} />}
                {activeTab === 'cursos' && <VistaCursos cursos={dashboard?.cursos} />}
                {activeTab === 'comunicacion' && <VistaComunicacion anuncios={dashboard?.anuncios} />}
                {activeTab === 'recursos' && <VistaRecursos />}
            </main>
        </div>
    );
}

// Componente para la vista de inicio
function VistaInicio({ dashboard }) {
    return (
        <div className="vista-inicio">
            {/* Tarjetas de Estadísticas */}
            <div className="estadisticas-grid">
                <div className="tarjeta-estadistica">
                    <h3>Cursos Activos</h3>
                    <div className="numero">{dashboard?.estadisticas?.cursosActivos}</div>
                </div>
                <div className="tarjeta-estadistica">
                    <h3>Total Estudiantes</h3>
                    <div className="numero">{dashboard?.estadisticas?.totalEstudiantes}</div>
                </div>
                <div className="tarjeta-estadistica">
                    <h3>Cursos Completados</h3>
                    <div className="numero">{dashboard?.estadisticas?.cursosCompletados}</div>
                </div>
                <div className="tarjeta-estadistica">
                    <h3>Próxima Sesión</h3>
                    <div className="numero">{dashboard?.estadisticas?.proximaSesion}</div>
                </div>
            </div>

            {/* Cursos Recientes */}
            <div className="seccion">
                <h2>Mis Cursos</h2>
                <div className="cursos-grid">
                    {dashboard?.cursos?.map(curso => (
                        <div key={curso.id} className={`tarjeta-curso ${curso.estado.toLowerCase()}`}>
                            <h3>{curso.titulo}</h3>
                            <p>Inicio: {curso.fechaInicio}</p>
                            <p>Estudiantes: {curso.totalEstudiantes}</p>
                            <div className="barra-progreso">
                                <div 
                                    className="progreso" 
                                    style={{width: `${curso.progreso}%`}}
                                ></div>
                            </div>
                            <span className="estado">{curso.estado}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Componente para la vista de cursos
function VistaCursos({ cursos }) {
    return (
        <div className="vista-cursos">
            <h2>Gestión de Cursos</h2>
            <div className="acciones-cursos">
                <button className="btn-primario">➕ Crear Nuevo Curso</button>
                <button className="btn-secundario">📊 Ver Reportes</button>
            </div>
            <div className="lista-cursos">
                {cursos?.map(curso => (
                    <div key={curso.id} className="item-curso">
                        <h3>{curso.titulo}</h3>
                        <p>Fecha: {curso.fechaInicio} | Estudiantes: {curso.totalEstudiantes}</p>
                        <div className="acciones">
                            <button>👁️ Ver</button>
                            <button>✏️ Editar</button>
                            <button>📋 Estudiantes</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Componente para la vista de comunicación
function VistaComunicacion({ anuncios }) {
    return (
        <div className="vista-comunicacion">
            <h2>Comunicación</h2>
            <div className="crear-anuncio">
                <h3>Crear Nuevo Anuncio</h3>
                <textarea placeholder="Escribe tu anuncio aquí..."></textarea>
                <div className="opciones">
                    <label>
                        <input type="checkbox" /> Anuncio importante
                    </label>
                    <button className="btn-primario">📢 Publicar Anuncio</button>
                </div>
            </div>
            <div className="anuncios-lista">
                <h3>Anuncios Recientes</h3>
                {anuncios?.map(anuncio => (
                    <div key={anuncio.id} className={`anuncio ${anuncio.importante ? 'importante' : ''}`}>
                        <h4>{anuncio.titulo}</h4>
                        <p>{anuncio.contenido}</p>
                        <span className="fecha">{anuncio.fecha}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Componente para la vista de recursos
function VistaRecursos() {
    return (
        <div className="vista-recursos">
            <h2>Recursos y Materiales</h2>
            <div className="acciones-recursos">
                <button className="btn-primario">📤 Subir Archivo</button>
                <button className="btn-secundario">🔗 Agregar Enlace</button>
            </div>
            <div className="recursos-lista">
                <p>Aquí podrás gestionar todos los recursos de tus cursos.</p>
            </div>
        </div>
    );
}