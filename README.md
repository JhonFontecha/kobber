# Kobber — Herramienta interna

Cargador de catálogos de herramientas para publicación en MercadoLibre.

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre http://localhost:5173 en tu navegador.

## Build para producción

```bash
npm run build
```

## Estructura

```
kobber/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    └── components/
        ├── StepIndicator.jsx
        ├── ImageUpload.jsx
        ├── CategorySelect.jsx
        └── PercentageSelector.jsx
```

## Pendiente

- [ ] Conectar procesamiento interno de imagen (App.jsx → handleProcess)
- [ ] Cargar categorías dinámicamente desde API
- [ ] Definir porcentajes desde configuración
