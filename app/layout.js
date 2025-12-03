import './global.css';

export const metadata = {
  title: 'ViveHogar',
  description: 'Gestor de tareas del hogar',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  const footer = {
    position: "absolute",
    left: 80,
    bottom: 0,
  };
  return (
    <html lang="en">
      <body className="auth-layout">
        {children}
        <footer style={footer}>
          <p>© 2025 ViveHogar - Todos los derechos reservados</p>
        </footer>
      </body>
    </html>
);
}


