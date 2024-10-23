import { z } from "zod";
import { Result, Project, projectSchema } from "../../types";
import { projectRepository, STATUS_CODES } from "./projects.repository";

class projectService {

   async createProject(data: any): Promise<Result<Project>> {
      try {
         // Validate project data with Zod
         const parsedProject = projectSchema.parse(data);
      
         // Check and create roles if not exists
         let roleIds = data.roleIds;
         if (!Array.isArray(roleIds) || !roleIds) {
            roleIds = []
         } else if (!roleIds.every((id) => typeof id === "number")) {
            roleIds = roleIds.map((id: any) => Number(id));
         }

         // Send further to repository to create a project
         const response = await projectRepository.create(parsedProject, roleIds);
         return response;

      } catch (error) {
         if (error instanceof z.ZodError) {
            return {
               success: false,
               error: {
                  code: String(STATUS_CODES.BAD_REQUEST),
                  message: JSON.stringify(error.errors),
               }
            }
         } else {
            return {
               success: false,
               error: {
                  code: String(STATUS_CODES.INTERNAL_SERVER_ERROR),
                  message: `Failed to create project: ${error}`,
               }
            }
         }
      }
   }

   async getProjectById(id: number): Promise<Result<Project>> {
      // Validate ID first
      if (isNaN(id) || id <= 0) {
         return {
               success: false,
               error: {
                  code: String(STATUS_CODES.BAD_REQUEST),
                  message: "Invalid project ID",
               }
         }
      }
      // Get projects from repository
      return await projectRepository.getById(id)
   }

   async listProjects(role?: string): Promise<Result<Project[]>>{
      // Check if role is given as query and send it further to the repository to filter projects
      if (!role) {
         return await projectRepository.list()
      } 
      return await projectRepository.list({ role })
   } 

   async updateProject(id: number, data: any): Promise<Result<Project>>{
      try {
         // Validate with zod
         const parsedProject = projectSchema.parse(data)

         // Get role Ids from the data
         let roleIds = data.roleIds;
         if (!Array.isArray(roleIds) || !roleIds) {
            roleIds = []
         } else if (!roleIds.every((id) => typeof id === "number")) {
            roleIds = roleIds.map((id: any) => Number(id));
         }

         // Send further to the repository to update the project
         return await projectRepository.update(id, parsedProject, roleIds)

      } catch (error) {
         if (error instanceof z.ZodError) {
            return {
               success: false,
               error: {
                  code: String(STATUS_CODES.BAD_REQUEST),
                  message: JSON.stringify(error.errors),
               }
            }
         } else {
            return {
               success: false,
               error: {
                  code: String(STATUS_CODES.INTERNAL_SERVER_ERROR),
                  message: `Failed to create project: ${error}`,
               }
            }
         }
      }
   }

   async deleteProject(id: number): Promise<Result<Project>>{
      if (isNaN(id) || id <= 0) {
         return {
            success: false,
            error: {
               code: STATUS_CODES.BAD_REQUEST,
               message: "Invalid project ID"
            }
         }
      }

      return await projectRepository.delete(id)
   }
}

export const projectsService = new projectService();