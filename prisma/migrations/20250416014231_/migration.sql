-- AlterTable
ALTER TABLE "Producto" ADD COLUMN "precioDosificacion" REAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT,
    "variacionId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_variacionId_fkey" FOREIGN KEY ("variacionId") REFERENCES "VariacionProducto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CartItem" ("cantidad", "cartId", "createdAt", "id", "precioUnitario", "updatedAt", "variacionId") SELECT "cantidad", "cartId", "createdAt", "id", "precioUnitario", "updatedAt", "variacionId" FROM "CartItem";
DROP TABLE "CartItem";
ALTER TABLE "new_CartItem" RENAME TO "CartItem";
CREATE UNIQUE INDEX "CartItem_cartId_variacionId_key" ON "CartItem"("cartId", "variacionId");
CREATE TABLE "new_OpcionAtributo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "atributoId" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    CONSTRAINT "OpcionAtributo_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "AtributoVariacion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OpcionAtributo" ("atributoId", "id", "valor") SELECT "atributoId", "id", "valor" FROM "OpcionAtributo";
DROP TABLE "OpcionAtributo";
ALTER TABLE "new_OpcionAtributo" RENAME TO "OpcionAtributo";
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
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("apellidos", "ciudad", "createdAt", "departamento", "direccionEnvio", "estado", "fechaCompra", "id", "montoTotal", "nombre", "nombreBarrio", "telefonoContacto", "updatedAt", "userId") SELECT "apellidos", "ciudad", "createdAt", "departamento", "direccionEnvio", "estado", "fechaCompra", "id", "montoTotal", "nombre", "nombreBarrio", "telefonoContacto", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
