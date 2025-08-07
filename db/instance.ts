import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "./generated/client";

// Crear el adaptador directamente con la configuración
const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const prisma = new PrismaClient({ adapter });