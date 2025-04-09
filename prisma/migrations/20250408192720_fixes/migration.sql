-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AtributoVariacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);
INSERT INTO "new_AtributoVariacion" ("descripcion", "id", "nombre") SELECT "descripcion", "id", "nombre" FROM "AtributoVariacion";
DROP TABLE "AtributoVariacion";
ALTER TABLE "new_AtributoVariacion" RENAME TO "AtributoVariacion";
CREATE TABLE "new_Categoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "img" TEXT
);
INSERT INTO "new_Categoria" ("descripcion", "id", "img", "nombre") SELECT "descripcion", "id", "img", "nombre" FROM "Categoria";
DROP TABLE "Categoria";
ALTER TABLE "new_Categoria" RENAME TO "Categoria";
CREATE TABLE "new_ImagenVariacionProducto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variacionId" TEXT,
    "url" TEXT NOT NULL,
    "tipo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "productoId" TEXT,
    CONSTRAINT "ImagenVariacionProducto_variacionId_fkey" FOREIGN KEY ("variacionId") REFERENCES "VariacionProducto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ImagenVariacionProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ImagenVariacionProducto" ("createdAt", "id", "productoId", "tipo", "updatedAt", "url", "variacionId") SELECT "createdAt", "id", "productoId", "tipo", "updatedAt", "url", "variacionId" FROM "ImagenVariacionProducto";
DROP TABLE "ImagenVariacionProducto";
ALTER TABLE "new_ImagenVariacionProducto" RENAME TO "ImagenVariacionProducto";
CREATE TABLE "new_Producto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "imagenPrincipal" TEXT,
    CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Producto" ("categoriaId", "createdAt", "descripcion", "id", "imagenPrincipal", "nombre", "precio", "updatedAt") SELECT "categoriaId", "createdAt", "descripcion", "id", "imagenPrincipal", "nombre", "precio", "updatedAt" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
CREATE TABLE "new_VariacionAtributo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variacionId" TEXT NOT NULL,
    "opcionAtributoId" TEXT NOT NULL,
    "variacionProductoId" TEXT,
    CONSTRAINT "VariacionAtributo_opcionAtributoId_fkey" FOREIGN KEY ("opcionAtributoId") REFERENCES "OpcionAtributo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariacionAtributo_variacionProductoId_fkey" FOREIGN KEY ("variacionProductoId") REFERENCES "VariacionProducto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_VariacionAtributo" ("id", "opcionAtributoId", "variacionId") SELECT "id", "opcionAtributoId", "variacionId" FROM "VariacionAtributo";
DROP TABLE "VariacionAtributo";
ALTER TABLE "new_VariacionAtributo" RENAME TO "VariacionAtributo";
CREATE UNIQUE INDEX "VariacionAtributo_variacionId_opcionAtributoId_key" ON "VariacionAtributo"("variacionId", "opcionAtributoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
