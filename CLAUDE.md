# CLAUDE.md — Flora Chatbot Template

## 🎯 Misión del Proyecto

Construir **Flora Chatbot Template**: un chatbot de IA comercializable, multi-nicho, con arquitectura modular, workflows agénticos, sistema de cache local, y personalización completa. El template será dual-license (MIT core + Premium features) y deployable como SaaS o licencia única.

---

## 📋 Datos del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | `flora-chatbot-template` |
| **Repositorio** | `allaboutplanties/flora-chatbot-template` |
| **Licencia** | Dual: MIT (core/widget) + Propietaria (premium) |
| **Primer cliente** | All About Planties™ (allaboutplanties.com) |
| **Theme Shopify** | Abode 3.1.2 |
| **Idiomas** | Español + Inglés (detección automática) |
| **Backend** | n8n como API Gateway + DB temporal |
| **Modelo negocio** | SaaS mensual + Licencia única |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    WIDGET SHOPIFY                                │
│  (Flotante / Panel lateral / Fullscreen / Embed en producto)    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    n8n ORQUESTADOR                               │
│  • API Gateway (webhooks)                                        │
│  • Base de datos temporal (cache)                                │
│  • Workflows agénticos (AI Agent nodes)                          │
│  • Analytics y logging                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ CACHE LOCAL  │     │  Claude API  │     │  Shopify API │
│ (n8n DB)     │     │  (Sonnet/    │     │  (Productos, │
│              │     │   Opus)      │     │   Órdenes)   │
└──────────────┘     └──────────────┘     └──────────────┘
        │                                        
        │ Si no hay datos en cache              
        ▼                                       
┌──────────────┐     ┌──────────────┐
│  Perenual    │     │  PlantNet    │
│  API         │     │  API         │
│ (datos)      │     │ (visión)     │
└──────────────┘     └──────────────┘
```

### Flujo de Cache Inteligente

```
1. Usuario hace pregunta sobre planta
2. Orquestador busca en CACHE LOCAL (n8n DB)
3. ¿Datos encontrados?
   → SÍ: Usar datos locales (costo $0)
   → NO: Consultar API externa (Perenual/PlantNet)
        → Guardar respuesta en cache para futuras consultas
4. Responder al usuario
```

---

## 📁 Estructura del Repositorio

```
flora-chatbot-template/
│
├── 📦 packages/
│   │
│   ├── core/                          # MIT LICENSE
│   │   ├── engine/
│   │   │   ├── flora-engine.js        # Motor principal
│   │   │   ├── model-selector.js      # Selector Claude Sonnet/Opus
│   │   │   └── session-manager.js     # Gestión de sesiones
│   │   │
│   │   ├── agents/                    # Agentes agénticos
│   │   │   ├── orchestrator.js        # Orquestador principal
│   │   │   ├── vision-agent.js        # Análisis de imágenes
│   │   │   ├── light-agent.js         # Medición de luz
│   │   │   ├── orders-agent.js        # Rastreo Shopify
│   │   │   ├── cache-agent.js         # Gestión de cache
│   │   │   └── enrichment-agent.js    # Enriquecer datos
│   │   │
│   │   ├── cache/
│   │   │   ├── cache-manager.js       # CRUD operaciones cache
│   │   │   ├── cache-schema.js        # Esquema de datos
│   │   │   └── cache-sync.js          # Sync con APIs externas
│   │   │
│   │   └── i18n/
│   │       ├── en.json                # Traducciones inglés
│   │       ├── es.json                # Traducciones español
│   │       └── i18n-manager.js        # Detector de idioma
│   │
│   ├── widget/                        # MIT LICENSE
│   │   ├── components/
│   │   │   ├── ChatWidget.js          # Componente principal
│   │   │   ├── ChatBubble.js          # Burbujas de mensaje
│   │   │   ├── ChatInput.js           # Input + botones
│   │   │   ├── ProductCard.js         # Cards de producto
│   │   │   ├── ImageUpload.js         # Upload de fotos
│   │   │   └── LightMeter.js          # UI medidor de luz
│   │   │
│   │   ├── modes/
│   │   │   ├── FloatingButton.js      # Botón flotante
│   │   │   ├── SidePanel.js           # Panel lateral
│   │   │   ├── FullscreenModal.js     # Modal fullscreen
│   │   │   └── ProductEmbed.js        # Embed en productos
│   │   │
│   │   ├── themes/
│   │   │   ├── theme-engine.js        # Motor de temas
│   │   │   ├── default.css            # Tema por defecto
│   │   │   └── variables.css          # CSS variables
│   │   │
│   │   └── shopify/
│   │       ├── embed-block.liquid     # App Embed Block
│   │       ├── product-section.liquid # Sección producto
│   │       └── shopify-bridge.js      # Comunicación con Shopify
│   │
│   ├── admin/                         # PREMIUM LICENSE
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx          # Panel principal
│   │   │   ├── Analytics.jsx          # Métricas
│   │   │   └── Conversations.jsx      # Historial chats
│   │   │
│   │   ├── config/
│   │   │   ├── ThemeEditor.jsx        # Editor visual temas
│   │   │   ├── BotPersonality.jsx     # Config personalidad
│   │   │   ├── FAQManager.jsx         # Gestión FAQs
│   │   │   └── APISettings.jsx        # Config APIs
│   │   │
│   │   └── preview/
│   │       └── LivePreview.jsx        # Preview en tiempo real
│   │
│   └── premium/                       # PREMIUM LICENSE
│       ├── seasonal-themes/
│       │   ├── halloween.json         # 🎃 Halloween
│       │   ├── christmas.json         # 🎄 Navidad
│       │   ├── valentines.json        # 💝 San Valentín
│       │   ├── spring.json            # 🌸 Primavera
│       │   ├── summer.json            # ☀️ Verano
│       │   └── theme-scheduler.js     # Auto-activación
│       │
│       ├── multi-language/
│       │   └── language-pack.js       # Soporte +2 idiomas
│       │
│       └── white-label/
│           └── branding-remover.js    # Quitar marca Flora
│
├── 🔧 n8n-workflows/
│   │
│   ├── agents/                        # WORKFLOWS AGÉNTICOS
│   │   ├── orchestrator-agent.json    # Orquestador con AI Agent
│   │   ├── vision-agent.json          # Claude Vision + PlantNet fallback
│   │   ├── light-agent.json           # Análisis de luz
│   │   ├── orders-agent.json          # Shopify orders
│   │   ├── cache-agent.json           # CRUD cache n8n
│   │   └── enrichment-agent.json      # Perenual + PlantNet
│   │
│   ├── integrations/
│   │   ├── shopify-products-sync.json # Sync productos
│   │   ├── shopify-orders-webhook.json# Webhook órdenes
│   │   ├── perenual-fetch.json        # Obtener datos plantas
│   │   └── plantnet-identify.json     # ID por imagen
│   │
│   ├── setup/
│   │   ├── initial-data-load.json     # Carga inicial 293 plantas
│   │   └── cache-warmup.json          # Pre-popular cache
│   │
│   └── analytics/
│       ├── conversation-logger.json   # Log conversaciones
│       └── metrics-aggregator.json    # Agregar métricas
│
├── 📊 data/
│   │
│   ├── schemas/
│   │   ├── plant.schema.json          # Esquema planta
│   │   ├── conversation.schema.json   # Esquema conversación
│   │   ├── config.schema.json         # Esquema configuración
│   │   └── theme.schema.json          # Esquema tema
│   │
│   ├── templates/                     # Templates por nicho
│   │   ├── plants/
│   │   │   ├── config.json            # 🌱 Config plantas
│   │   │   ├── prompts.md             # Prompts plantas
│   │   │   └── sample-data.json       # Datos ejemplo
│   │   │
│   │   ├── pets/
│   │   │   ├── config.json            # 🐕 Config mascotas
│   │   │   ├── prompts.md             # Prompts mascotas
│   │   │   └── sample-data.json
│   │   │
│   │   └── generic/
│   │       ├── config.json            # 📦 Config genérico
│   │       ├── prompts.md
│   │       └── sample-data.json
│   │
│   └── seasons/
│       ├── halloween.json
│       ├── christmas.json
│       ├── valentines.json
│       └── default.json
│
├── 📝 prompts/
│   │
│   ├── base/
│   │   ├── orchestrator.md            # Prompt orquestador
│   │   ├── vision.md                  # Prompt análisis imagen
│   │   ├── light.md                   # Prompt análisis luz
│   │   └── cache.md                   # Prompt gestión cache
│   │
│   └── verticals/
│       ├── plants.md                  # Prompt nicho plantas
│       ├── pets.md                    # Prompt nicho mascotas
│       └── generic.md                 # Prompt genérico
│
├── 🔑 config/
│   ├── default.config.json            # Configuración default
│   ├── feature-flags.json             # Features on/off
│   ├── models.config.json             # Config modelos Claude
│   ├── apis.config.example.json       # Template API keys
│   └── seasonal-schedule.json         # Calendario temas
│
├── 📚 docs/
│   ├── setup/
│   │   ├── quick-start.md             # Inicio rápido
│   │   ├── shopify-install.md         # Instalar en Shopify
│   │   ├── n8n-setup.md               # Configurar n8n
│   │   └── api-keys.md                # Obtener API keys
│   │
│   ├── customization/
│   │   ├── theming.md                 # Personalizar temas
│   │   ├── prompts.md                 # Personalizar prompts
│   │   ├── verticals.md               # Crear nuevo vertical
│   │   └── seasonal.md                # Crear tema temporada
│   │
│   ├── api/
│   │   ├── webhook-reference.md       # Referencia webhooks
│   │   ├── config-schema.md           # Esquema config
│   │   └── widget-api.md              # API del widget
│   │
│   └── deployment/
│       ├── production.md              # Deploy producción
│       ├── scaling.md                 # Escalar sistema
│       └── monitoring.md              # Monitoreo
│
├── 🧪 tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── CLAUDE.md                          # Este archivo
├── LICENSE-MIT                        # Licencia MIT (core)
├── LICENSE-PREMIUM                    # Licencia Premium
├── README.md                          # Documentación principal
├── package.json
└── .env.example
```

---

## 🔑 APIs y Credenciales Necesarias

### Requeridas (obtener ANTES de empezar)

| API | URL | Uso | Límite gratuito |
|-----|-----|-----|-----------------|
| **Perenual** | https://perenual.com/docs/api | Datos de plantas | 100 req/día |
| **PlantNet** | https://my.plantnet.org | ID por imagen | 500 req/día |
| **Anthropic** | Ya configurada | Claude API | Según plan |

### Configuradas (ya disponibles)

| Servicio | Estado | Conexión |
|----------|--------|----------|
| n8n | ✅ Activo | MCP Server |
| Shopify | ✅ Activo | CLI |
| Gmail | ✅ Activo | MCP |
| Microsoft Clarity | ✅ Activo | MCP |

### Pendientes de configurar

| MCP Server | Prioridad | Uso |
|------------|-----------|-----|
| GitHub MCP | 🔴 Alta | Commits automáticos |
| Google Sheets MCP | 🟡 Media | Analytics exportados |

---

## 🤖 Workflows Agénticos (AI Agent Nodes)

### Arquitectura de Agentes

```
                    ┌─────────────────┐
                    │  ORQUESTADOR    │
                    │  (AI Agent)     │
                    │                 │
                    │ Decide qué      │
                    │ agente usar     │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ CACHE AGENT │     │ VISION      │     │ ORDERS      │
│             │     │ AGENT       │     │ AGENT       │
│ • Buscar    │     │             │     │             │
│ • Guardar   │     │ • Identificar│    │ • Rastrear  │
│ • Invalidar │     │ • Diagnóstico│    │ • Estado    │
└─────────────┘     │ • Espacio   │     └─────────────┘
                    └─────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
           ┌─────────────┐   ┌─────────────┐
           │ LIGHT AGENT │   │ ENRICHMENT  │
           │             │   │ AGENT       │
           │ • Foto      │   │             │
           │ • Sensor    │   │ • Perenual  │
           │ • Recomendar│   │ • PlantNet  │
           └─────────────┘   └─────────────┘
```

### Configuración del Orquestador (AI Agent Node)

```json
{
  "node": "AI Agent",
  "parameters": {
    "model": "claude-sonnet-4-20250514",
    "systemPrompt": "Eres el orquestador de Flora. Tu trabajo es:\n1. Entender la intención del usuario\n2. Decidir qué agente especializado debe responder\n3. Coordinar respuestas entre múltiples agentes si es necesario\n\nAgentes disponibles:\n- cache_agent: Buscar/guardar datos en cache local\n- vision_agent: Analizar imágenes de plantas\n- light_agent: Medir luz y recomendar plantas\n- orders_agent: Rastrear pedidos Shopify\n- enrichment_agent: Obtener datos de APIs externas",
    "tools": [
      "cache_agent",
      "vision_agent", 
      "light_agent",
      "orders_agent",
      "enrichment_agent"
    ]
  }
}
```

---

## 🎨 Sistema de Personalización

### Configuración Visual (config/theme.json)

```json
{
  "visual": {
    "colors": {
      "primary": "#2D5A27",
      "secondary": "#4A7C43",
      "accent": "#8FBC8F",
      "background": "#FFFFFF",
      "text": "#333333"
    },
    "typography": {
      "fontFamily": "system-ui, -apple-system, sans-serif",
      "fontSize": {
        "small": "12px",
        "base": "14px",
        "large": "16px"
      }
    },
    "borders": {
      "radius": "16px",
      "style": "rounded"
    },
    "widget": {
      "size": "normal",
      "position": "bottom-right",
      "mode": "floating"
    },
    "animations": {
      "enabled": true,
      "duration": "0.3s"
    }
  },
  "avatar": {
    "type": "custom",
    "url": "/assets/flora-avatar.png",
    "fallback": "🌿"
  },
  "seasonal": {
    "enabled": true,
    "autoSwitch": true,
    "current": "default"
  }
}
```

### Configuración de Contenido (config/content.json)

```json
{
  "bot": {
    "name": "Flora",
    "personality": {
      "tone": "friendly",
      "style": "expert",
      "emoji_usage": "moderate"
    }
  },
  "messages": {
    "welcome": {
      "en": "Hi! I'm Flora 🌿 How can I help you with your plants today?",
      "es": "¡Hola! Soy Flora 🌿 ¿En qué puedo ayudarte con tus plantas hoy?"
    },
    "fallback": {
      "en": "I'm not sure I understood. Could you rephrase that?",
      "es": "No estoy segura de haber entendido. ¿Podrías reformular?"
    },
    "error": {
      "en": "Oops! Something went wrong. Please try again.",
      "es": "¡Ups! Algo salió mal. Por favor intenta de nuevo."
    }
  },
  "faqs": [
    {
      "question": { "en": "How do I track my order?", "es": "¿Cómo rastreo mi pedido?" },
      "answer": { "en": "Just share your email or order number!", "es": "¡Solo comparte tu email o número de orden!" }
    }
  ],
  "language": {
    "default": "en",
    "supported": ["en", "es"],
    "detection": "auto"
  }
}
```

### Temas de Temporada (data/seasons/halloween.json)

```json
{
  "id": "halloween",
  "name": "Halloween",
  "emoji": "🎃",
  "dateRange": {
    "start": "10-15",
    "end": "11-01"
  },
  "overrides": {
    "colors": {
      "primary": "#FF6B35",
      "secondary": "#1A1A2E",
      "accent": "#E94560"
    },
    "avatar": {
      "url": "/assets/seasons/flora-halloween.png",
      "fallback": "🎃"
    },
    "messages": {
      "welcome": {
        "en": "Boo! 🎃 I'm Flora, your spooky plant expert!",
        "es": "¡Buu! 🎃 ¡Soy Flora, tu experta en plantas espeluznante!"
      }
    }
  }
}
```

---

## 📊 Esquema de Cache (n8n Database)

### Tabla: plants_cache

```json
{
  "id": "string (slug)",
  "shopify_id": "string (gid://shopify/Product/...)",
  "name": {
    "common": "string",
    "scientific": "string",
    "aliases": ["string"]
  },
  "care": {
    "light": {
      "lux_min": "number",
      "lux_max": "number",
      "type": "string",
      "description": { "en": "string", "es": "string" }
    },
    "watering": {
      "frequency": "string",
      "humidity": "string",
      "description": { "en": "string", "es": "string" }
    },
    "temperature": {
      "min_f": "number",
      "max_f": "number",
      "ideal_f": ["number", "number"]
    },
    "difficulty": {
      "level": "easy|moderate|hard|expert",
      "score": "1-5"
    },
    "toxicity": {
      "pets": "boolean",
      "humans": "boolean",
      "severity": "none|mild|moderate|severe"
    },
    "hardiness_zone": {
      "usda": ["string"],
      "min_zone": "string"
    }
  },
  "problems": {
    "yellow_leaves": { "cause": "string", "solution": { "en": "string", "es": "string" } }
  },
  "source": "perenual|plantnet|manual|claude",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "expires_at": "timestamp (30 días)"
}
```

### Tabla: conversations_log

```json
{
  "session_id": "string",
  "tenant_id": "string (para multi-tenant)",
  "messages": [
    {
      "role": "user|assistant",
      "content": "string",
      "timestamp": "timestamp",
      "metadata": {
        "language": "en|es",
        "intent": "string",
        "agent_used": "string",
        "products_mentioned": ["string"]
      }
    }
  ],
  "analytics": {
    "duration_seconds": "number",
    "messages_count": "number",
    "images_analyzed": "number",
    "products_recommended": ["string"],
    "conversion": "boolean"
  }
}
```

---

## 🚀 Fases de Desarrollo

### FASE 0: Setup (30 min)
- [ ] Crear repositorio `allaboutplanties/flora-chatbot-template`
- [ ] Crear estructura de carpetas
- [ ] Obtener API key Perenual (https://perenual.com)
- [ ] Obtener API key PlantNet (https://my.plantnet.org)
- [ ] Configurar GitHub MCP (si disponible)
- [ ] Crear archivo .env con credenciales

### FASE 1: Core Engine + Cache (2-3 horas)
- [ ] `packages/core/engine/flora-engine.js`
- [ ] `packages/core/engine/model-selector.js`
- [ ] `packages/core/cache/cache-manager.js`
- [ ] `packages/core/cache/cache-schema.js`
- [ ] `n8n-workflows/agents/cache-agent.json`
- [ ] `n8n-workflows/setup/initial-data-load.json`
- [ ] Probar carga de datos desde Perenual

### FASE 2: Agentes Agénticos (3-4 horas)
- [ ] `n8n-workflows/agents/orchestrator-agent.json`
- [ ] `n8n-workflows/agents/vision-agent.json`
- [ ] `n8n-workflows/agents/light-agent.json`
- [ ] `n8n-workflows/agents/orders-agent.json`
- [ ] `n8n-workflows/agents/enrichment-agent.json`
- [ ] `prompts/base/orchestrator.md`
- [ ] `prompts/base/vision.md`
- [ ] `prompts/verticals/plants.md`
- [ ] Probar flujo completo de chat

### FASE 3: Widget Multi-modo (4-5 horas)
- [ ] `packages/widget/components/ChatWidget.js`
- [ ] `packages/widget/components/ChatBubble.js`
- [ ] `packages/widget/components/ChatInput.js`
- [ ] `packages/widget/components/ProductCard.js`
- [ ] `packages/widget/components/ImageUpload.js`
- [ ] `packages/widget/modes/FloatingButton.js`
- [ ] `packages/widget/modes/SidePanel.js`
- [ ] `packages/widget/modes/FullscreenModal.js`
- [ ] `packages/widget/themes/theme-engine.js`
- [ ] `packages/widget/shopify/embed-block.liquid`
- [ ] CSS con variables de personalización
- [ ] Integrar con n8n webhooks

### FASE 4: Temas de Temporada (2 horas)
- [ ] `data/seasons/halloween.json`
- [ ] `data/seasons/christmas.json`
- [ ] `data/seasons/valentines.json`
- [ ] `data/seasons/spring.json`
- [ ] `data/seasons/summer.json`
- [ ] `packages/premium/seasonal-themes/theme-scheduler.js`
- [ ] Assets para cada temporada

### FASE 5: Panel Admin (5-6 horas)
- [ ] `packages/admin/dashboard/Dashboard.jsx`
- [ ] `packages/admin/config/ThemeEditor.jsx`
- [ ] `packages/admin/config/BotPersonality.jsx`
- [ ] `packages/admin/config/FAQManager.jsx`
- [ ] `packages/admin/preview/LivePreview.jsx`
- [ ] API endpoints para configuración
- [ ] Autenticación básica

### FASE 6: Deploy + Docs (2-3 horas)
- [ ] Deploy en All About Planties
- [ ] `docs/setup/quick-start.md`
- [ ] `docs/setup/shopify-install.md`
- [ ] `docs/customization/theming.md`
- [ ] `README.md` completo
- [ ] Demo GIF/video
- [ ] Preparar para comercialización

---

## 🔧 Comandos de Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/allaboutplanties/flora-chatbot-template.git
cd flora-chatbot-template

# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env
# Editar .env con API keys

# Desarrollo local widget
npm run dev:widget

# Build para producción
npm run build

# Deploy a Shopify
npm run deploy:shopify

# Exportar workflows n8n
npm run export:n8n

# Tests
npm run test
```

---

## 📝 System Prompts Base

### Orquestador Principal

```markdown
# Flora Orchestrator

Eres el orquestador principal de Flora, un chatbot especializado en {VERTICAL}.

## Tu rol
1. Analizar cada mensaje del usuario
2. Determinar la intención (chat, imagen, luz, orden, etc.)
3. Delegar al agente especializado correcto
4. Coordinar respuestas complejas que requieran múltiples agentes

## Agentes disponibles
- **cache_agent**: Consultar/guardar datos en base de datos local
- **vision_agent**: Analizar imágenes (identificar plantas, diagnosticar problemas)
- **light_agent**: Analizar luz y recomendar plantas compatibles
- **orders_agent**: Rastrear pedidos de Shopify
- **enrichment_agent**: Obtener datos frescos de APIs externas

## Reglas críticas
1. SIEMPRE consultar cache_agent ANTES de enrichment_agent
2. Si cache tiene datos < 30 días, usarlos sin consultar APIs
3. Guardar TODA respuesta de APIs externas en cache
4. Responder en el mismo idioma que usa el usuario
5. Incluir links a productos cuando sea relevante

## Flujo de decisión
```
Usuario pregunta → ¿Hay imagen? 
  → Sí: vision_agent
  → No: ¿Menciona luz/lux?
    → Sí: light_agent
    → No: ¿Menciona orden/pedido?
      → Sí: orders_agent
      → No: ¿Necesita datos de planta?
        → Sí: cache_agent → (si no hay datos) → enrichment_agent
        → No: Responder directamente
```
```

### Vision Agent

```markdown
# Flora Vision Agent

Analizas imágenes de plantas para el chatbot Flora.

## Capacidades
1. **Identificar plantas**: Nombrar la especie
2. **Diagnosticar problemas**: Hojas amarillas, manchas, plagas
3. **Analizar espacios**: Estimar luz de una habitación

## Flujo con fallback
1. Analizar imagen con Claude Vision
2. Si confianza < 85% → Consultar PlantNet API
3. Combinar resultados
4. Buscar planta en catálogo local

## Formato de respuesta
Para identificación:
🔍 **Identificación**: {nombre}
📊 **Confianza**: {alta/media/baja}
🛒 **En catálogo**: {Sí/No + link}

Para diagnóstico:
🩺 **Problema**: {descripción}
🔬 **Causa**: {explicación}
💊 **Solución**: {pasos}
```

---

## ⚠️ Reglas Críticas

### Seguridad
- ❌ NUNCA exponer API keys en el frontend
- ❌ NUNCA almacenar datos sensibles de usuarios
- ✅ Validar TODOS los inputs
- ✅ Rate limiting en webhooks
- ✅ Sanitizar HTML en respuestas

### Performance
- ✅ Lazy loading del widget
- ✅ Comprimir imágenes antes de enviar a Claude
- ✅ Cache agresivo (30 días default)
- ✅ Timeout 30s para llamadas API

### Multi-tenancy (para SaaS)
- Cada tenant tiene su propio `tenant_id`
- Datos separados en cache
- Configuraciones independientes
- Analytics aislados

---

## 📞 Contacto y Recursos

- **Repositorio**: github.com/allaboutplanties/flora-chatbot-template
- **Demo**: allaboutplanties.com (una vez deployado)
- **n8n**: flow.allaboutplanties.com
- **Documentación**: /docs en el repo

---

*CLAUDE.md v1.0 — Flora Chatbot Template — Abril 2026*
*Licencia: MIT (core) + Propietaria (premium)*
