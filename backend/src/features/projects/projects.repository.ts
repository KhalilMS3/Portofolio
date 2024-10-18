import db from "../../db/db";
import { Result, Project } from "../../types";

type ProjectRepository = {
   list: (query?: Project) => Promise<Result<Project[]>>;
   create: (data: Project) => Promise<Result<Project>>;
   getById: (id: number) => Promise<Result<Project>>;
   update: (id: number, data: Project) => Promise<Result<Project>>;
   delete: (id: number) => Promise<Result<Project>>;
};

export const createProjectRepository = (db: any): ProjectRepository => {
   return {
      create: async (data: Project): Promise<Result<Project>> => {
         try {
            const stmt = db.prepare(`
               INSERT INTO Projects (projectName, projectDesc, projectUrl, public, status)
               VALUES (?, ?, ?, ?, ?)
            `);
            const info = stmt.run(
               data.projectName,
               data.projectDesc,
               data.projectUrl,
               data.public,
               data.status
            );

            const createdProject: Project = {
               ...data,
               projectId: info.lastInsertRowid, // Set projectId from the inserted row
            };

            return { success: true, data: createdProject };
         } catch (error) {
            return {
               success: false,
               error: {
                  code: "PROJECT_CREATE_ERROR", // Feilkode for opprettelse
                  message: `Failed to create project: ${error}`
               }
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
                  code: "PROJECT_LIST_ERROR", // Feilkode for listeinnhenting
                  message: `Failed to list projects: ${error}`
               }
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
                     code: "404", // Feilkode for ikke funnet prosjekt
                     message: `Project with ID ${id} not found`
                  }
               };
            }
         } catch (error) {
            return {
               success: false,
               error: {
                  code: "PROJECT_GET_ERROR", // Feilkode for henting av spesifikt prosjekt
                  message: `Failed to get project with ID ${id}: ${error}`
               }
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
                     code: "PROJECT_UPDATE_NO_CHANGES", // Feilkode for ingen endringer
                     message: `No changes made to project with ID ${id}`
                  }
               };
            }
         } catch (error) {
            return {
               success: false,
               error: {
                  code: "PROJECT_UPDATE_ERROR", // Feilkode for oppdateringsfeil
                  message: `Failed to update project with ID ${id}: ${error}`
               }
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
                     code: "PROJECT_DELETE_NO_CHANGES", // Feilkode for ingen sletting
                     message: `No project deleted with ID ${id}`
                  }
               };
            }
         } catch (error) {
            return {
               success: false,
               error: {
                  code: "PROJECT_DELETE_ERROR", // Feilkode for slettingsfeil
                  message: `Failed to delete project with ID ${id}: ${error}`
               }
            };
         }
      }
   };
};

export const projectRepository = createProjectRepository(db);
