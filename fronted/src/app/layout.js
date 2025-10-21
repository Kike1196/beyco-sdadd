import './globals.css'; // Asegúrate de que tus estilos globales estén aquí

export const metadata = {
  title: 'BEYCO Consultores',
  description: 'Sistema de Gestión BEYCO',
};

import { ReactNode } from 'react';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="app-container">
          {/* Aquí podrías tener un encabezado o barra de navegación común */}
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}