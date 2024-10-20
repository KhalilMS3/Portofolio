import db from "../../db/db";
import { Result, Project } from "../../types";

const STATUS_CODES = {
OK: 200,
CREATED: 201,
NO_CONTENT: 204,
BAD_REQUEST: 400,
NOT_FOUND: 404,
INTERNAL_SERVER_ERROR: 500,
};

type ProjectRepository = {
list: (query?: Project) => Promise<Result<Project[]>>;
create: (data: Project, roleIds: number[]) => Promise<Result<Project>>;
getById: (id: number) => Promise<Result<Project>>;
update: (id: number, data: Project) => Promise<Result<Project>>;
delete: (id: number) => Promise<Result<Project>>;
};

export const createProjectRepository = (db: any): ProjectRepository => {
return {
   create: async (
      data: Project,
      roleIds: number[]
   ): Promise<Result<Project>> => {
      const dbTransaction = db.transaction(() => {
      // Sørg for at alle feltene som settes inn har riktig datatype
      const technologies = data.technologies
         ? JSON.stringify(data.technologies)
         : null;
      const projectDesc = data.projectDesc || null;
      const projectUrl = data.projectUrl || null;
      const publishedAt = data.publishedAt || null;
      const publicStatus = data.public ? 1 : 0; // Konverter boolean til 0 eller 1
      const status = data.status || null;

      console.log("Innsetting av verdier:", {
         projectName: data.projectName,
         projectDesc,
         projectUrl,
         technologies,
         publicStatus,
         status,
         publishedAt,
      });

        // Først, sjekk om alle `roleIds` finnes i `Roles`-tabellen og opprett de som mangler
    const roleCheckStmt = db.prepare(`SELECT COUNT(*) as count FROM Roles WHERE roleId = ?`);
    const roleInsertStmt = db.prepare(`INSERT INTO Roles (roleName) VALUES (?)`);

    for (let i = 0; i < data.roles.length; i++) {
      const roleName = data.roles[i];
      let roleId = roleIds[i];

      const roleCheck = roleCheckStmt.get(roleId);
      if (roleCheck.count === 0) {
        // Opprett ny rolle hvis den ikke eksisterer
         const info = roleInsertStmt.run(roleName);
        roleId = info.lastInsertRowid; // Få `roleId` for den nye rollen
        roleIds[i] = roleId; // Oppdater `roleIds`-listen med den nye id-en
      }
   }

      // Sett inn prosjekt i Projects-tabellen
      const stmt = db.prepare(`
      INSERT INTO Projects (projectName, projectDesc, projectUrl, technologies, public, status, publishedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
   `);
      const info = stmt.run(
         data.projectName,
         projectDesc,
         projectUrl,
         technologies,
         publicStatus,
         status,
         publishedAt
      );

      const projectId = info.lastInsertRowid;

      // Sett inn roller i ProjectRoles-tabellen
      const roleStmt = db.prepare(`
      INSERT INTO ProjectRoles (projectId, roleId) VALUES (?, ?)
   `);
      for (const roleId of roleIds) {
         roleStmt.run(projectId, roleId);
      }

      return projectId;
      });

      try {
      const projectId = dbTransaction();
      const createdProject: Project = { ...data, projectId };
      return { success: true, data: createdProject };
      } catch (error) {
      console.error("Feil under opprettelse av prosjekt:", error);
      return {
         success: false,
         error: {
            code: `${STATUS_CODES.INTERNAL_SERVER_ERROR}`,
            message: `Failed to create project: ${error}`,
         },
      };
      }
   },
   list: async (): Promise<Result<Project[]>> => {
      try {
      const stmt = db.prepare("SELECT * FROM Projects");
      const projects = stmt.all();

      return { success: true, data: projects };
      } catch (error) {
      return {
         success: false,
         error: {
            code: `${STATUS_CODES.INTERNAL_SERVER_ERROR}`, // 500 - Server error
            message: `Failed to list projects: ${error}`,
         },
      };
      }
   },

   getById: async (id: number): Promise<Result<Project>> => {
      try {
      const stmt = db.prepare("SELECT * FROM Projects WHERE projectId = ?");
      const project = stmt.get(id);

      if (project) {
         return { success: true, data: project };
      } else {
         return {
            success: false,
            error: {
            code: `${STATUS_CODES.NOT_FOUND}`, // 404 - Not Found
            message: `Project with ID ${id} not found`,
            },
         };
      }
      } catch (error) {
      return {
         success: false,
         error: {
            code: `${STATUS_CODES.INTERNAL_SERVER_ERROR}`, // 500 - Server error
            message: `Failed to get project with ID ${id}: ${error}`,
         },
      };
      }
   },

   update: async (id: number, data: Project): Promise<Result<Project>> => {
      try {
      const stmt = db.prepare(`
               UPDATE Projects
               SET projectName = ?, projectDesc = ?, projectUrl = ?, public = ?, status = ?
               WHERE projectId = ?
            `);
      const info = stmt.run(
         data.projectName,
         data.projectDesc,
         data.projectUrl,
         data.public,
         data.status,
         id
      );

      if (info.changes > 0) {
         return { success: true, data: { ...data, projectId: id } };
      } else {
         return {
            success: false,
            error: {
            code: `${STATUS_CODES.NOT_FOUND}`, // 404 - Not Found
            message: `No project with ID ${id} found to update`,
            },
         };
      }
      } catch (error) {
      return {
         success: false,
         error: {
            code: `${STATUS_CODES.INTERNAL_SERVER_ERROR}`, // 500 - Server error
            message: `Failed to update project with ID ${id}: ${error}`,
         },
      };
      }
   },

   delete: async (id: number): Promise<Result<Project>> => {
      try {
      const stmt = db.prepare("DELETE FROM Projects WHERE projectId = ?");
      const info = stmt.run(id);

      if (info.changes > 0) {
         return { success: true, data: { projectId: id } as Project };
      } else {
         return {
            success: false,
            error: {
            code: `${STATUS_CODES.NOT_FOUND}`, // 404 - Not Found
            message: `No project deleted with ID ${id}`,
            },
         };
      }
      } catch (error) {
      return {
         success: false,
         error: {
            code: `${STATUS_CODES.INTERNAL_SERVER_ERROR}`, // 500 - Server error
            message: `Failed to delete project with ID ${id}: ${error}`,
         },
      };
      }
   },
};
};

export const projectRepository = createProjectRepository(db);
