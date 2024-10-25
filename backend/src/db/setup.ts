import { DB } from "./db";
import { seed } from "./seed";
import { createTables, deleteContent, dropTables } from "./tables";

export const setup = async (db: DB) => {
   
   // await createTables(db)
   // await deleteContent(db)
   await seed()
}