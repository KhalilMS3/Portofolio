import db from "@/db/db";
import { Result } from "@/types/types";
import { STATUS_CODES } from "@/lib/error"
import { Project, ProjectDB } from "./projects.schema";
type ProjectRepository = {
list: (query?: { role?: string }) => Promise<Result<Project[]>>;
create: (data: Project) => Promise<Result<Project>>;
getById: (id: number) => Promise<Result<Project>>;
update: (id: number, data: Project) => Promise<Result<Project>>;
delete: (id: number) => Promise<Result<Project>>;
};

export const createProjectRepository = (db: any): ProjectRepository => {
return {
   create: async (data: Project): Promise<Result<Project>> => {
      const dbTransaction = db.transaction(() => {
      const projectToDb: ProjectDB = {
         ...data,
         technologies: JSON.stringify(data.technologies),
         roles: JSON.stringify(data.roles),
      };

      const stmt = db.prepare(`
         INSERT INTO Projects (projectName, projectDesc, projectUrl, technologies, public, status, publishedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
         projectToDb.projectName,
         projectToDb.projectDesc,
         projectToDb.projectUrl,
         projectToDb.technologies,
         projectToDb.public ? 1 : 0,
         projectToDb.status,
         projectToDb.publishedAt
      );

      const projectId = info.lastInsertRowid;

      // Insert roles into ProjectRoles table
      const roleStmt = db.prepare(`
         INSERT INTO ProjectRoles (projectId, roleId) VALUES (?, ?)
      `);
      const getRoleIdStmt = db.prepare(`
         SELECT roleId FROM Roles WHERE roleName = ?
      `);
      for (const role of data.roles) {
         let roleId = getRoleIdStmt.get(role)?.roleId;
         if (!roleId) {
            const insertRoleStmt = db.prepare(`INSERT INTO Roles (roleName) VALUES (?)`);
            const roleInfo = insertRoleStmt.run(role);
            roleId = roleInfo.lastInsertRowid;
         }
         roleStmt.run(projectId, roleId);
      }

      return projectId;
      });

      try {
      const projectId = dbTransaction();
      return { success: true, data: { ...data, projectId } };
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

   list: async (query?: { role?: string }): Promise<Result<Project[]>> => {
      try {
      let projects;
      if (query?.role) {
         const stmt = db.prepare(`
            SELECT p.*, GROUP_CONCAT(r.roleName) AS roles
            FROM Projects p
            JOIN ProjectRoles pr ON p.projectId = pr.projectId
            JOIN Roles r ON pr.roleId = r.roleId
            WHERE r.roleName = ?
            GROUP BY p.projectId
         `);
         projects = stmt.all(query.role);
      } else {
         const stmt = db.prepare(`
            SELECT p.*, GROUP_CONCAT(r.roleName) AS roles
            FROM Projects p
            LEFT JOIN ProjectRoles pr ON p.projectId = pr.projectId
            LEFT JOIN Roles r ON pr.roleId = r.roleId
            GROUP BY p.projectId
         `);
         projects = stmt.all();
      }

      const parsedProjects = projects.map((project: any) => ({
         ...project,
         roles: project.roles ? project.roles.split(",") : [],
         technologies: JSON.parse(project.technologies),
      }));

      return { success: true, data: parsedProjects };
      } catch (error) {
      console.error("Failed to list projects:", error);
      return {
         success: false,
         error: {
            code: `${STATUS_CODES.INTERNAL_SERVER_ERROR}`,
            message: `Failed to list projects: ${error}`,
         },
      };
      }
   },

   getById: async (id: number): Promise<Result<Project>> => {
      try {
      const stmt = db.prepare(`
         SELECT *
         FROM Projects
         WHERE projectId = ?
      `);
      const project = stmt.get(id);

      if (project) {
         const roleStmt = db.prepare(`
            SELECT Roles.roleName
            FROM Roles
            INNER JOIN ProjectRoles ON Roles.roleId = ProjectRoles.roleId
            WHERE ProjectRoles.projectId = ?
         `);
         const roles = roleStmt.all(project.projectId);
         project.roles = roles.map((role: any) => role.roleName);
         project.technologies = JSON.parse(project.technologies);

         return { success: true, data: project };
      } else {
         return {
            success: false,
            error: {
            code: `${STATUS_CODES.NOT_FOUND}`,
            message: `Project with ID ${id} not found`,
            },
         };
      }
      } catch (error) {
      return {
         success: false,
         error: {
            code: `${STATUS_CODES.INTERNAL_SERVER_ERROR}`,
            message: `Failed to get project with ID ${id}: ${error}`,
         },
      };
      }
   },

   update: async (id: number, data: Project): Promise<Result<Project>> => {
      const dbTransaction = db.transaction(() => {
      const projectToDb: ProjectDB = {
         ...data,
         technologies: JSON.stringify(data.technologies),
         roles: JSON.stringify(data.roles),
      };

      const stmt = db.prepare(`
         UPDATE Projects
         SET projectName = ?, projectDesc = ?, projectUrl = ?, technologies = ?, public = ?, status = ?, publishedAt = ?
         WHERE projectId = ?
      `);
      const info = stmt.run(
         projectToDb.projectName,
         projectToDb.projectDesc,
         projectToDb.projectUrl,
         projectToDb.technologies,
         projectToDb.public ? 1 : 0,
         projectToDb.status,
         projectToDb.publishedAt,
         id
      );

      if (info.changes <= 0) {
         throw new Error(`No project with ID ${id} found to update`);
      }

      const deleteRoleStmt = db.prepare(`DELETE FROM ProjectRoles WHERE projectId = ?`);
      deleteRoleStmt.run(id);

      const insertRoleStmt = db.prepare(`INSERT INTO ProjectRoles (projectId, roleId) VALUES (?, ?)`);
      const getRoleIdStmt = db.prepare(`SELECT roleId FROM Roles WHERE roleName = ?`);
      for (const role of data.roles) {
         let roleId = getRoleIdStmt.get(role)?.roleId;
         if (!roleId) {
            const roleInfo = db.prepare(`INSERT INTO Roles (roleName) VALUES (?)`).run(role);
            roleId = roleInfo.lastInsertRowid;
         }
         insertRoleStmt.run(id, roleId);
      }
      });

      try {
      dbTransaction();
      return { success: true, data: { ...data, projectId: id } };
      } catch (error) {
      return {
         success: false,
         error: {
            code: `${STATUS_CODES.INTERNAL_SERVER_ERROR}`,
            message: `Failed to update project with ID ${id}: ${error}`,
         },
      };
      }
   },

   delete: async (id: number): Promise<Result<Project>> => {
      const dbTransaction = db.transaction(() => {
      const deleteRolesStmt = db.prepare(`DELETE FROM ProjectRoles WHERE projectId = ?`);
      deleteRolesStmt.run(id);

      const deleteProjectStmt = db.prepare(`DELETE FROM Projects WHERE projectId = ?`);
      const info = deleteProjectStmt.run(id);

      if (info.changes <= 0) {
         throw new Error(`No project with ID ${id} found to delete`);
      }
      });

      try {
      dbTransaction();
      return { success: true, data: { projectId: id } as Project };
      } catch (error) {
      return {
         success: false,
         error: {
            code: `${STATUS_CODES.INTERNAL_SERVER_ERROR}`,
            message: `Failed to delete project with ID ${id}: ${error}`,
         },
      };
      }
   },
};
};

export const projectRepository = createProjectRepository(db);
