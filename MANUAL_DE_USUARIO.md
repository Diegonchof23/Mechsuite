# 📘 MANUAL DE USUARIO - MechSuite

**Sistema de Gestión de Mantenciones y Equipos Industriales**

Versión 1.0 | Diciembre 2025

---

## 📋 TABLA DE CONTENIDOS

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Roles y Permisos](#roles-y-permisos)
4. [Página de Inicio](#página-de-inicio)
5. [Módulo de Equipos](#módulo-de-equipos)
6. [Módulo de Órdenes de Trabajo](#módulo-de-órdenes-de-trabajo)
7. [Módulo de Clientes](#módulo-de-clientes)
8. [Módulo de Usuarios](#módulo-de-usuarios)
9. [Módulo de Indicadores (KPIs)](#módulo-de-indicadores-kpis)
10. [Funciones Adicionales](#funciones-adicionales)
11. [Preguntas Frecuentes](#preguntas-frecuentes)
12. [Soporte Técnico](#soporte-técnico)

---

## 🎯 INTRODUCCIÓN

### ¿Qué es MechSuite?

MechSuite es un sistema web diseñado para la gestión integral de equipos industriales, mantenciones preventivas y correctivas, órdenes de trabajo y seguimiento de indicadores de rendimiento (KPIs).

### Características Principales

- ✅ Gestión completa de equipos y clientes
- ✅ Creación y seguimiento de órdenes de trabajo
- ✅ Generación de códigos QR para acceso rápido a equipos
- ✅ Sistema de notificaciones para mantenciones próximas
- ✅ Dashboard de indicadores de desempeño (KPIs)
- ✅ Gestión de evidencias (fotos, documentos)
- ✅ Sistema de encuestas de satisfacción
- ✅ Diseño responsive (funciona en computador y celular)

### Requisitos del Sistema

- **Navegador web**: Chrome, Firefox, Safari o Edge (versiones recientes)
- **Conexión a internet**: Requerida
- **Dispositivos compatibles**: Computadores, tablets y smartphones

---

## 🔐 ACCESO AL SISTEMA

### Primer Acceso

1. **Recibir credenciales**: El administrador del sistema le entregará:
   - Correo electrónico de acceso
   - Contraseña temporal (formato: nombre+apellido, ej: "JuanPerez")

2. **Ingresar al sistema**:
   - Abrir navegador web
   - Ingresar la URL proporcionada (ej: https://mechsuite.com)
   - Verá la pantalla de login

3. **Primer inicio de sesión**:
   - Ingresar su correo electrónico
   - Ingresar contraseña temporal
   - Hacer clic en "Entrar"
   - El sistema le pedirá cambiar su contraseña

4. **Cambiar contraseña**:
   - Ingresar contraseña actual (temporal)
   - Crear nueva contraseña (mínimo 6 caracteres)
   - Confirmar nueva contraseña
   - Hacer clic en "Cambiar contraseña"

### Inicios de Sesión Posteriores

1. Ingresar correo electrónico
2. Ingresar su contraseña personal
3. Hacer clic en "Entrar"

> 💡 **Tip**: Puede hacer clic en el ícono del ojo 👁️ para ver la contraseña mientras la escribe.

### Cerrar Sesión

1. Hacer clic en su nombre en la esquina superior derecha
2. Seleccionar "Cerrar sesión"
3. Será redirigido a la pantalla de login

---

## 👥 ROLES Y PERMISOS

El sistema cuenta con tres tipos de usuarios:

### 🔧 Técnico

**Puede realizar:**
- ✅ Ver equipos y su historial
- ✅ Ver todas las órdenes de trabajo
- ✅ Editar órdenes de trabajo que él mismo creó
- ✅ Agregar evidencias a órdenes de trabajo
- ✅ Escanear códigos QR de equipos

**No puede:**
- ❌ Crear, editar o eliminar equipos
- ❌ Crear órdenes de trabajo
- ❌ Ver o gestionar clientes
- ❌ Ver o gestionar usuarios
- ❌ Ver indicadores (KPIs)

### 👔 Jefe

**Puede realizar:**
- ✅ Todo lo que puede hacer un Técnico
- ✅ Crear, editar y eliminar equipos
- ✅ Crear y editar cualquier orden de trabajo
- ✅ Gestionar clientes (crear, editar, eliminar)
- ✅ Gestionar usuarios (crear, editar, eliminar)
- ✅ Ver indicadores y KPIs
- ✅ Ver notificaciones de mantenciones próximas
- ✅ Ver resultados de encuestas de satisfacción

### 👑 Admin

**Puede realizar:**
- ✅ Todo lo que puede hacer un Jefe
- ✅ Gestión completa del sistema
- ✅ No responde encuestas de satisfacción

---

## 🏠 PÁGINA DE INICIO

Al iniciar sesión, verá el **Dashboard Principal** con:

### Panel de KPIs

Cuatro tarjetas con estadísticas en tiempo real:

1. **Clientes**: Total de clientes registrados
2. **Equipos**: Total de equipos en el sistema
3. **OT Abiertas**: Órdenes de trabajo pendientes o en progreso
4. **OT Cerradas**: Órdenes de trabajo completadas

### Accesos Rápidos

Botones para acceso directo a funciones comunes:

- **Nuevo Equipo**: Abre el formulario para registrar un equipo (solo Jefe/Admin)
- **Nuevo Cliente**: Abre el formulario para registrar un cliente (solo Jefe/Admin)
- **Nueva Orden**: Abre el formulario para crear una orden de trabajo (solo Jefe/Admin)
- **Nuevo Usuario**: Abre el formulario para registrar un usuario (solo Jefe/Admin)

> 💡 **Tip**: Estos botones abren directamente el formulario correspondiente, sin necesidad de navegar al módulo.

---

## 🔧 MÓDULO DE EQUIPOS

Acceso: Menú principal → **Equipos**

### Ver Listado de Equipos

**Información mostrada:**
- ID del equipo
- Modelo
- Cliente asociado
- Línea de proceso
- Estado operativo (Operativo/No operativo)
- Fecha de instalación
- Próxima mantención programada

### Buscar Equipos

1. Usar la barra de búsqueda en la parte superior
2. Escribir: modelo, cliente, línea de proceso, o ID
3. La búsqueda filtra en tiempo real (puede buscar por palabras separadas)

### Filtrar Equipos (solo Jefe/Admin)

1. Hacer clic en el botón **"Filtrar"**
2. Se abre un panel lateral desde la derecha
3. Seleccionar filtros:
   - **Cliente**: Filtrar por cliente específico
   - **Estado**: Todos / Solo operativos / Solo no operativos
4. Los resultados se actualizan automáticamente
5. Cerrar el panel haciendo clic en "X" o fuera del panel

### Crear Nuevo Equipo (solo Jefe/Admin)

1. Hacer clic en el botón **"Añadir equipo"**
2. Completar el formulario:
   - **Cliente**: Seleccionar de la lista desplegable (obligatorio)
   - **Modelo**: Nombre o modelo del equipo (obligatorio)
   - **Línea de proceso**: Línea donde opera el equipo (obligatorio)
   - **Estado operativo**: Marcar si está operativo
   - **Fecha de instalación**: Fecha en que se instaló (opcional)
   - **Próxima mantención**: Fecha programada para mantención (opcional)
3. Hacer clic en **"Guardar"**
4. El equipo aparecerá en la lista

> ⚠️ **Importante**: Si ingresa una "Próxima mantención", se creará automáticamente una notificación para alertar al jefe.

### Ver Historial de Equipo

1. En la fila del equipo, hacer clic en el botón **"Ver"** (ícono de ojo 👁️)
2. Se abre un modal con:
   - Información general del equipo
   - Historial de mantenciones (órdenes de trabajo asociadas)
3. Para cada mantención verá:
   - Fecha
   - Tipo de OT
   - Estado
   - Técnico asignado
   - Trabajo realizado

### Editar Equipo (solo Jefe/Admin)

1. Hacer clic en el botón **"Editar"** (ícono de lápiz ✏️)
2. Se abre el formulario con los datos actuales
3. Modificar los campos necesarios
4. Hacer clic en **"Actualizar"**

### Generar Código QR

1. Abrir el historial del equipo
2. Hacer clic en el botón **"Generar QR"**
3. Se genera un código QR que puede:
   - Descargar como imagen PNG
   - Imprimir
   - Pegar en el equipo físico

**¿Para qué sirve el QR?**
- El técnico puede escanear el QR con su celular
- Lo lleva directamente al historial del equipo
- Puede ver información y órdenes sin buscar manualmente

### Eliminar Equipo (solo Jefe/Admin)

1. Hacer clic en el botón **"Eliminar"** (ícono de papelera 🗑️)
2. Confirmar la eliminación
3. El equipo se eliminará permanentemente

> ⚠️ **Restricción**: No se puede eliminar un equipo que tenga órdenes de trabajo asociadas. Primero debe eliminar o cerrar todas las órdenes.

---

## 📋 MÓDULO DE ÓRDENES DE TRABAJO

Acceso: Menú principal → **Órdenes de Trabajo**

### Ver Listado de Órdenes

**Información mostrada:**
- Número de OT
- Equipo y cliente
- Tipo de OT (Preventiva, Correctiva, General)
- Prioridad (Alta, Media, Baja)
- Estado (Pendiente, En progreso, Completada)
- Técnico asignado
- Fecha de creación

**Códigos de color:**
- 🔴 **Prioridad Alta**: Fondo rojo
- 🟡 **Prioridad Media**: Fondo naranja
- 🟢 **Prioridad Baja**: Fondo amarillo

### Buscar Órdenes

1. Usar la barra de búsqueda
2. Buscar por: equipo, cliente, técnico o número de OT
3. Filtrado instantáneo

### Filtrar Órdenes

1. Hacer clic en el botón **"Filtrar"**
2. Panel lateral con opciones:
   - **Estado**: Todos / Pendiente / En progreso / Completada
   - **Prioridad**: Todas / Alta / Media / Baja
3. Aplicar filtros
4. Cerrar panel

### Crear Nueva Orden (solo Jefe/Admin)

1. Hacer clic en **"Nueva orden"**
2. Completar formulario:
   - **Equipo**: Seleccionar de lista (obligatorio)
   - **Tipo de OT**: Preventiva / Correctiva / General
   - **Prioridad**: Alta / Media / Baja
   - **Estado**: Pendiente / En progreso / Completada
   - **Descripción del síntoma**: Descripción del problema (opcional)
3. Hacer clic en **"Crear Orden"**
4. La OT se crea y queda registrada con su nombre como creador

### Editar Orden de Trabajo

**Técnico** (solo las que él creó):
1. Hacer clic en **"Editar"**
2. Puede modificar:
   - Estado
   - Trabajo realizado
3. Hacer clic en **"Actualizar"**

**Jefe/Admin** (cualquier OT):
1. Hacer clic en **"Editar"**
2. Puede modificar todos los campos:
   - Tipo de OT
   - Prioridad
   - Estado
   - Descripción del síntoma
   - Trabajo realizado
   - Repuestos utilizados
3. Hacer clic en **"Actualizar"**

### Gestionar Evidencias

Todos los usuarios pueden ver y agregar evidencias a una OT.

**Ver evidencias:**
1. Hacer clic en el botón **"Evidencias"**
2. Se abre modal con lista de evidencias actuales
3. Para cada evidencia verá:
   - Tipo (Foto, Informe, Otro)
   - Descripción
   - Fecha y hora de subida
   - Botón para descargar

**Agregar nueva evidencia:**
1. En el modal de evidencias, completar:
   - **Tipo**: Foto / Informe / Otro
   - **Archivo**: Hacer clic en "Seleccionar archivo"
   - **Descripción**: Texto explicativo (opcional)
2. Hacer clic en **"Agregar Evidencia"**
3. El archivo se sube y aparece en la lista

> 💡 **Formatos soportados**: JPG, PNG, PDF, DOC, DOCX

### Eliminar Orden (solo Jefe/Admin)

1. Hacer clic en el botón **"Eliminar"**
2. Confirmar eliminación
3. La OT se elimina permanentemente junto con sus evidencias

---

## 👥 MÓDULO DE CLIENTES

Acceso: Menú principal → **Clientes** (solo Jefe/Admin)

### Ver Listado de Clientes

**Información mostrada:**
- ID del cliente
- Razón social (nombre de la empresa)
- RUT
- Teléfono
- Email
- Dirección

### Buscar Clientes

Usar la barra de búsqueda para filtrar por cualquier campo.

### Crear Nuevo Cliente

1. Hacer clic en **"Crear cliente"**
2. Completar formulario:
   - **Razón social**: Nombre de la empresa (obligatorio)
   - **RUT**: Formato 12345678-9 (obligatorio)
   - **Dirección**: Dirección física (obligatorio, 5-50 caracteres)
   - **Teléfono**: 8 dígitos, se guardará automáticamente como 9XXXXXXXX (opcional)
   - **Email**: Debe terminar en .com o .cl (opcional)
3. Hacer clic en **"Crear Cliente"**

**Validaciones:**
- ✅ RUT debe tener formato válido (7-8 dígitos, guion, dígito verificador)
- ✅ Email debe ser válido y terminar en .com o .cl
- ✅ Teléfono debe tener exactamente 8 dígitos (se agrega 9 automáticamente)
- ✅ Dirección entre 5 y 50 caracteres

### Editar Cliente

1. Hacer clic en el botón **"Editar"**
2. Modificar campos necesarios
3. Hacer clic en **"Actualizar"**

> ⚠️ **Nota**: El RUT no se puede modificar después de crear el cliente.

### Eliminar Cliente

1. Hacer clic en el botón **"Eliminar"**
2. Confirmar eliminación

> ⚠️ **Restricción**: No se puede eliminar un cliente que tenga equipos asociados.

---

## 👤 MÓDULO DE USUARIOS

Acceso: Menú principal → **Usuarios** (solo Jefe/Admin)

### Ver Listado de Usuarios

**Información mostrada:**
- ID del usuario
- Nombre completo
- Email
- Teléfono
- Rol (Jefe, Técnico, Admin)
- Estado (Activo/Inactivo)

### Buscar Usuarios

Filtrar por nombre, email o teléfono.

### Filtrar Usuarios

1. Hacer clic en **"Filtrar"**
2. Opciones disponibles:
   - **Rol**: Todos / Jefe / Técnico
   - **Estado**: Todos / Activos / Inactivos
3. Aplicar filtros

### Crear Nuevo Usuario

1. Hacer clic en **"Añadir usuario"**
2. Completar formulario:
   - **Nombre**: Solo letras (obligatorio)
   - **Apellido**: Solo letras (obligatorio)
   - **Email**: Formato válido terminado en .com o .cl (obligatorio)
   - **Teléfono**: 8 dígitos (opcional)
   - **Rol**: Jefe / Técnico (obligatorio)
   - **Activo**: Marcar si el usuario estará activo
3. Hacer clic en **"Crear Usuario"**

**Contraseña automática:**
- El sistema genera una contraseña temporal: NombreApellido (ej: "JuanPerez")
- En el primer login, el usuario deberá cambiarla

### Editar Usuario

Puede editar dos campos:

**Editar Email:**
1. Hacer clic en el ícono de editar junto al email
2. Ingresar nuevo email
3. Hacer clic en **"Guardar"**

**Editar Teléfono:**
1. Hacer clic en el ícono de editar junto al teléfono
2. Ingresar 8 dígitos (sin el 9 inicial)
3. Hacer clic en **"Guardar"**

### Activar/Desactivar Usuario

1. Hacer clic en el switch de "Activo/Inactivo"
2. El cambio se aplica inmediatamente
3. Un usuario inactivo no puede iniciar sesión

### Resetear Contraseña

1. Hacer clic en el botón **"Resetear contraseña"**
2. Confirmar la acción
3. La contraseña vuelve a NombreApellido
4. En el próximo login, deberá cambiarla

### Eliminar Usuario

1. Hacer clic en el botón **"Eliminar"**
2. Confirmar eliminación
3. El usuario se elimina permanentemente

> ⚠️ **Restricción**: No se puede eliminar un usuario que haya creado órdenes de trabajo.

---

## 📊 MÓDULO DE INDICADORES (KPIs)

Acceso: Menú principal → **Indicadores** (solo Jefe/Admin)

### Panel de KPIs

Visualiza 5 indicadores clave de rendimiento:

**KPI 1: Proporción de intervenciones registradas digitalmente (%)**
- Mide el % de órdenes de trabajo que están digitalizadas
- Meta: 100%
- Cálculo: (OT con evidencias / Total de OT) × 100

**KPI 2: % de mantenimientos preventivos ejecutados en plazo**
- Mide cumplimiento de mantenciones programadas
- Meta: ≥ 80%
- Cálculo: (Preventivas a tiempo / Total preventivas) × 100

**KPI 3: % de evaluaciones positivas de usuarios internos**
- Satisfacción del equipo con el sistema
- Meta: ≥ 70%
- Cálculo: (Encuestas positivas / Total encuestas) × 100

**KPI 4: Promedio de días de resolución de OT cerradas**
- Tiempo promedio para cerrar una OT
- Meta: ≤ 7 días
- Cálculo: Promedio de días entre creación y cierre

**KPI 5: % de equipos operativos respecto al total mantenido**
- Disponibilidad de equipos
- Meta: ≥ 90%
- Cálculo: (Equipos operativos / Total equipos) × 100

### Visualización de Detalles

1. Pasar el mouse sobre una tarjeta de KPI
2. Se muestran detalles adicionales:
   - Periodo de cálculo
   - Valores utilizados en el cálculo
   - Fecha de actualización

### Ver Encuestas de Satisfacción

En la parte inferior verá una tabla con todas las encuestas respondidas:

**Información mostrada:**
- Fecha de respuesta
- Usuario que respondió
- Puntaje (1-10)
- Si es positiva (≥7) o negativa
- Botón para ver comentarios completos

**Ver comentarios:**
1. Hacer clic en **"Ver comentarios"**
2. Se abre modal con:
   - Datos del usuario
   - Fecha y puntaje
   - Comentario completo

---

## 🔔 FUNCIONES ADICIONALES

### Sistema de Notificaciones (solo Jefe)

**Campanita de notificaciones:**
- Ubicada en la esquina superior derecha
- Muestra número de notificaciones pendientes
- Color rojo indica notificaciones no vistas

**Ver notificaciones:**
1. Hacer clic en la campanita 🔔
2. Se abre modal con lista de equipos que requieren mantención
3. Para cada notificación verá:
   - Equipo y cliente
   - Fecha objetivo de mantención
   - Días restantes (o vencidos)
4. Hacer clic en **"Ir a equipo"** para abrir el historial

**Marcar como vista:**
1. En el modal, hacer clic en **"Marcar como vista"**
2. La notificación desaparece del contador
3. Permanece en el historial para referencia

### Cambiar Contraseña

1. Hacer clic en su nombre (esquina superior derecha)
2. Seleccionar **"Cambiar contraseña"**
3. Completar formulario:
   - Contraseña actual
   - Nueva contraseña (mínimo 6 caracteres)
   - Confirmar nueva contraseña
4. Hacer clic en **"Cambiar contraseña"**

> 💡 **Tip**: Use el ícono del ojo 👁️ para ver las contraseñas mientras las escribe.

### Encuesta de Satisfacción (Técnico y Jefe)

**¿Cuándo aparece?**
- En los últimos meses de cada semestre:
  - Mayo y Junio
  - Noviembre y Diciembre
- Solo una vez por semestre
- No aplica para usuarios Admin

**Responder encuesta:**
1. Al iniciar sesión, se abre modal automático
2. Completar:
   - **Puntaje**: Del 1 al 10 (siendo 10 excelente)
   - **Comentarios**: Texto libre (opcional)
3. Hacer clic en **"Enviar Respuesta"**
4. Ya no aparecerá hasta el siguiente semestre

**Acceso manual:**
1. Hacer clic en su nombre
2. Seleccionar **"Encuesta de Satisfacción"**
3. Solo si aún no la ha respondido en el semestre actual

### Acceso mediante QR (todos los usuarios)

**Desde computador:**
1. Generar QR del equipo (ver sección Equipos)
2. Descargar imagen PNG
3. Imprimir y pegar en el equipo físico

**Desde celular:**
1. Abrir cámara o app de escaneo QR
2. Apuntar al código QR
3. Tocar el enlace que aparece
4. Si no ha iniciado sesión:
   - Se guarda la URL del equipo
   - Ingresar credenciales
   - Automáticamente abre el historial del equipo

### Navegación Móvil

**Menú hamburguesa:**
1. En celular/tablet, el menú principal se oculta
2. Hacer clic en el ícono ≡ (esquina superior izquierda)
3. Se despliega panel lateral con todas las opciones
4. Hacer clic fuera del panel para cerrarlo

**Tarjetas en lugar de tablas:**
- En móvil, las tablas se convierten en tarjetas verticales
- Más fácil de leer en pantallas pequeñas
- Todas las funcionalidades disponibles

---

## ❓ PREGUNTAS FRECUENTES

### Acceso y Sesión

**P: ¿Qué hago si olvidé mi contraseña?**
R: Contacte a su jefe o administrador para que resetee su contraseña. Volverá a NombreApellido y deberá cambiarla en el próximo login.

**P: ¿Por cuánto tiempo permanece activa mi sesión?**
R: La sesión dura 8 horas de inactividad. Después deberá iniciar sesión nuevamente.

**P: ¿Puedo usar el sistema desde mi celular?**
R: Sí, el sistema es completamente responsive y funciona en todos los dispositivos.

### Equipos

**P: ¿Por qué no puedo eliminar un equipo?**
R: No se pueden eliminar equipos que tengan órdenes de trabajo asociadas. Primero debe eliminar o cerrar todas las órdenes relacionadas.

**P: ¿Para qué sirve el código QR?**
R: Permite acceso rápido al historial del equipo escaneándolo con un celular, ideal para técnicos en terreno.

**P: ¿Las notificaciones de mantención se crean automáticamente?**
R: Sí, al registrar o editar un equipo con una "Próxima mantención", se crea una notificación automática para el jefe.

### Órdenes de Trabajo

**P: ¿Por qué no puedo editar una orden de trabajo?**
R: Los técnicos solo pueden editar las OT que ellos mismos crearon. Los jefes y admins pueden editar cualquier OT.

**P: ¿Qué tipos de archivos puedo subir como evidencia?**
R: Puede subir fotos (JPG, PNG), documentos (PDF), y archivos de Word (DOC, DOCX).

**P: ¿Se puede recuperar una OT eliminada?**
R: No, la eliminación es permanente. Use esta función con precaución.

### Clientes y Usuarios

**P: ¿Puedo cambiar el RUT de un cliente?**
R: No, el RUT no se puede modificar después de crear el cliente. Si necesita cambiarlo, debe eliminar y crear un nuevo cliente.

**P: ¿Cómo activo/desactivo un usuario?**
R: Use el switch de "Activo/Inactivo" en el listado de usuarios. El cambio es inmediato.

**P: ¿Qué pasa si desactivo a un usuario?**
R: El usuario no podrá iniciar sesión, pero sus datos y órdenes de trabajo creadas permanecen en el sistema.

### Indicadores

**P: ¿Cada cuánto se actualizan los KPIs?**
R: Los KPIs se calculan en tiempo real cada vez que abre el módulo de Indicadores.

**P: ¿Puedo exportar los datos de KPIs?**
R: Actualmente no, pero puede tomar capturas de pantalla o copiar los valores mostrados.

---

## 🛠️ SOPORTE TÉCNICO

### Reportar Problemas

Si encuentra algún error o problema:

1. **Tome nota de:**
   - Qué estaba haciendo cuando ocurrió el error
   - Mensaje de error (si apareció alguno)
   - Navegador y dispositivo que está usando
   - Fecha y hora aproximada

2. **Contacte a:**
   - Su jefe inmediato
   - Administrador del sistema
   - Soporte técnico de TI

### Consejos para Mejor Rendimiento

- ✅ Use navegadores actualizados (Chrome, Firefox, Edge)
- ✅ Limpie el caché del navegador si nota lentitud
- ✅ Cierre sesión al terminar de usar el sistema
- ✅ No comparta sus credenciales de acceso
- ✅ Use conexión estable a internet

### Actualizaciones del Sistema

El sistema se actualiza periódicamente con:
- Correcciones de errores
- Nuevas funcionalidades
- Mejoras de seguridad

No requiere ninguna acción de su parte. Las actualizaciones son transparentes.

---

## 📝 GLOSARIO DE TÉRMINOS

- **OT**: Orden de Trabajo
- **KPI**: Key Performance Indicator (Indicador Clave de Desempeño)
- **QR**: Quick Response (Código de Respuesta Rápida)
- **Dashboard**: Panel de control con resumen de información
- **Mantención Preventiva**: Mantención programada para prevenir fallas
- **Mantención Correctiva**: Reparación de equipo con falla
- **Evidencia**: Documento o foto que respalda el trabajo realizado
- **Modal**: Ventana emergente sobre la pantalla principal
- **Drawer**: Panel lateral que se desliza desde un borde

---

## 📞 INFORMACIÓN DE CONTACTO

**Soporte Técnico**
- Email: soporte@mechsuite.com
- Teléfono: +56 9 XXXX XXXX
- Horario: Lunes a Viernes, 9:00 - 18:00

**Documentación adicional**
- Manual técnico para administradores
- Guía de configuración avanzada
- Videos tutoriales

---

**Fin del Manual de Usuario - MechSuite v1.0**

*Última actualización: Diciembre 2025*
