'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Usuarios.module.css';

// --- Componente para la Fila de Edición ---
const EditRow = ({ user, onChange, onFirmaClick, signatureFileName }) => {
  // Función para convertir ID de rol a texto
  const getRolText = (idRol) => {
    switch(parseInt(idRol)) {
      case 1: return 'Administrador';
      case 2: return 'Instructor';
      case 3: return 'Secretaria';
      default: return 'Administrador';
    }
  };

  // Función para convertir texto de rol a ID
  const getRolId = (rolText) => {
    switch(rolText) {
      case 'Administrador': return 1;
      case 'Instructor': return 2;
      case 'Secretaria': return 3;
      default: return 1;
    }
  };

  const handleRolChange = (e) => {
    const rolId = getRolId(e.target.value);
    const simulatedEvent = {
      target: {
        name: 'idRol',
        value: rolId
      }
    };
    onChange(simulatedEvent);
  };

  return (
    <tr className={styles.newRow}>
      <td><input type="text" name="nombre" value={user.nombre || ''} onChange={onChange} placeholder="Nombre" /></td>
      <td><input type="text" name="apellidoPaterno" value={user.apellidoPaterno || ''} onChange={onChange} placeholder="A. Paterno" /></td>
      <td><input type="text" name="apellidoMaterno" value={user.apellidoMaterno || ''} onChange={onChange} placeholder="A. Materno" /></td>
      <td><input type="email" name="correo" value={user.correo || ''} onChange={onChange} placeholder="Correo" /></td>
      <td>
        <input 
          type="password" 
          name="contrasena" 
          value={user.contrasena || ''} 
          onChange={onChange} 
          placeholder="Dejar vacío para mantener actual"
          className={styles.passwordInput}
        />
      </td>
      <td>
        <select 
          name="idRol" 
          value={getRolText(user.idRol)} 
          onChange={handleRolChange}
          className={styles.rolSelect}
        >
          <option value="Administrador">Administrador</option>
          <option value="Instructor">Instructor</option>
          <option value="Secretaria">Secretaria</option>
        </select>
      </td>
      <td>
        <label className={styles.activoLabel}>
          <input 
            type="checkbox" 
            name="activo" // CORRECCIÓN: Se añade el name
            checked={user.activo || false} 
            onChange={onChange} // CORRECCIÓN: Se usa el manejador genérico
            className={styles.activoCheckbox}
          />
          <span className={styles.activoText}>
            {user.activo ? 'Activo' : 'Inactivo'}
          </span>
        </label>
      </td>
      <td>
        <input 
          type="text" 
          name="preguntaRecuperacion" 
          value={user.preguntaRecuperacion || ''} 
          onChange={onChange} 
          placeholder="Pregunta de recuperación" 
        />
      </td>
      <td>
        <input 
          type="text" 
          name="respuestaRecuperacion" 
          value={user.respuestaRecuperacion || ''} 
          onChange={onChange} 
          placeholder="Respuesta de recuperación" 
        />
      </td>
      <td>
        <input 
          type="date" 
          name="fechaIngreso" 
          value={user.fechaIngreso || ''} 
          onChange={onChange} 
          className={styles.dateInput}
        />
      </td>
      <td>
        <button onClick={onFirmaClick} className={styles.firmaButton}>
          {user.firma && user.firma !== 'default_firma.png' ? 'Cambiar firma' : 'Subir firma'}
        </button>
        {signatureFileName && <span className={styles.fileName}>{signatureFileName.substring(0,10)}...</span>}
        {!signatureFileName && user.firma && user.firma !== 'default_firma.png' && (
          <span className={styles.fileName}>Firma actual</span>
        )}
      </td>
    </tr>
  );
};

// --- Modal de Confirmación Personalizado ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.confirmModal}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className={styles.modalButtons}>
          <button onClick={onConfirm} className={styles.btnEliminar}>
            Aceptar
          </button>
          <button onClick={onClose} className={styles.btnCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    nuevaContrasena: '',
    confirmarContrasena: ''
  });

  // Estados para modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Sistema de notificaciones
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const initialNewUserState = { 
    nombre: '', apellidoPaterno: '', apellidoMaterno: '', 
    correo: '', contrasena: '', idRol: 1,
    preguntaRecuperacion: '', respuestaRecuperacion: '',
    activo: true, fechaIngreso: new Date().toISOString().split('T')[0],
    firma: 'default_firma.png'
  };
  const [newUser, setNewUser] = useState(initialNewUserState);
  const [signatureFile, setSignatureFile] = useState(null);
  const fileInputRef = useRef(null);

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

  // Función para convertir ID de rol a texto (para mostrar en la tabla)
  const getRolText = (idRol) => {
    switch(parseInt(idRol)) {
      case 1: return 'Administrador';
      case 2: return 'Instructor';
      case 3: return 'Secretaria';
      default: return 'Administrador';
    }
  };

  // Función para mostrar estado
  const getActivoStatus = (activo) => {
    return activo ? '✅ Activo' : '❌ Inactivo';
  };

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/usuarios');
        if (!response.ok) {
          const errorText = await response.text();
          let errorMsg = `Error ${response.status}: ${response.statusText}`;
          if (errorText) errorMsg += ` - ${errorText.substring(0, 200)}`;
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error("No se pudo cargar la lista de usuarios:", error);
        showNotification("Error al cargar usuarios: " + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  const handleSelectUser = (usuario) => {
    if (isAdding || isEditing || isChangingPassword) return;
    setSelectedUser(usuario);
  };

  const handleAgregarClick = () => {
    setIsAdding(true);
    setSelectedUser(null);
    setIsEditing(false);
    setIsChangingPassword(false);
    setNewUser(initialNewUserState);
  };

  const handleCancelarClick = () => {
    setIsAdding(false);
    setIsEditing(false);
    setIsChangingPassword(false);
    setEditingUser(null);
    setSignatureFile(null);
    showNotification('Operación cancelada', 'warning');
  };

  const handleModificarClick = () => {
    if (!selectedUser) {
      showNotification("Por favor, selecciona un usuario para modificar.", 'warning');
      return;
    }
    
    // Cargar TODOS los datos correctamente incluyendo pregunta y respuesta
    const userToEdit = {
      numEmpleado: selectedUser.numEmpleado,
      nombre: selectedUser.nombre || '',
      apellidoPaterno: selectedUser.apellidoPaterno || '',
      apellidoMaterno: selectedUser.apellidoMaterno || '',
      correo: selectedUser.correo || '',
      contrasena: '', // No cargar contraseña real por seguridad
      idRol: selectedUser.idRol ? Number(selectedUser.idRol) : 1,
      activo: selectedUser.activo !== undefined ? selectedUser.activo : true,
      preguntaRecuperacion: selectedUser.preguntaRecuperacion || '',
      respuestaRecuperacion: selectedUser.respuestaRecuperacion || '',
      fechaIngreso: selectedUser.fechaIngreso || new Date().toISOString().split('T')[0],
      firma: selectedUser.firma || 'default_firma.png',
    };

    setIsEditing(true);
    setEditingUser(userToEdit);
    setIsAdding(false);
    setIsChangingPassword(false);
    setSignatureFile(null);
  };

  // Función para manejar el clic en "Cambiar Contraseña"
  const handleCambiarContrasenaClick = () => {
    if (!selectedUser) {
      showNotification("Por favor, selecciona un usuario para cambiar la contraseña.", 'warning');
      return;
    }
    setIsChangingPassword(true);
    setPasswordData({ nuevaContrasena: '', confirmarContrasena: '' });
  };

  // Función para manejar el cambio en los campos de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para guardar la nueva contraseña
  const handleGuardarContrasena = async () => {
    if (!passwordData.nuevaContrasena || !passwordData.confirmarContrasena) {
      showNotification("Por favor, completa ambos campos de contraseña.", 'warning');
      return;
    }

    if (passwordData.nuevaContrasena !== passwordData.confirmarContrasena) {
      showNotification("Las contraseñas no coinciden.", 'error');
      return;
    }

    if (passwordData.nuevaContrasena.length < 6) {
      showNotification("La contraseña debe tener al menos 6 caracteres.", 'warning');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/actualizar-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: selectedUser.correo,
          nuevaContrasena: passwordData.nuevaContrasena
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            errorMessage = `${errorMessage} - ${errorText}`;
          }
        }
        throw new Error(errorMessage);
      }

      showNotification("Contraseña actualizada exitosamente", 'success');
      setIsChangingPassword(false);
      setPasswordData({ nuevaContrasena: '', confirmarContrasena: '' });
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      showNotification("Error al cambiar la contraseña: " + error.message, 'error');
    }
  };

  // Función para cancelar el cambio de contraseña
  const handleCancelarContrasena = () => {
    setIsChangingPassword(false);
    setPasswordData({ nuevaContrasena: '', confirmarContrasena: '' });
    showNotification('Cambio de contraseña cancelado', 'warning');
  };

  // Función para eliminar con modal personalizado
  const handleEliminarClick = () => {
    if (!selectedUser) {
      showNotification("Por favor, selecciona un usuario para eliminar.", 'warning');
      return;
    }
    
    setUserToDelete(selectedUser);
    setShowDeleteModal(true);
  };

  const confirmEliminar = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/${userToDelete.numEmpleado}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        if (errorText) errorMsg += ` - ${errorText.substring(0, 200)}`;
        throw new Error(errorMsg);
      }
      
      setUsuarios(usuarios.filter(u => u.numEmpleado !== userToDelete.numEmpleado));
      setSelectedUser(null);
      showNotification(`Usuario ${userToDelete.nombre} eliminado exitosamente`, 'success');
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      showNotification('No se pudo eliminar el usuario: ' + error.message, 'error');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleGuardarClick = async () => {
    if (isAdding) {
      try {
        // Validaciones adicionales
        if (!newUser.nombre || !newUser.correo || !newUser.idRol) {
          showNotification("Por favor, completa los campos obligatorios: Nombre, Correo y Rol", 'warning');
          return;
        }

        const userPayload = { 
          ...newUser, 
          preguntaRecuperacion: newUser.preguntaRecuperacion || '',
          respuestaRecuperacion: newUser.respuestaRecuperacion || '',
          firma: newUser.firma || 'default_firma.png'
        };

        const response = await fetch('http://localhost:8080/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userPayload),
        });

        if (!response.ok) {
          let errorMessage = `Error ${response.status}: ${response.statusText}`;
          try {
            const errorText = await response.text();
            if (errorText) {
              try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorText;
              } catch {
                errorMessage = `${errorMessage} - ${errorText}`;
              }
            }
          } catch (textError) {
            console.error('Error al leer respuesta de error:', textError);
          }
          throw new Error(errorMessage);
        }

        const savedUser = await response.json();

        if (signatureFile) {
          const formData = new FormData();
          formData.append('firmaFile', signatureFile);
          const firmaResponse = await fetch(`http://localhost:8080/api/usuarios/${savedUser.numEmpleado}/firma`, {
            method: 'POST',
            body: formData,
          });
          if (!firmaResponse.ok) {
            const firmaError = await firmaResponse.text();
            console.warn("Firma no subida:", firmaError);
          } else {
            const firmaData = await firmaResponse.json();
            savedUser.firma = firmaData.filePath;
          }
        }

        setUsuarios(prev => [...prev, savedUser]);
        showNotification("Usuario creado exitosamente", 'success');
        
        // Resetear solo después de éxito
        setIsAdding(false);
        setNewUser(initialNewUserState);
        setSignatureFile(null);
      } catch (error) {
        console.error("Error al crear usuario:", error);
        showNotification("Error al crear usuario: " + error.message, 'error');
      }
    } else if (isEditing) {
      if (!editingUser?.numEmpleado) {
        showNotification("ID de usuario inválido. No se puede actualizar.", 'error');
        return;
      }

      try {
        // Validaciones para edición
        if (!editingUser.nombre || !editingUser.correo || !editingUser.idRol) {
          showNotification("Por favor, completa los campos obligatorios: Nombre, Correo y Rol", 'warning');
          return;
        }

        // Enviar todos los datos incluyendo estado activo
        const updateData = { 
          ...editingUser,
          activo: editingUser.activo !== undefined ? editingUser.activo : true
        };

        const response = await fetch(`http://localhost:8080/api/usuarios/${editingUser.numEmpleado}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          let errorMessage = `Error ${response.status}: ${response.statusText}`;
          try {
            const errorText = await response.text();
            if (errorText) {
              try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorText;
              } catch {
                errorMessage = `${errorMessage} - ${errorText}`;
              }
            }
          } catch (textError) {
            console.error('Error al leer respuesta de error:', textError);
          }
          throw new Error(errorMessage);
        }

        let updatedUser = await response.json();

        if (signatureFile) {
          const formData = new FormData();
          formData.append('firmaFile', signatureFile);
          const firmaResponse = await fetch(`http://localhost:8080/api/usuarios/${editingUser.numEmpleado}/firma`, {
            method: 'POST',
            body: formData,
          });
          if (!firmaResponse.ok) {
            const firmaError = await firmaResponse.text();
            console.warn("Firma no subida:", firmaError);
          } else {
            const firmaData = await firmaResponse.json();
            updatedUser = { ...updatedUser, firma: firmaData.filePath };
          }
        }

        setUsuarios(usuarios.map(u => u.numEmpleado === updatedUser.numEmpleado ? updatedUser : u));
        showNotification("Usuario actualizado exitosamente", 'success');
        
        // Resetear solo después de éxito
        setIsEditing(false);
        setEditingUser(null);
        setSelectedUser(null);
        setSignatureFile(null);
      } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        showNotification("Error al actualizar usuario: " + error.message, 'error');
      }
    }
  };

  // CORRECCIÓN: Manejador de cambios unificado para todos los inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Si el input es un checkbox, el valor que nos interesa es `checked`
    const finalValue = type === 'checkbox' ? checked : value;

    if (isAdding) {
      setNewUser(prev => ({ 
        ...prev, 
        // Convertir idRol a número, mantener los demás valores como están
        [name]: name === 'idRol' && finalValue !== '' ? Number(finalValue) : finalValue 
      }));
    } else if (isEditing) {
      setEditingUser(prev => ({ 
        ...prev, 
        [name]: name === 'idRol' && finalValue !== '' ? Number(finalValue) : finalValue 
      }));
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSignatureFile(e.target.files[0]);
      showNotification('Archivo seleccionado: ' + e.target.files[0].name, 'success');
    }
  };

  const handleFirmaClick = () => {
    fileInputRef.current.click();
  };

  const getFileName = (filePath) => {
    if (!filePath) return '';
    return filePath.split(/[\\/]/).pop() || filePath;
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Asegurarse de que la fecha se interprete correctamente como UTC para evitar problemas de zona horaria
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { timeZone: 'UTC' });
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

      <header className={styles.header}>
        <div className={styles.titleSection}><h1>Usuarios</h1></div>
        <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
      </header>
      <main className={styles.mainContent}>
        <div className={styles.tableContainer}>
          {loading ? <p>Cargando...</p> : (
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>A. Paterno</th>
                  <th>A. Materno</th>
                  <th>Correo</th>
                  <th>Contraseña</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Pregunta</th>
                  <th>Respuesta</th>
                  <th>Fecha Ingreso</th>
                  <th>Firma</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <EditRow 
                    user={newUser} 
                    onChange={handleInputChange}
                    onFirmaClick={handleFirmaClick}
                    signatureFileName={signatureFile?.name}
                  />
                )}
                {usuarios.map(usuario => (
                  isEditing && editingUser?.numEmpleado === usuario.numEmpleado 
                    ? <EditRow 
                        key={usuario.numEmpleado} 
                        user={editingUser} 
                        onChange={handleInputChange}
                        onFirmaClick={handleFirmaClick}
                        signatureFileName={signatureFile?.name || getFileName(editingUser?.firma)}
                      />
                    : (
                      <tr 
                        key={usuario.numEmpleado} 
                        onClick={() => handleSelectUser(usuario)}
                        className={selectedUser?.numEmpleado === usuario.numEmpleado ? styles.selectedRow : ''}
                      >
                        <td>{usuario.nombre}</td>
                        <td>{usuario.apellidoPaterno}</td>
                        <td>{usuario.apellidoMaterno}</td>
                        <td>{usuario.correo}</td>
                        <td>********</td>
                        <td>{getRolText(usuario.idRol)}</td>
                        <td>{getActivoStatus(usuario.activo)}</td>
                        <td>********</td>
                        <td>********</td>
                        <td>{formatDate(usuario.fechaIngreso)}</td>
                        <td>{usuario.firma && usuario.firma !== 'default_firma.png' ? '✔️' : '____'}</td>
                      </tr>
                    )
                ))}
              </tbody>
            </table>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          accept="image/*" 
        />
        
        {/* Modal para cambiar contraseña */}
        {isChangingPassword && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Cambiar Contraseña para {selectedUser?.nombre}</h3>
              <div className={styles.passwordForm}>
                <div className={styles.formGroup}>
                  <label>Nueva Contraseña:</label>
                  <input
                    type="password"
                    name="nuevaContrasena"
                    value={passwordData.nuevaContrasena}
                    onChange={handlePasswordChange}
                    placeholder="Ingresa la nueva contraseña"
                    className={styles.passwordInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Confirmar Contraseña:</label>
                  <input
                    type="password"
                    name="confirmarContrasena"
                    value={passwordData.confirmarContrasena}
                    onChange={handlePasswordChange}
                    placeholder="Confirma la nueva contraseña"
                    className={styles.passwordInput}
                  />
                </div>
                <div className={styles.modalButtons}>
                  <button onClick={handleGuardarContrasena} className={styles.btnGuardar}>
                    Guardar Contraseña
                  </button>
                  <button onClick={handleCancelarContrasena} className={styles.btnAtras}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          onConfirm={confirmEliminar}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que quieres eliminar a ${userToDelete?.nombre}?`}
        />

        <footer className={styles.footer}>
          <div className={styles.actionButtons}>
            <button onClick={handleAgregarClick} className={styles.btn} disabled={isAdding || isEditing || isChangingPassword}>Agregar</button>
            <button onClick={handleModificarClick} className={styles.btn} disabled={!selectedUser || isAdding || isEditing || isChangingPassword}>Modificar</button>
            <button onClick={handleCambiarContrasenaClick} className={styles.btn} disabled={!selectedUser || isAdding || isEditing || isChangingPassword}>Cambiar Contraseña</button>
            <button onClick={handleEliminarClick} className={styles.btn} disabled={!selectedUser || isAdding || isEditing || isChangingPassword}>Eliminar</button>
            <button onClick={handleGuardarClick} className={styles.btnGuardar} disabled={(!isAdding && !isEditing) || isChangingPassword}>Guardar</button>
            {(isAdding || isEditing) && (
              <button onClick={handleCancelarClick} className={styles.btnCancelar}>Cancelar</button>
            )}
          </div>
          <button onClick={() => router.back()} className={styles.btnAtras}>Atrás</button>
        </footer>
      </main>
    </div>
  );
}