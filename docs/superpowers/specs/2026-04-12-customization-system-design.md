# Flora Customization System — Design Spec
**Date:** 2026-04-12  
**Status:** Approved  
**Scope:** Sistema de personalización visual y estacional para el widget Flora

---

## Contexto

Flora Chatbot Template es un producto comercializable. Los compradores del template (otros dueños de tiendas Shopify) necesitan personalizar la apariencia del widget para que coincida con su marca. Toda la personalización se gestiona desde el **Panel Admin de Flora (Fase 6)** — no desde el Shopify Theme Editor.

---

## Qué es personalizable

### Apariencia visual
| Campo | Opciones |
|-------|----------|
| Colores | Primary, secondary, accent, user bubble, bot bubble, background, text |
| Tipografía | Font family, font size |
| Bordes | Radio (rounded / square / sharp) |
| Tamaño del widget | Width, height |
| Posición | bottom-right, bottom-left, top-right, top-left |
| Modo | floating, side-panel, fullscreen, embed |

### Botón flotante (FAB)
| Campo | Opciones |
|-------|----------|
| Forma | `circle`, `rounded-square`, `pill`, `square` |
| Tamaño | `sm` (36px), `md` (48px) |
| Label (solo pill) | Texto libre: "Chat", "Ask Flora", etc. |

### Identidad del bot
- Nombre del bot (ej: "Flora", "Planty", "Leaf")
- Avatar: imagen URL o emoji fallback
- Mensaje de bienvenida (en + es)

### Features (toggles on/off)
- Análisis de imágenes (vision)
- Medidor de luz
- Rastreo de pedidos
- Quick actions
- White label (ocultar "Powered by Flora")

### Temas de temporada
- Activar/desactivar por tema: Halloween, Christmas, Valentine's, Spring, Summer
- Auto-switch por fecha o override manual
- Fechas de inicio/fin configurables por tenant

---

## Arquitectura

```
Panel Admin (Fase 6)
       │
       │ POST /webhook/flora-config-save
       ▼
n8n Config Store (Static Data por tenant_id)
       │
       │ GET /webhook/flora-config?tenant=xxx
       ▼
Widget (al cargar en Shopify)
       │
       │ Aplica CSS custom properties + DOM overrides
       ▼
ThemeEngine (detecta fecha → aplica tema estacional encima)
```

### Config API (n8n)
- `GET /webhook/flora-config?tenant={tenant_id}` → devuelve `flora.config.json` del tenant
- `POST /webhook/flora-config-save` → guarda config (autenticado desde admin panel)

---

## Estructura de flora.config.json

```json
{
  "tenant_id": "allaboutplanties",
  "bot": {
    "name": "Flora",
    "avatar_url": "/assets/flora-avatar.png",
    "avatar_fallback": "🌿",
    "welcome_message": {
      "en": "Hi! I'm Flora 🌿 How can I help you today?",
      "es": "¡Hola! Soy Flora 🌿 ¿En qué puedo ayudarte hoy?"
    }
  },
  "appearance": {
    "colors": {
      "primary": "#2D5A27",
      "secondary": "#4A7C43",
      "accent": "#8FBC8F",
      "user_bubble": "#2D5A27",
      "bot_bubble": "#F0F5EF",
      "background": "#FFFFFF",
      "text": "#333333"
    },
    "typography": {
      "font_family": "system-ui",
      "font_size": "14px"
    },
    "borders": {
      "radius": "16px",
      "style": "rounded"
    },
    "fab": {
      "shape": "circle",
      "size": "md",
      "label": ""
    },
    "widget": {
      "position": "bottom-right",
      "mode": "floating",
      "width": "380px",
      "height": "580px"
    }
  },
  "features": {
    "vision": true,
    "light_meter": true,
    "orders": true,
    "quick_actions": true,
    "white_label": false
  },
  "seasonal": {
    "enabled": true,
    "auto_switch": true,
    "current_override": null,
    "themes": {
      "halloween":  { "enabled": true, "start": "10-15", "end": "11-01" },
      "christmas":  { "enabled": true, "start": "12-01", "end": "12-31" },
      "valentines": { "enabled": true, "start": "02-01", "end": "02-15" },
      "spring":     { "enabled": true, "start": "03-20", "end": "06-20" },
      "summer":     { "enabled": true, "start": "06-21", "end": "09-22" }
    }
  }
}
```

---

## Cómo el widget obtiene el tenant_id

El `tenant_id` viene del `data-flora-shop` inyectado por `embed-block.liquid` (el dominio permanente de la tienda Shopify, ej: `allaboutplanties.myshopify.com`). El `config-loader.js` lo lee del DOM al init.

## Cómo el widget aplica la config

1. Al cargar, el widget lee `tenant_id` de `data-flora-shop` en el DOM
2. Hace `GET /webhook/flora-config?tenant={tenant_id}`
2. Mapea `appearance.colors` a CSS custom properties en `:root`
3. Aplica `fab.shape` y `fab.size` como clases CSS en el botón flotante
4. Inyecta `bot.name` y `bot.avatar` en el DOM del header
5. ThemeEngine detecta la fecha actual y, si hay tema activo, aplica sus `overrides` encima de la config base
6. Si `features.white_label === true`, oculta el footer "Powered by Flora"

---

## Panel Admin Flora (Fase 6) — secciones

| Sección | Contenido |
|---------|-----------|
| **Appearance** | Color pickers, font selector, border style, widget size |
| **Bot Identity** | Nombre, avatar upload, mensajes de bienvenida (en/es) |
| **FAB Style** | Selector de forma (visual), selector de tamaño, campo label |
| **Seasonal Themes** | Toggle por temporada, fechas editables, preview del tema |
| **Features** | Toggles on/off para cada feature |
| **Live Preview** | Widget renderizado en tiempo real con los cambios actuales |

---

## Archivos a crear / modificar

### Nuevos
- `n8n-workflows/config/config-get.json` — workflow GET config por tenant
- `n8n-workflows/config/config-save.json` — workflow POST guardar config
- `packages/core/engine/config-loader.js` — fetcher de config al init del widget
- `packages/widget/components/ChatWidget.js` — modificar para consumir config dinámico
- `packages/widget/themes/theme-engine.js` — modificar para aceptar config estacional del JSON

### Modificados
- `packages/widget/themes/variables.css` — mantener como fallback default
- `packages/core/i18n/i18n-manager.js` — leer welcome message desde config

---

## Decisiones de diseño

- **Una config por tenant**: cada tienda que compra Flora tiene su propio `tenant_id` y su propia config aislada en n8n
- **CSS custom properties**: toda la personalización visual se aplica vía CSS vars, no inline styles, para que los temas estacionales puedan hacer override limpiamente
- **ThemeEngine como capa encima**: los temas de temporada no reemplazan la config — la extienden. Cuando termina la temporada, vuelve automáticamente a la config base
- **Fallback en variables.css**: si la config API falla, el widget usa los valores por defecto del CSS — nunca se ve roto

---

## Fuera de scope (este spec)

- Autenticación del admin panel (se diseña en Fase 6)
- Editor visual de prompts y FAQs (Fase 6)
- Analytics (Fase 6)
- Custom CSS avanzado (futuro)
