/*
  Warnings:

  - You are about to drop the column `valor` on the `VariacionAtributo` table. All the data in the column will be lost.
  - Added the required column `valorAtributoId` to the `VariacionAtributo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VariacionAtributo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variacionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "valorAtributoId" TEXT NOT NULL,
    CONSTRAINT "VariacionAtributo_valorAtributoId_fkey" FOREIGN KEY ("valorAtributoId") REFERENCES "AtributoVariacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariacionAtributo_variacionId_fkey" FOREIGN KEY ("variacionId") REFERENCES "VariacionProducto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VariacionAtributo" ("id", "nombre", "variacionId") SELECT "id", "nombre", "variacionId" FROM "VariacionAtributo";
DROP TABLE "VariacionAtributo";
ALTER TABLE "new_VariacionAtributo" RENAME TO "VariacionAtributo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
