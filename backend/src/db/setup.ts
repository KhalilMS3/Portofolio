import { DB } from "./db";
import { createTables, deleteAllRoles, dropTables } from "./tables";

export const setup = async (db: DB) => {
   
   await createTables(db)
   await deleteAllRoles(db)
   // seed her
}