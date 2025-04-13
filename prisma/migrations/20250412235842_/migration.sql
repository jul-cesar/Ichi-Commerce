/*
  Warnings:

  - Added the required column `apellidos` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ciudad` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departamento` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precioPromo` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "direccionEnvio" TEXT,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "nombreBarrio" TEXT,
    "montoTotal" REAL NOT NULL,
    "telefonoContacto" TEXT NOT NULL,
    "fechaCompra" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "direccionEnvio", "estado", "fechaCompra", "id", "montoTotal", "nombreBarrio", "telefonoContacto", "updatedAt", "userId") SELECT "createdAt", "direccionEnvio", "estado", "fechaCompra", "id", "montoTotal", "nombreBarrio", "telefonoContacto", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_Producto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" REAL NOT NULL,
    "precioPromo" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "imagenPrincipal" TEXT,
    CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Producto" ("categoriaId", "createdAt", "descripcion", "id", "imagenPrincipal", "nombre", "precio", "updatedAt") SELECT "categoriaId", "createdAt", "descripcion", "id", "imagenPrincipal", "nombre", "precio", "updatedAt" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
