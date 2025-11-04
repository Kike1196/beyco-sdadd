'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Documentos.module.css';

export default function Documentos() {
    const router = useRouter();
    const [selectedDocument, setSelectedDocument] = useState('');

    const documentTypes = [
        { id: 'constancia', name: 'Constancia de Estudios', icon: '📄' },
        { id: 'certificado', name: 'Certificado de Aprobación', icon: '🏆' },
        { id: 'historial', name: 'Historial Académico', icon: '📊' },
        { id: 'diploma', name: 'Diploma', icon: '🎓' }
    ];

    const handleGenerateDocument = () => {
        if (selectedDocument) {
            alert(`Generando documento: ${selectedDocument}`);
            // Lógica para generar documento
        }
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <button 
                        onClick={() => router.push('/secretaria')}
                        className={styles.backButton}
                    >
                        ← Volver al Dashboard
                    </button>
                    <div className={styles.titleSection}>
                        <h1>📄 Gestión de Documentos</h1>
                        <p>Genera y gestiona documentos académicos</p>
                    </div>
                    <div className={styles.logoSection}>
                        <img src="/logo.jpg" alt="BEYCO Consultores Logo" className={styles.logo} />
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.documentsGrid}>
                    {documentTypes.map((doc) => (
                        <div 
                            key={doc.id}
                            className={`${styles.documentCard} ${
                                selectedDocument === doc.id ? styles.selected : ''
                            }`}
                            onClick={() => setSelectedDocument(doc.id)}
                        >
                            <div className={styles.docIcon}>{doc.icon}</div>
                            <h3>{doc.name}</h3>
                            <p>Generar documento oficial</p>
                        </div>
                    ))}
                </div>

                <div className={styles.actionsSection}>
                    <button 
                        onClick={handleGenerateDocument}
                        disabled={!selectedDocument}
                        className={styles.generateButton}
                    >
                        Generar Documento Seleccionado
                    </button>
                </div>

                <div className={styles.recentDocuments}>
                    <h3>Documentos Recientes</h3>
                    <div className={styles.documentsList}>
                        <div className={styles.documentItem}>
                            <div className={styles.docInfo}>
                                <span className={styles.docName}>Constancia - Juan Pérez</span>
                                <span className={styles.docDate}>Generado hoy</span>
                            </div>
                            <button className={styles.downloadButton}>📥 Descargar</button>
                        </div>
                        <div className={styles.documentItem}>
                            <div className={styles.docInfo}>
                                <span className={styles.docName}>Certificado - María García</span>
                                <span className={styles.docDate}>Generado ayer</span>
                            </div>
                            <button className={styles.downloadButton}>📥 Descargar</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}