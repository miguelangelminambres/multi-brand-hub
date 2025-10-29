import './globals.css'

export const metadata = {
  title: 'Multi-Brand Hub - Gestión de Proyectos Multi-Marca',
  description: 'Plataforma profesional para gestionar proyectos de múltiples marcas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
