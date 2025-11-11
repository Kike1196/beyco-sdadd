// app/admin/empresas/page.js - VERSIÓN CORREGIDA SIN PARPADEO
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from './Empresas.module.css';

export default function EmpresasPage() {
    const [empresas, setEmpresas] = useState([]);
    const [empresasFiltradas, setEmpresasFiltradas] = useState([]);
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [subiendoLogo, setSubiendoLogo] = useState(false);
    const fileInputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Estado del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        rfc: '',
        contacto: '',
        logo: '',
        activo: true
    });

    const [logoPreview, setLogoPreview] = useState(null);

    // URL base del backend
    const API_BASE_URL = 'http://localhost:8080';

    // Cargar empresas al iniciar
    useEffect(() => {
        cargarEmpresas();
    }, []);

    // ✅ FILTRADO LOCAL - Evita recargas innecesarias
    useEffect(() => {
        if (busqueda.trim() === '') {
            setEmpresasFiltradas(empresas);
        } else {
            const filtradas = empresas.filter(empresa =>
                empresa.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                empresa.contacto.toLowerCase().includes(busqueda.toLowerCase()) ||
                empresa.email.toLowerCase().includes(busqueda.toLowerCase()) ||
                empresa.telefono.toLowerCase().includes(busqueda.toLowerCase()) ||
                empresa.rfc.toLowerCase().includes(busqueda.toLowerCase())
            );
            setEmpresasFiltradas(filtradas);
        }
    }, [busqueda, empresas]);

    // ✅ FUNCIÓN CORREGIDA - Maneja la estructura correcta del backend
    const cargarEmpresas = async () => {
        try {
            setCargando(true);
            console.log('🔍 Solicitando empresas desde:', `${API_BASE_URL}/api/empresas`);
            
            const response = await fetch(`${API_BASE_URL}/api/empresas`);
            
            console.log('📡 Status de respuesta:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error del servidor:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const resultado = await response.json();
            console.log('📊 Respuesta completa del backend:', resultado);
            
            // ✅ CORREGIDO: Extraer empresas del campo "data"
            if (resultado.success && Array.isArray(resultado.data)) {
                const empresasData = resultado.data;
                console.log('✅ Empresas cargadas correctamente:', empresasData.length);
                setEmpresas(empresasData);
                
                // ✅ Mantener la empresa seleccionada si existe
                if (empresaSeleccionada) {
                    const empresaActualizada = empresasData.find(e => e.id === empresaSeleccionada.id);
                    if (empresaActualizada) {
                        setEmpresaSeleccionada(empresaActualizada);
                    }
                }
            } else {
                console.warn('⚠️ Estructura inesperada o éxito falso:', resultado);
                setEmpresas([]);
            }
            
        } catch (error) {
            console.error('❌ Error al cargar empresas:', error);
            alert('Error al cargar empresas: ' + error.message);
            setEmpresas([]);
        } finally {
            setCargando(false);
        }
    };

    // ✅ MANEJADOR DE BÚSQUEDA OPTIMIZADO
    const handleBusquedaChange = useCallback((e) => {
        const valor = e.target.value;
        setBusqueda(valor);
        
        // Limpiar timeout anterior
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // Solo hacer búsqueda en servidor después de un delay
        if (valor.trim() !== '' && valor.length > 2) {
            searchTimeoutRef.current = setTimeout(() => {
                buscarEmpresasServidor(valor);
            }, 500);
        }
    }, []);

    // ✅ BÚSQUEDA EN SERVIDOR SOLO CUANDO ES NECESARIO
    const buscarEmpresasServidor = async (criterio) => {
        try {
            setCargando(true);
            const response = await fetch(`${API_BASE_URL}/api/empresas/buscar?criterio=${encodeURIComponent(criterio)}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status} en búsqueda`);
            }
            
            const resultado = await response.json();
            
            if (resultado.success && Array.isArray(resultado.data)) {
                setEmpresas(resultado.data);
            } else {
                console.warn('Estructura inesperada en búsqueda:', resultado);
                setEmpresas([]);
            }
            
        } catch (error) {
            console.error('Error al buscar empresas:', error);
            // En caso de error, usar filtrado local
            console.log('Usando filtrado local debido a error');
        } finally {
            setCargando(false);
        }
    };

    // Manejar selección de archivo de logo
    const handleLogoSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecciona un archivo de imagen válido');
                return;
            }

            // Validar tamaño (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 5MB permitido.');
                return;
            }

            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target.result);
            };
            reader.readAsDataURL(file);

            // Guardar el archivo para enviarlo con el formulario
            setFormData(prev => ({
                ...prev,
                logoFile: file
            }));
        }
    };

    // Abrir selector de archivos
    const abrirSelectorArchivos = () => {
        fileInputRef.current?.click();
    };

    const seleccionarEmpresa = (empresa) => {
        setEmpresaSeleccionada(empresa);
        setMostrarFormulario(false);
        setLogoPreview(null);
    };

    const abrirFormularioNuevo = () => {
        setFormData({
            nombre: '',
            telefono: '',
            email: '',
            direccion: '',
            rfc: '',
            contacto: '',
            logo: '',
            activo: true
        });
        setModoEdicion(false);
        setMostrarFormulario(true);
        setEmpresaSeleccionada(null);
        setLogoPreview(null);
    };

    const abrirFormularioEditar = (empresa) => {
        setFormData({
            nombre: empresa.nombre,
            telefono: empresa.telefono,
            email: empresa.email,
            direccion: empresa.direccion,
            rfc: empresa.rfc,
            contacto: empresa.contacto,
            logo: empresa.logo,
            activo: empresa.activo
        });
        setModoEdicion(true);
        setMostrarFormulario(true);
        setEmpresaSeleccionada(empresa);
        setLogoPreview(null);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // ✅ FUNCIÓN CORREGIDA - Guardar empresa
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setCargando(true);
            
            // Preparar datos para enviar (sin el archivo de logo)
            const { logoFile, ...datosParaEnviar } = formData;
            
            const url = modoEdicion 
                ? `${API_BASE_URL}/api/empresas`
                : `${API_BASE_URL}/api/empresas`;
                
            const method = modoEdicion ? 'PUT' : 'POST';

            console.log('Enviando datos a:', url, datosParaEnviar);

            // Enviar datos básicos de la empresa
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(modoEdicion ? { ...datosParaEnviar, id: empresaSeleccionada.id } : datosParaEnviar)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const resultado = await response.json();
            console.log('Respuesta del guardado:', resultado);
            
            if (resultado.success) {
                alert(modoEdicion ? 'Empresa actualizada correctamente' : 'Empresa creada correctamente');
                setMostrarFormulario(false);
                cargarEmpresas();
                setLogoPreview(null);
            } else {
                throw new Error(resultado.error || 'Error desconocido al guardar');
            }
            
        } catch (error) {
            console.error('Error al guardar empresa:', error);
            alert('Error al guardar empresa: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    // ✅ FUNCIÓN CORREGIDA - Eliminar empresa
    const eliminarEmpresa = async (id, nombre) => {
        if (confirm(`¿Estás seguro de que deseas eliminar la empresa "${nombre}"?`)) {
            try {
                setCargando(true);
                const response = await fetch(`${API_BASE_URL}/api/empresas/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error ${response.status}: ${errorText}`);
                }

                const resultado = await response.json();
                
                if (resultado.success) {
                    alert('Empresa eliminada correctamente');
                    setEmpresaSeleccionada(null);
                    cargarEmpresas();
                } else {
                    throw new Error(resultado.error || 'Error desconocido al eliminar');
                }
                
            } catch (error) {
                console.error('Error al eliminar empresa:', error);
                alert('Error al eliminar empresa: ' + error.message);
            } finally {
                setCargando(false);
            }
        }
    };

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className={styles.pageContainer}>
            {/* Header con azul oscuro - igual que honorarios */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Gestión de Empresas</h1>
                    <p>Administra y gestiona las empresas del sistema</p>
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
                {/* Controles principales */}
                <div className={styles.controls}>
                    <div className={styles.controlsLeft}>
                        <Link href="/admin" className={styles.btnAtras}>
                            ← Volver 
                        </Link>
                    </div>
                    <div className={styles.controlsRight}>
                        <button 
                            onClick={cargarEmpresas}
                            className={styles.btnActualizar}
                            disabled={cargando}
                        >
                            🔄 Actualizar
                        </button>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className={styles.contentGrid}>
                    {/* Panel de selección */}
                    <div className={styles.selectionPanel}>
                        <div className={styles.panelHeader}>
                            <h2>Lista de Empresas</h2>
                            <div className={styles.headerDivider}></div>
                        </div>
                        
                        {/* Búsqueda y filtros */}
                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Buscar empresas por nombre, contacto o email..."
                                value={busqueda}
                                onChange={handleBusquedaChange}
                                className={styles.searchInput}
                                disabled={cargando}
                            />
                            {cargando && (
                                <div className={styles.searchLoading}>⏳</div>
                            )}
                        </div>

                        {/* Botón nueva empresa */}
                        <button 
                            onClick={abrirFormularioNuevo}
                            className={styles.btnNuevaEmpresa}
                            disabled={cargando}
                        >
                            ➕ Nueva Empresa
                        </button>

                        {/* Lista de empresas - USAR empresasFiltradas */}
                        <div className={styles.empresasList}>
                            {cargando && empresas.length === 0 ? (
                                <div className={styles.loading}>
                                    ⏳ Cargando empresas...
                                </div>
                            ) : empresasFiltradas.length > 0 ? (
                                empresasFiltradas.map(empresa => (
                                    <div
                                        key={empresa.id}
                                        className={`${styles.empresaCard} ${
                                            empresaSeleccionada?.id === empresa.id ? styles.selected : ''
                                        } ${!empresa.activo ? styles.inactiva : ''}`}
                                        onClick={() => seleccionarEmpresa(empresa)}
                                    >
                                        <div className={styles.empresaHeader}>
                                            <h3>{empresa.nombre}</h3>
                                            {!empresa.activo && <span className={styles.inactivoBadge}>Inactiva</span>}
                                        </div>
                                        <div className={styles.empresaInfo}>
                                            <div className={styles.infoRow}>
                                                <span className={styles.infoLabel}>Contacto:</span>
                                                <span className={styles.infoValue}>{empresa.contacto}</span>
                                            </div>
                                            <div className={styles.infoRow}>
                                                <span className={styles.infoLabel}>Email:</span>
                                                <span className={styles.infoValue}>{empresa.email}</span>
                                            </div>
                                            <div className={styles.infoRow}>
                                                <span className={styles.infoLabel}>Teléfono:</span>
                                                <span className={styles.infoValue}>{empresa.telefono}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.noData}>
                                    <div className={styles.noDataIcon}>🏢</div>
                                    <p>
                                        {busqueda.trim() !== '' 
                                            ? `No se encontraron empresas para "${busqueda}"`
                                            : 'No se encontraron empresas'
                                        }
                                    </p>
                                    {busqueda.trim() !== '' && (
                                        <button 
                                            onClick={() => setBusqueda('')}
                                            className={styles.btnLimpiarBusqueda}
                                        >
                                            Limpiar búsqueda
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Estadísticas rápidas */}
                        <div className={styles.statsCard}>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{empresas.length}</span>
                                <span className={styles.statLabel}>Total Empresas</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>
                                    {empresas.filter(e => e.activo).length}
                                </span>
                                <span className={styles.statLabel}>Empresas Activas</span>
                            </div>
                        </div>
                    </div>

                    {/* Panel de detalles */}
                    <div className={styles.detailsPanel}>
                        {mostrarFormulario ? (
                            <div className={styles.formularioContainer}>
                                <div className={styles.formHeader}>
                                    <h2>{modoEdicion ? 'Editar Empresa' : 'Nueva Empresa'}</h2>
                                    <div className={styles.headerDivider}></div>
                                </div>
                                
                                <form onSubmit={handleSubmit} className={styles.form}>
                                    {/* ... (el resto del formulario se mantiene igual) */}
                                    {/* Sección de Logo */}
                                    <div className={styles.logoSection}>
                                        <h4>Logo de la Empresa</h4>
                                        <div className={styles.logoContainer}>
                                            {logoPreview ? (
                                                <div className={styles.logoPreview}>
                                                    <img src={logoPreview} alt="Preview del logo" />
                                                    <button 
                                                        type="button" 
                                                        onClick={abrirSelectorArchivos}
                                                        className={styles.changeLogoButton}
                                                        disabled={subiendoLogo}
                                                    >
                                                        {subiendoLogo ? '⏳ Subiendo...' : '🔄 Cambiar Logo'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={styles.logoPlaceholder}>
                                                    <div className={styles.logoIcon}>🏢</div>
                                                    <button 
                                                        type="button" 
                                                        onClick={abrirSelectorArchivos}
                                                        className={styles.uploadLogoButton}
                                                        disabled={subiendoLogo}
                                                    >
                                                        {subiendoLogo ? '⏳ Subiendo...' : '📷 Subir Logo'}
                                                    </button>
                                                    <p>PNG, JPG, JPEG (Máx. 5MB)</p>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleLogoSelect}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                        {formData.logo && !logoPreview && (
                                            <div className={styles.logoInfo}>
                                                <strong>Logo actual:</strong> {formData.logo}
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Nombre *</label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleFormChange}
                                                required
                                                disabled={cargando}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Contacto *</label>
                                            <input
                                                type="text"
                                                name="contacto"
                                                value={formData.contacto}
                                                onChange={handleFormChange}
                                                required
                                                disabled={cargando}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleFormChange}
                                                required
                                                disabled={cargando}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Teléfono *</label>
                                            <input
                                                type="text"
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handleFormChange}
                                                required
                                                disabled={cargando}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>RFC *</label>
                                            <input
                                                type="text"
                                                name="rfc"
                                                value={formData.rfc}
                                                onChange={handleFormChange}
                                                required
                                                disabled={cargando}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Dirección *</label>
                                        <textarea
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleFormChange}
                                            rows="3"
                                            required
                                            disabled={cargando}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                name="activo"
                                                checked={formData.activo}
                                                onChange={handleFormChange}
                                                disabled={cargando}
                                            />
                                            <span className={styles.checkboxText}>Empresa activa</span>
                                        </label>
                                    </div>

                                    <div className={styles.formButtons}>
                                        <button 
                                            type="submit" 
                                            className={styles.saveButton}
                                            disabled={cargando || subiendoLogo}
                                        >
                                            {cargando ? '⏳ Guardando...' : 
                                             subiendoLogo ? '⏳ Subiendo logo...' : 
                                             (modoEdicion ? '💾 Actualizar Empresa' : '➕ Crear Empresa')}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setMostrarFormulario(false)}
                                            className={styles.cancelButton}
                                            disabled={cargando || subiendoLogo}
                                        >
                                            ❌ Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : empresaSeleccionada ? (
                            <>
                                {/* Encabezado de la empresa */}
                                <div className={styles.empresaHeader}>
                                    <div className={styles.empresaTitle}>
                                        <h2>{empresaSeleccionada.nombre}</h2>
                                        <p>{empresaSeleccionada.email}</p>
                                        <div className={styles.estadoInfo}>
                                            <span className={`${styles.estadoBadge} ${
                                                empresaSeleccionada.activo ? styles.activo : styles.inactivo
                                            }`}>
                                                {empresaSeleccionada.activo ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.empresaStats}>
                                        <div className={styles.statBadge}>
                                            <span className={styles.statBadgeNumber}>{empresaSeleccionada.contacto ? '✓' : '✗'}</span>
                                            <span className={styles.statBadgeLabel}>Contacto</span>
                                        </div>
                                        <div className={styles.statBadge}>
                                            <span className={styles.statBadgeNumber}>{empresaSeleccionada.rfc ? '✓' : '✗'}</span>
                                            <span className={styles.statBadgeLabel}>RFC</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones rápidas */}
                                <div className={styles.accionesSection}>
                                    <h3>Acciones</h3>
                                    <div className={styles.accionesGrid}>
                                        <button 
                                            onClick={() => abrirFormularioEditar(empresaSeleccionada)}
                                            className={styles.btnAccion}
                                        >
                                            ✏️ Editar Empresa
                                        </button>
                                        <button 
                                            onClick={() => eliminarEmpresa(empresaSeleccionada.id, empresaSeleccionada.nombre)}
                                            className={styles.btnAccionEliminar}
                                        >
                                            🗑️ Eliminar Empresa
                                        </button>
                                    </div>
                                </div>

                                {/* Información detallada */}
                                <div className={styles.infoSection}>
                                    <h3>Información de la Empresa</h3>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoCard}>
                                            <h4>Información de Contacto</h4>
                                            <div className={styles.detalleItem}>
                                                <strong>Contacto:</strong> {empresaSeleccionada.contacto}
                                            </div>
                                            <div className={styles.detalleItem}>
                                                <strong>Email:</strong> {empresaSeleccionada.email}
                                            </div>
                                            <div className={styles.detalleItem}>
                                                <strong>Teléfono:</strong> {empresaSeleccionada.telefono}
                                            </div>
                                        </div>
                                        
                                        <div className={styles.infoCard}>
                                            <h4>Información Fiscal</h4>
                                            <div className={styles.detalleItem}>
                                                <strong>RFC:</strong> {empresaSeleccionada.rfc}
                                            </div>
                                        </div>
                                        
                                        <div className={styles.infoCard}>
                                            <h4>Dirección</h4>
                                            <div className={styles.detalleItem}>
                                                <p>{empresaSeleccionada.direccion}</p>
                                            </div>
                                        </div>

                                        {/* Mostrar logo si existe */}
                                        {empresaSeleccionada.logo && (
                                            <div className={styles.infoCard}>
                                                <h4>Logo</h4>
                                                <div className={styles.logoDisplay}>
                                                    <img 
                                                        src={`${API_BASE_URL}/uploads/logos/${empresaSeleccionada.logo}`} 
                                                        alt={`Logo de ${empresaSeleccionada.nombre}`}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                    <span>{empresaSeleccionada.logo}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className={styles.placeholder}>
                                <div className={styles.placeholderIcon}>🏢</div>
                                <h3>Selecciona una Empresa</h3>
                                <p>Elige una empresa de la lista para ver sus detalles o crea una nueva</p>
                                <div className={styles.statsPreview}>
                                    <span className={styles.statsPreviewLabel}>Total de empresas:</span>
                                    <span className={styles.statsPreviewValue}>{empresas.length}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}