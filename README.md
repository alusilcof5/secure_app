# 🌸 Camina Segura - Frontend

Aplicación frontend para análisis de movilidad urbana segura en Catalunya basada en datos abiertos.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:3000`

### Build para Producción

```bash
npm run build
```

## 📁 Estructura del Proyecto

```
camina-segura-frontend/
├── public/
│   └── data/                   # CSVs de datos
│       ├── opendatabcn_llista-equipaments_cultura-csv.csv
│       ├── opendatabcn_restaurants_restaurants-csv.csv
│       └── opendatabcn_llista-equipaments_centres-informacio-csv.csv
├── src/
│   ├── components/             # Componentes reutilizables
│   │   ├── Header.jsx          # Header con navegación
│   │   ├── Footer.jsx          # Footer
│   │   ├── MapComponent.jsx    # ✅ Mapa interactivo Leaflet
│   │   └── MapFilters.jsx      # ✅ Panel de filtros
│   ├── pages/                  # Páginas de la aplicación
│   │   ├── HomePage.jsx        # ✅ Página de inicio
│   │   ├── MapaPage.jsx        # ✅ Página de mapa COMPLETA
│   │   └── OtherPages.jsx      # Otras páginas (placeholder)
│   ├── services/               # Servicios de datos
│   │   └── dataService.js      # ✅ Carga y procesamiento de CSVs + APIs
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Punto de entrada
│   └── index.css               # Estilos globales con Tailwind
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## ✅ Estado Actual: Parte 1 + 2 COMPLETAS

### Parte 1 - HOME ✅
1. **Header con navegación**
2. **Home Page completa**
3. **Footer**

### Parte 2 - MAPA ✅ NUEVA!

#### 🗺️ Mapa Interactivo con Leaflet
- Visualización de todos los equipamientos en Barcelona y Catalunya
- Marcadores personalizados por tipo con colores diferentes
- Popups informativos con detalles completos
- Ajuste automático de vista según filtros

#### 🎛️ Sistema de Filtros Completo
1. **Por Tipo de Equipamiento:**
   - 🎭 Equipamientos Culturales (museos, teatres, biblioteques)
   - 🍽️ Restaurantes
   - ℹ️ Centros de Información
   - 🏛️ Equipamientos de Catalunya (API)

2. **Por Distrito/Municipio:**
   - Todos los distritos de Barcelona
   - Municipios de Catalunya

3. **Búsqueda por Nombre:**
   - Búsqueda en tiempo real
   - Filtra por nombre o categoría

#### 📊 Estadísticas en Tiempo Real
- Contador de lugares encontrados
- Estadísticas por tipo de equipamiento
- Actualización dinámica según filtros

#### 🔗 Fuentes de Datos Integradas

**CSVs Locales:**
1. Equipamientos Culturales de Barcelona (~6,000 registros)
2. Restaurantes de Barcelona (~1,000 registros)
3. Centros de Información (~100 registros)

**APIs de Catalunya:**
1. **Equipamientos Catalunya** 
   - Endpoint: `https://analisi.transparenciacatalunya.cat/api/v3/views/48s6-82h2/query.json`
   - Equipamientos de toda Catalunya

2. **Población Catalunya**
   - Endpoint: `https://analisi.transparenciacatalunya.cat/api/v3/views/8gmd-gz7i/query.json`
   - Datos demográficos por municipio

## 🎨 Tecnologías Usadas

- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Leaflet** - Mapas interactivos ✅ IMPLEMENTADO
- **Fetch API** - Consumo de APIs REST

## 🎯 Características Implementadas

### Mapa
- ✅ Carga de datos desde CSVs locales
- ✅ Integración con APIs de Catalunya
- ✅ Marcadores personalizados por tipo
- ✅ Popups informativos
- ✅ Zoom y navegación fluida

### Filtros
- ✅ Filtrado por tipo (checkbox múltiple)
- ✅ Filtrado por distrito/municipio
- ✅ Búsqueda textual en tiempo real
- ✅ Botón "Limpiar filtros"
- ✅ Estadísticas dinámicas

### UX
- ✅ Loading state mientras carga datos
- ✅ Error handling robusto
- ✅ Contador de resultados
- ✅ Panel lateral con información del marcador seleccionado
- ✅ Diseño responsive

## 📝 Próximos Pasos (Parte 3)

- Página de Análisis
- Página de Simulador
- Página de Datos Abiertos
- Gráficos y visualizaciones

## 🔧 Troubleshooting

### Los CSVs no cargan
Asegúrate de que los archivos CSV estén en `public/data/`

### El mapa no se ve
Verifica que Leaflet CSS esté cargado en `index.html`

### CORS errors con las APIs
Las APIs de Catalunya tienen CORS habilitado, deberían funcionar directamente

## 📊 Datos Cargados

Al iniciar la app verás en consola:
```
🔄 Cargando datos...
✅ Datos cargados: {
  cultural: 6112,
  restaurants: 1045,
  infoCenters: 89,
  equipaments: [según API],
  population: [según API]
}
```

---

**🎉 PARTE 2 COMPLETADA - Mapa totalmente funcional con datos reales!**
# secure_app
