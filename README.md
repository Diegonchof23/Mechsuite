# MechSuite

Sistema web de gestión operacional orientado a la administración de mantenciones de equipos industriales, desarrollado como proyecto de título para la carrera de Ingeniería en Informática.

---

## Descripción

MechSuite es una aplicación web diseñada para digitalizar y centralizar la gestión de mantenciones en un entorno de taller técnico industrial.  
El sistema permite registrar clientes, equipos y órdenes de trabajo, manteniendo trazabilidad completa de las intervenciones realizadas y facilitando el acceso a información técnica de forma estructurada.

El proyecto nace a partir de una problemática real observada en talleres industriales, donde los procesos de mantención se gestionan de forma manual o dispersa, dificultando el control, el historial técnico y la toma de decisiones.

---

## Funcionalidades principales

- Registro y administración de clientes.
- Gestión de equipos asociados a cada cliente.
- Creación, seguimiento y cierre de órdenes de trabajo.
- Trazabilidad histórica de mantenciones e intervenciones técnicas.
- Control de acceso basado en roles (usuarios administrativos y técnicos).
- Centralización de información técnica asociada a cada equipo.

---

## Tecnologías utilizadas

- **Frontend / Backend:** Next.js  
- **Lenguaje:** TypeScript  
- **Base de datos:** MariaDB  
- **ORM:** Prisma  
- **Control de versiones:** Git y GitHub  

El sistema fue desarrollado utilizando una arquitectura modular, separando responsabilidades para facilitar el mantenimiento y la escalabilidad.

---

## Arquitectura del sistema

MechSuite está estructurado como una aplicación web full stack:

- **Capa de presentación:** interfaz web desarrollada con Next.js.
- **Capa de lógica:** manejo de reglas de negocio, validaciones y control de acceso.
- **Capa de datos:** base de datos relacional en MariaDB, con integridad referencial asegurada mediante Prisma ORM.

Esta arquitectura permite mantener coherencia en la información y facilita la trazabilidad de los procesos operativos del taller.

---

## Modelo de datos

El modelo de datos está orientado a la normalización y a la trazabilidad de la información.  
Las principales entidades del sistema son:

- Cliente  
- Equipo  
- Orden de Trabajo  
- Usuario  
- Rol  

Las relaciones entre entidades permiten asociar clientes con múltiples equipos, registrar mantenciones históricas y controlar los accesos según el perfil del usuario.

---

## Pruebas y validación

El sistema fue validado mediante **testing funcional**, considerando:

- Diseño y ejecución de casos de prueba.
- Validación de requerimientos funcionales.
- Revisión de flujos críticos (creación, actualización y cierre de órdenes de trabajo).
- Verificación de control de accesos por rol.

Estas pruebas permitieron asegurar el correcto funcionamiento del sistema en un contexto operativo real.

---

## Instalación y ejecución local

Requisitos previos:
- Node.js
- Base de datos MariaDB

Pasos generales:
1. Clonar el repositorio.
2. Instalar dependencias.
3. Configurar variables de entorno para la conexión a la base de datos.
4. Ejecutar migraciones de Prisma.
5. Iniciar el servidor de desarrollo.

*(Los detalles específicos de configuración pueden ajustarse según el entorno de ejecución.)*

---

## Contexto académico

Este proyecto corresponde al **Proyecto de Título** de la carrera **Ingeniería en Informática**, desarrollado en el **Instituto Profesional INACAP, Sede Curicó**.

El objetivo del proyecto fue aplicar los conocimientos adquiridos durante la formación académica en un sistema real, abordando análisis de requerimientos, diseño de arquitectura, modelamiento de datos, desarrollo de software y validación funcional.

---

## Autor

Diego Fuenzalida  
Egresado Ingeniería en Informática  
INACAP – Sede Curicó
