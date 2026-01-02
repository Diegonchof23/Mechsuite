# MechSuite

Sistema web para la gestión y control de mantenciones de equipos industriales, orientado a optimizar el registro de clientes, equipos, órdenes de trabajo y la trazabilidad técnica dentro de un entorno de taller.

Proyecto desarrollado como parte del proceso de titulación de la carrera de **Ingeniería en Informática**.

---

## Tecnologías utilizadas

* **Next.js (App Router)**
* **React**
* **TypeScript**
* **Node.js**
* **Prisma ORM**
* **Base de datos relacional (MySQL / PostgreSQL)**
* **Tailwind CSS**
* **Git / GitHub**

---

## Estructura del proyecto

```
mechsuite/
├── app/                # Rutas y vistas (Next.js App Router)
├── components/         # Componentes reutilizables
├── lib/                # Lógica compartida y utilidades
├── prisma/             # Esquema y migraciones de base de datos
├── public/             # Archivos públicos
├── types/              # Definiciones de tipos
├── .env.example        # Variables de entorno de referencia
├── package.json
└── README.md
```
---

## Requisitos previos

* Node.js 18 o superior
* npm o yarn
* Base de datos compatible (MySQL o PostgreSQL)
* Git

---

## Instalación y ejecución

1. Clonar el repositorio

   ```
   git clone https://github.com/diegof/mechsuite.git
   cd mechsuite
   ```

2. Instalar dependencias

   ```
   npm install
   ```

3. Crear archivo de entorno

   ```
   cp .env.example .env
   ```

4. Ejecutar migraciones

   ```
   npx prisma migrate deploy
   ```

5. Iniciar el servidor de desarrollo

   ```
   npm run dev
   ```

La aplicación estará disponible en:
[http://localhost:3000](http://localhost:3000)

---

## Funcionalidades principales

* Gestión de clientes
* Administración de equipos
* Registro y seguimiento de órdenes de trabajo
* Historial técnico de intervenciones
* Gestión de usuarios y control de acceso

---

## Estado del proyecto

Proyecto funcional desarrollado con fines académicos y demostrativos.

---

## Autores

* Diego Fuenzalida 
* Alexis Roco
* Rodrigo Valenzuela
Ingeniería en Informática – INACAP

