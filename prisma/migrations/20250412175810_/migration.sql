/*
  Warnings:

  - You are about to drop the column `fechaActualizada` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `metodoPago` on the `Order` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "direccionEnvio" TEXT,
    "nombreBarrio" TEXT,
    "montoTotal" REAL NOT NULL,
    "fechaCompra" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "direccionEnvio", "estado", "fechaCompra", "id", "montoTotal", "updatedAt", "userId") SELECT "createdAt", "direccionEnvio", "estado", "fechaCompra", "id", "montoTotal", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
