import { DB } from "./db";
import { createTables, dropTables } from "./tables";

export const setup = async (db: DB) => {
   
   await createTables(db)
   // await dropTables(db)
   // seed her
}