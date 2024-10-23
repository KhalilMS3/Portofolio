import type { DB } from "./db";

export const createTables = (db: DB) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Projects (
      projectId INTEGER PRIMARY KEY AUTOINCREMENT,
      projectName TEXT NOT NULL,
      projectDesc TEXT,
      projectUrl TEXT,
      technologies TEXT,
      public BOOLEAN NOT NULL DEFAULT 0,
      status TEXT,
      publishedAt DATE
    );
    
    CREATE TABLE IF NOT EXISTS Roles (
      roleId INTEGER PRIMARY KEY AUTOINCREMENT, -- Oppdatering: Legg til kolonnenavn
      roleName TEXT UNIQUE NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS ProjectRoles (
      projectId INTEGER NOT NULL,
      roleId INTEGER NOT NULL,
      FOREIGN KEY (projectId) REFERENCES Projects(projectId) ON DELETE CASCADE,
      FOREIGN KEY (roleId) REFERENCES Roles(roleId) ON DELETE CASCADE,
      PRIMARY KEY (projectId, roleId)
    );
  `);
};


export const dropTables = (db: DB) => {
   db.exec(`
      DROP TABLE IF EXISTS ProjectRoles;
      DROP TABLE IF EXISTS Projects;
      DROP TABLE IF EXISTS Roles;
      `
      )
}

export const deleteAllRoles = (db: DB) => {
  db.exec(`
    DELETE FROM Roles
    `)
}