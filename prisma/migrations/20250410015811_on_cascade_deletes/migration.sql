-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VariacionAtributo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opcionAtributoId" TEXT NOT NULL,
    "variacionProductoId" TEXT,
    CONSTRAINT "VariacionAtributo_opcionAtributoId_fkey" FOREIGN KEY ("opcionAtributoId") REFERENCES "OpcionAtributo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariacionAtributo_variacionProductoId_fkey" FOREIGN KEY ("variacionProductoId") REFERENCES "VariacionProducto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VariacionAtributo" ("id", "opcionAtributoId", "variacionProductoId") SELECT "id", "opcionAtributoId", "variacionProductoId" FROM "VariacionAtributo";
DROP TABLE "VariacionAtributo";
ALTER TABLE "new_VariacionAtributo" RENAME TO "VariacionAtributo";
CREATE UNIQUE INDEX "VariacionAtributo_variacionProductoId_opcionAtributoId_key" ON "VariacionAtributo"("variacionProductoId", "opcionAtributoId");
CREATE TABLE "new_VariacionProducto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productoId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VariacionProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VariacionProducto" ("createdAt", "id", "productoId", "stock", "updatedAt") SELECT "createdAt", "id", "productoId", "stock", "updatedAt" FROM "VariacionProducto";
DROP TABLE "VariacionProducto";
ALTER TABLE "new_VariacionProducto" RENAME TO "VariacionProducto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
