import type { DB } from "./db";

export const createTables = (db: DB) => {
   db.exec(`
   CREATE TABLE Projects (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   projectName TEXT NOT NULL,
   projectDesc TEXT,
   projectUrl TEXT,
   publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
   public BOOLEAN DEFAULT FALSE,
   status TEXT DEFAULT 'draft'
);
   CREATE TABLE Roles (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   projectId INTEGER,
   role TEXT,
   FOREIGN KEY (projectId) REFERENCES Projects(id)
);

   CREATE TABLE Technologies (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   projectId INTEGER,
   technology TEXT,
   FOREIGN KEY (projectId) REFERENCES Projects(id)
);

`)
}