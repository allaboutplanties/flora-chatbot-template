# 🌿 Flora Chatbot Template

<p align="center">
  <img src="docs/assets/flora-banner.png" alt="Flora Chatbot" width="100%">
</p>

<p align="center">
  <strong>A customizable AI chatbot template for Shopify stores</strong><br>
  Built with Claude AI, n8n workflows, and modern web technologies
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#customization">Customization</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#pricing">Pricing</a>
</p>

---

## ✨ Features

### 🤖 AI-Powered Conversations
- **Multi-model support**: Claude Sonnet for chat, Claude Opus for vision
- **Image analysis**: Plant identification, health diagnosis, space recommendations
- **Light measurement**: Estimate lux from photos or device sensors
- **Smart caching**: Local-first data strategy reduces API costs

### 🎨 Full Customization
- **Visual theming**: Colors, typography, borders, animations
- **Widget modes**: Floating button, side panel, fullscreen modal
- **Bot personality**: Name, tone, emoji usage, language
- **Seasonal themes**: Halloween 🎃, Christmas 🎄, Valentine's 💝, and more

### 🛒 Shopify Integration
- **Product cards**: Rich product recommendations with buy buttons
- **Order tracking**: Real-time order status lookup
- **Inventory awareness**: Only recommend in-stock products
- **Theme integration**: Works with any Shopify theme

### 📊 Built-in Analytics
- Conversation metrics
- Product recommendation tracking
- Conversion attribution
- Microsoft Clarity integration

### 🔧 Developer Friendly
- **Modular architecture**: Add features without breaking existing code
- **n8n workflows**: Visual workflow editor for business logic
- **Feature flags**: Enable/disable features without code changes
- **Multi-tenant ready**: SaaS-ready architecture

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- n8n instance (self-hosted or cloud)
- Shopify store with API access
- Claude API key

### Installation

```bash
# Clone the repository
git clone https://github.com/allaboutplanties/flora-chatbot-template.git
cd flora-chatbot-template

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start development server
npm run dev
```

### Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
N8N_WEBHOOK_URL=https://your-n8n.com/webhook
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_...

# Optional (for enhanced features)
PERENUAL_API_KEY=your-key
PLANTNET_API_KEY=your-key
```

---

## 🎨 Customization

### Visual Theme

Edit `config/default.config.json`:

```json
{
  "visual": {
    "colors": {
      "primary": "#2D5A27",
      "secondary": "#4A7C43"
    },
    "borders": {
      "radius": "16px",
      "style": "rounded"
    }
  }
}
```

### Bot Personality

```json
{
  "bot": {
    "name": "Flora",
    "personality": {
      "tone": "friendly",
      "style": "expert",
      "emoji_usage": "moderate"
    }
  }
}
```

### Seasonal Themes

Seasonal themes auto-activate based on date:

| Theme | Emoji | Date Range |
|-------|-------|------------|
| Halloween | 🎃 | Oct 15 - Nov 1 |
| Christmas | 🎄 | Dec 1 - Dec 31 |
| Valentine's | 💝 | Feb 7 - Feb 15 |
| Spring | 🌸 | Mar 20 - Jun 20 |
| Summer | ☀️ | Jun 21 - Sep 22 |

---

## 🔌 Widget Modes

### Floating Button (Default)
```html
<script src="https://cdn.flora-chat.com/widget.js"></script>
<script>
  Flora.init({
    mode: 'floating',
    position: 'bottom-right'
  });
</script>
```

### Side Panel
```html
<script>
  Flora.init({
    mode: 'panel',
    position: 'right'
  });
</script>
```

### Fullscreen Modal
```html
<script>
  Flora.init({
    mode: 'fullscreen',
    trigger: '#chat-button'
  });
</script>
```

### Embed in Product Page
```liquid
{% comment %} In your product.liquid template {% endcomment %}
<div id="flora-product-chat" data-product-id="{{ product.id }}"></div>
```

---

## 📦 Architecture

```
┌─────────────────────────────────────────┐
│           Shopify Storefront            │
│  (Widget embedded via App Block/Script) │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│              n8n Orchestrator           │
│  • API Gateway     • Agentic Workflows  │
│  • Local Cache     • Analytics          │
└─────────────────────┬───────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ Claude  │   │ Shopify │   │External │
   │   API   │   │   API   │   │  APIs   │
   └─────────┘   └─────────┘   └─────────┘
```

---

## 💰 Pricing

### Open Source (MIT License)
- Core chat engine
- Basic widget
- Single language
- Community support

### Premium License
- Admin dashboard
- Seasonal themes
- Multi-language support
- White-label option
- Priority support
- Commercial use

[Contact for pricing →](mailto:hello@allaboutplanties.com)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

- **Core & Widget**: [MIT License](LICENSE-MIT)
- **Premium Features**: [Commercial License](LICENSE-PREMIUM)

---

## 🙏 Credits

Built with:
- [Claude AI](https://anthropic.com) by Anthropic
- [n8n](https://n8n.io) workflow automation
- [Shopify](https://shopify.com) e-commerce platform

---

<p align="center">
  Made with 🌱 by <a href="https://allaboutplanties.com">All About Planties</a>
</p>
