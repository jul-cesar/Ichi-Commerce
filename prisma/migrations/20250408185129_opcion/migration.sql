/*
  Warnings:

  - You are about to drop the column `nombre` on the `VariacionAtributo` table. All the data in the column will be lost.
  - You are about to drop the column `valorAtributoId` on the `VariacionAtributo` table. All the data in the column will be lost.
  - Added the required column `opcionAtributoId` to the `VariacionAtributo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VariacionAtributo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variacionId" TEXT NOT NULL,
    "opcionAtributoId" TEXT NOT NULL,
    CONSTRAINT "VariacionAtributo_opcionAtributoId_fkey" FOREIGN KEY ("opcionAtributoId") REFERENCES "OpcionAtributo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariacionAtributo_variacionId_fkey" FOREIGN KEY ("variacionId") REFERENCES "VariacionProducto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VariacionAtributo" ("id", "variacionId") SELECT "id", "variacionId" FROM "VariacionAtributo";
DROP TABLE "VariacionAtributo";
ALTER TABLE "new_VariacionAtributo" RENAME TO "VariacionAtributo";
CREATE UNIQUE INDEX "VariacionAtributo_variacionId_opcionAtributoId_key" ON "VariacionAtributo"("variacionId", "opcionAtributoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
