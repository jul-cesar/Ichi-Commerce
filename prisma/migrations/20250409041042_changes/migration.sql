/*
  Warnings:

  - You are about to drop the column `variacionId` on the `VariacionAtributo` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VariacionAtributo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opcionAtributoId" TEXT NOT NULL,
    "variacionProductoId" TEXT,
    CONSTRAINT "VariacionAtributo_opcionAtributoId_fkey" FOREIGN KEY ("opcionAtributoId") REFERENCES "OpcionAtributo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariacionAtributo_variacionProductoId_fkey" FOREIGN KEY ("variacionProductoId") REFERENCES "VariacionProducto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_VariacionAtributo" ("id", "opcionAtributoId", "variacionProductoId") SELECT "id", "opcionAtributoId", "variacionProductoId" FROM "VariacionAtributo";
DROP TABLE "VariacionAtributo";
ALTER TABLE "new_VariacionAtributo" RENAME TO "VariacionAtributo";
CREATE UNIQUE INDEX "VariacionAtributo_opcionAtributoId_key" ON "VariacionAtributo"("opcionAtributoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
