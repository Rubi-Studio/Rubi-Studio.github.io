# Configuración Local - Vercel CLI

## Instalación (ya hecha ✅)

```bash
npm install -g vercel
```

## Pasos para testear localmente:

### 1️⃣ Configura tu `.env.local`

Edita `TFG/.env.local` y reemplaza con tu API Key:

```
OPENAI_API_KEY=sk-your-real-api-key-here
```

### 2️⃣ Inicia el servidor local

Desde la carpeta raíz del proyecto:

```bash
cd TFG
vercel dev
```

Esto abrirá un servidor en `http://localhost:3000` con:

- Tu frontend (TFG/index.html)
- Tu backend seguro en `/api/openai` (usa la API Key del .env.local)

### 3️⃣ Dos formas de jugar:

#### Opción A: Modo BACKEND (recomendado para testing local)

- Por defecto, el sistema usa `/api/openai`
- La función serverless leerá tu `OPENAI_API_KEY` de `.env.local`
- **Esto es lo más seguro**

#### Opción B: Modo LOCAL (si necesitas debug)

- Cliquea ⚙️ Configurar API
- Habilita "Usar clave propia (desarrollo local)"
- Ingresa tu API Key y guarda
- Ahora llama OpenAI **directamente desde el navegador**
- Útil solo para debugging

### 4️⃣ Producción (GitHub → Vercel)

Cuando hagas push a GitHub:

```bash
git add .
git commit -m "Agregar backend seguro con Vercel Functions"
git push
```

Vercel automáticamente:

1. Detecta `TFG/api/openai.js`
2. Usa tu `OPENAI_API_KEY` configurada en el dashboard
3. Despliega todo en producción

**✅ Los usuarios pueden jugar SIN exponer API Keys**

---

## Notas importantes:

- ❌ **NO subas** tu `.env.local` a GitHub (está en `.gitignore`)
- 🔒 **Modo BACKEND** es lo que usan todos en producción
- 🔑 **Modo LOCAL** solo es para desarrollo y debugging
- 🤖 **El selector de modelo** funciona en ambos modos

---

## Troubleshooting:

Si `vercel dev` da error:

```bash
# Asegúrate de estar en la carpeta correcta
cd /path/to/Rubi-Studio.github.io/TFG

# Reinstala dependencias si es necesario
npm install

# Inicia de nuevo
vercel dev
```

Si la API no responde:

- Verifica que `OPENAI_API_KEY` sea válida en `.env.local`
- Revisa la consola del navegador (F12) para logs
- Mira las respuestas en el Debug Panel del juego
