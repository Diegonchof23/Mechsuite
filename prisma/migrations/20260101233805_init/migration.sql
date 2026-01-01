-- CreateTable
CREATE TABLE `Cliente` (
    `id_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `razon_social` VARCHAR(150) NOT NULL,
    `rut` VARCHAR(20) NOT NULL,
    `telefono` VARCHAR(30) NULL,
    `email` VARCHAR(150) NULL,
    `direccion` VARCHAR(200) NULL,

    UNIQUE INDEX `Cliente_rut_key`(`rut`),
    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipo` (
    `id_equipo` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NOT NULL,
    `modelo` VARCHAR(100) NOT NULL,
    `linea_proceso` VARCHAR(100) NOT NULL,
    `estado_operativo` BOOLEAN NOT NULL,
    `fecha_instalacion` DATE NULL,
    `proxima_mantencion` DATE NULL,

    PRIMARY KEY (`id_equipo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `telefono` VARCHAR(30) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `activo` BOOLEAN NOT NULL,
    `primer_login` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rol` (
    `id_rol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(200) NULL,

    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsuarioRol` (
    `id_usuario` INTEGER NOT NULL,
    `id_rol` INTEGER NOT NULL,

    PRIMARY KEY (`id_usuario`, `id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EncuestaSatisfaccion` (
    `id_encuesta` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `fecha_respuesta` DATETIME NOT NULL,
    `puntaje_total` INTEGER NOT NULL,
    `positiva` BOOLEAN NOT NULL,
    `comentario` TEXT NULL,

    PRIMARY KEY (`id_encuesta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrdenTrabajo` (
    `id_ot` INTEGER NOT NULL AUTO_INCREMENT,
    `id_equipo` INTEGER NOT NULL,
    `tipo_ot` VARCHAR(30) NOT NULL,
    `prioridad` VARCHAR(20) NOT NULL,
    `estado` VARCHAR(30) NOT NULL,
    `fecha_creacion` DATETIME NOT NULL,
    `fecha_programada` DATETIME NULL,
    `fecha_cierre` DATETIME NULL,
    `descripcion_sintoma` TEXT NULL,
    `trabajo_realizado` TEXT NULL,
    `repuestos_utilizados` TEXT NULL,
    `id_creador` INTEGER NULL,

    PRIMARY KEY (`id_ot`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvidenciaOT` (
    `id_evidencia` INTEGER NOT NULL AUTO_INCREMENT,
    `id_ot` INTEGER NOT NULL,
    `tipo` VARCHAR(30) NOT NULL,
    `url_archivo` VARCHAR(255) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_hora` DATETIME NOT NULL,

    PRIMARY KEY (`id_evidencia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacion` (
    `id_notificacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_equipo` INTEGER NOT NULL,
    `fecha_objetivo` DATE NOT NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `visto` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id_notificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Equipo` ADD CONSTRAINT `Equipo_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsuarioRol` ADD CONSTRAINT `UsuarioRol_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsuarioRol` ADD CONSTRAINT `UsuarioRol_id_rol_fkey` FOREIGN KEY (`id_rol`) REFERENCES `Rol`(`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EncuestaSatisfaccion` ADD CONSTRAINT `EncuestaSatisfaccion_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenTrabajo` ADD CONSTRAINT `OrdenTrabajo_id_equipo_fkey` FOREIGN KEY (`id_equipo`) REFERENCES `Equipo`(`id_equipo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenTrabajo` ADD CONSTRAINT `OrdenTrabajo_id_creador_fkey` FOREIGN KEY (`id_creador`) REFERENCES `Usuario`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvidenciaOT` ADD CONSTRAINT `EvidenciaOT_id_ot_fkey` FOREIGN KEY (`id_ot`) REFERENCES `OrdenTrabajo`(`id_ot`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_id_equipo_fkey` FOREIGN KEY (`id_equipo`) REFERENCES `Equipo`(`id_equipo`) ON DELETE RESTRICT ON UPDATE CASCADE;
