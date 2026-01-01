/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function ensureRol(nombre, descripcion) {
  let rol = await prisma.rol.findFirst({ where: { nombre } });
  if (!rol) {
    rol = await prisma.rol.create({
      data: {
        nombre,
        descripcion,
      },
    });
    console.log(`Rol creado: ${nombre}`);
  } else {
    console.log(`Rol ya existía: ${nombre}`);
  }
  return rol;
}

async function main() {
  // 1) Crear roles base
  const rolAdmin = await ensureRol('Admin', 'Admin');
  const rolJefe = await ensureRol('Jefe', 'Jefe');
  const rolTecnico = await ensureRol('Tecnico', 'Tecnico');

  // 2) Crear usuario admin si no existe
  const adminEmail = 'admin@mechsuite.cl';
  const adminPassPlano = 'admin';

  const existingAdmin = await prisma.usuario.findUnique({
    where: { email: adminEmail },
  });

  let admin = existingAdmin;

  if (!admin) {
    const password_hash = await bcrypt.hash(adminPassPlano, 10);

    admin = await prisma.usuario.create({
      data: {
        nombre: 'Admin',
        apellido: 'Admin',
        email: adminEmail,
        telefono: null,
        password_hash,
        activo: true,
        primer_login: false,
      },
    });

    console.log(`Usuario admin creado: ${adminEmail}`);
  } else {
    console.log(`Usuario admin ya existía: ${adminEmail}`);
  }

  // 3) Asociar rol admin al usuario admin en usuario_rol
  await prisma.usuarioRol.upsert({
    where: {
      id_usuario_id_rol: {
        id_usuario: admin.id_usuario,
        id_rol: rolAdmin.id_rol,
      },
    },
    update: {},
    create: {
      id_usuario: admin.id_usuario,
      id_rol: rolAdmin.id_rol,
    },
  });

  console.log('Rol admin asociado al usuario admin.');

  console.log('Seed completado.');
  console.log(`Credenciales admin → ${adminEmail} / ${adminPassPlano}`);
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
