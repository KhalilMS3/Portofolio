import db from "../../db/db";
import { Result, Project } from "../../types";

export const STATUS_CODES = {
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
update: (id: number, data: Project, roleIds: number[]) => Promise<Result<Project>>;
   delete: (id: number) => Promise<Result<Project>>;
getProjectsByRole:(roleName: string) => Promise<Result<Project[]>>
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
      const roleCheckStmt = db.prepare(
         `SELECT COUNT(*) as count FROM Roles WHERE roleId = ?`
      );
      const roleInsertStmt = db.prepare(
         `INSERT INTO Roles (roleName) VALUES (?)`
      );

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
      const projectsStmt = db.prepare(`
      SELECT * FROM Projects
      `);
      const roleStmt = db.prepare(`
      SELECT Roles.roleName
      FROM Roles
      INNER JOIN ProjectRoles ON Roles.roleId = ProjectRoles.roleId
      WHERE ProjectRoles.projectId = ?
      `);

      // Get all projects
      const projects = projectsStmt.all();

      // For every project get roles
      for (const project of projects) {
         const roles = roleStmt.all(project.projectId);
         // adds roles names as a list
         project.roles = roles.map((role: any) => role.roleName);
      }
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
      const stmt = db.prepare(`
         SELECT *
         FROM Projects
         WHERE projectId = ?
      `);
      const project = stmt.get(id);

      if (project) {
         // Hente rollene for prosjektet
         const roleStmt = db.prepare(`
         SELECT Roles.roleName
         FROM Roles
         INNER JOIN ProjectRoles ON Roles.roleId = ProjectRoles.roleId
         WHERE ProjectRoles.projectId = ?
         `);
      const roles = roleStmt.all(project.projectId);
      project.roles = roles.map((role: any) => role.roleName); // Legger til rollene som en liste med navn

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
update: async (id: number, data: Project, roleIds: number[]): Promise<Result<Project>> => {
  const dbTransaction = db.transaction(() => {
    // Konverter `technologies` til JSON-streng
    const technologiesJson = JSON.stringify(data.technologies);

    // Oppdater prosjektet i Projects-tabellen
    const stmt = db.prepare(`
      UPDATE Projects
      SET projectName = ?, projectDesc = ?, projectUrl = ?, technologies = ?, public = ?, status = ?, publishedAt = ?
      WHERE projectId = ?
    `);
    const info = stmt.run(
      data.projectName,
      data.projectDesc,
      data.projectUrl,
      technologiesJson, // Lagre teknologier som JSON-streng
      data.public ? 1 : 0, // Konverter boolean til tall
      data.status,
      data.publishedAt,
      id
    );

    if (info.changes <= 0) {
      throw new Error(`No project with ID ${id} found to update`);
    }

    // Legg til roller i Roles-tabellen hvis de ikke eksisterer, og hent deres IDs
    const roleIdList: number[] = [];
    const insertRoleIfNotExistStmt = db.prepare(`
      INSERT INTO Roles (roleName) VALUES (?)
    `);
    const getRoleIdStmt = db.prepare(`
      SELECT roleId FROM Roles WHERE roleName = ?
    `); // Endret `id` til `roleId`

    for (const role of data.roles) {
      let roleId: number;

      // Prøv å hente eksisterende roleId
      const existingRole = getRoleIdStmt.get(role);
      if (existingRole) {
        roleId = existingRole.roleId;
      } else {
        // Hvis rollen ikke finnes, legg den til
        const roleInfo = insertRoleIfNotExistStmt.run(role);
        roleId = roleInfo.lastInsertRowid;
      }

      roleIdList.push(roleId);
    }

    // Oppdater roller i ProjectRoles-tabellen
    // Slett eksisterende roller
    const deleteRoleStmt = db.prepare(`
      DELETE FROM ProjectRoles WHERE projectId = ?
    `);
    deleteRoleStmt.run(id);

    // Legg til de nye rollene
    const insertRoleStmt = db.prepare(`
      INSERT INTO ProjectRoles (projectId, roleId) VALUES (?, ?)
    `);
    for (const roleId of roleIdList) {
      insertRoleStmt.run(id, roleId);
    }
  });

  try {
    dbTransaction();
    const updatedProject: Project = { ...data, projectId: id };
    return { success: true, data: updatedProject };
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
    // Slett relaterte roller fra ProjectRoles-tabellen
    const deleteRolesStmt = db.prepare(`
      DELETE FROM ProjectRoles WHERE projectId = ?
    `);
    deleteRolesStmt.run(id);

    // Slett prosjektet fra Projects-tabellen
    const deleteProjectStmt = db.prepare(`
      DELETE FROM Projects WHERE projectId = ?
    `);
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
        code: `${STATUS_CODES.INTERNAL_SERVER_ERROR}`, // 500 - Server error
        message: `Failed to delete project with ID ${id}: ${error}`,
      },
    };
  }
},


   getProjectsByRole: async (roleName: string): Promise<Result<Project[]>> => {
      try {
         const query = `
         SELECT Projects.*
         FROM Projects
         INNER JOIN ProjectRoles ON Projects.projectId = ProjectRoles.projectId
         INNER JOIN Roles ON Roles.roleId = ProjectRoles.roleId
         WHERE Roles.roleName = ?
         `
         const stmt = db.prepare(query)
         const projects = stmt.all(roleName)

         return {success: true, data: projects}
      } catch (error) {
         return {
         success: false,
         error: {
            code: `${STATUS_CODES.INTERNAL_SERVER_ERROR}`,
            message: `Failed to get projects by role: ${error}`,
         }
      }
      }
   }
}
}

export const projectRepository = createProjectRepository(db);
