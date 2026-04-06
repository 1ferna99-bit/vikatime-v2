# 🟠 VikaTime V2

App de pedidos de almuerzo semanal con panel de administración.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase · React Hook Form · Zod · Vercel

---

## 🚀 Setup local

### 1. Clonar e instalar

```bash
git clone <tu-repo>
cd vikatime
npm install
```

### 2. Variables de entorno

Copia el archivo de ejemplo y completa con tus credenciales de Supabase:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_WHATSAPP_NUMBER=56912345678
```

### 3. Base de datos en Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta en orden:
   - `supabase/schema.sql` — Crea todas las tablas y políticas RLS
   - `supabase/seed.sql` — Inserta datos de ejemplo

### 4. Crear usuario admin

En Supabase → **Authentication → Users → Add user**, crea un usuario con email y contraseña. Ese será tu acceso a `/admin`.

### 5. Correr localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del proyecto

```
vikatime/
├── app/
│   ├── layout.tsx              # Layout raíz + fuentes
│   ├── globals.css             # Tokens de diseño globales
│   ├── page.tsx                # Vista cliente (formulario público)
│   └── admin/
│       ├── layout.tsx          # Layout admin con sidebar
│       ├── page.tsx            # Dashboard
│       ├── login/page.tsx      # Login admin
│       ├── orders/page.tsx     # Pedidos (filtros + estados)
│       ├── plans/page.tsx      # CRUD planes
│       └── menu/page.tsx       # CRUD menú semanal
│
├── components/
│   ├── ui/index.tsx            # Button, Input, Card, SectionTitle
│   ├── client/
│   │   ├── DayMenuCard.tsx     # Tarjeta de selección por día
│   │   └── OrderSummary.tsx    # Resumen final del pedido
│   └── admin/
│       └── AdminSidebar.tsx    # Sidebar de navegación admin
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Cliente browser
│   │   └── server.ts           # Cliente server (SSR)
│   ├── whatsapp.ts             # Builder de mensaje WhatsApp
│   └── utils.ts                # cn() helper
│
├── types/index.ts              # Tipos TypeScript globales
├── middleware.ts               # Protección de rutas /admin
├── supabase/
│   ├── schema.sql              # Schema completo + RLS
│   └── seed.sql                # Datos de ejemplo
│
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 🗂️ Páginas

| Ruta | Descripción |
|---|---|
| `/` | Formulario público para clientes |
| `/admin/login` | Login administrador |
| `/admin` | Dashboard con métricas |
| `/admin/orders` | Pedidos con filtros y cambio de estado |
| `/admin/plans` | CRUD de planes de almuerzo |
| `/admin/menu` | CRUD del menú semanal por día |

---

## 🎨 Diseño

- **Fuentes:** Playfair Display (títulos) + DM Sans (cuerpo)
- **Colores:**
  - Fondo: `#FDFAF5` (crema suave)
  - Acento naranja: `#E8611A`
  - Botón principal: `#2E7D5A` (verde)

---

## ☁️ Deploy en Vercel

1. Sube el proyecto a GitHub
2. Importa en [vercel.com](https://vercel.com)
3. Agrega las variables de entorno en el panel de Vercel
4. Deploy automático en cada push a `main`

---

## 📋 Modelo de datos

### `plans`
| Campo | Tipo |
|---|---|
| id | uuid PK |
| name | text |
| lunches_per_week | int |
| is_active | boolean |
| created_at | timestamptz |

### `weekly_menu_days`
| Campo | Tipo |
|---|---|
| id | uuid PK |
| day_key | text unique |
| day_label | text |
| is_active | boolean |
| delivery_time | text |
| sort_order | int |

### `menu_items`
| Campo | Tipo |
|---|---|
| id | uuid PK |
| day_id | uuid FK |
| category | protein / carb / salad |
| name | text |
| emoji | text |
| is_active | boolean |
| sort_order | int |

### `orders`
| Campo | Tipo |
|---|---|
| id | uuid PK |
| customer_name | text |
| customer_phone | text |
| customer_address | text |
| customer_notes | text |
| plan_id | uuid FK |
| plan_name | text |
| status | pendiente/confirmado/preparado/entregado/cancelado |
| whatsapp_message | text |
| created_at | timestamptz |

### `order_days`
| Campo | Tipo |
|---|---|
| id | uuid PK |
| order_id | uuid FK |
| day_key | text |
| day_label | text |
| protein_name | text |
| carb_name | text |
| salads | text[] |
| delivery_time | text |

---

Hecho con ❤️ para VIKA 🟠
