import { z } from "zod";
import { Result } from "@/types/types";
import { STATUS_CODES } from "@/lib/error"
import { projectRepository,  } from "./projects.repository";
import { projectSchema, Project } from "./projects.schema";

class ProjectService {
async createProject(data: any): Promise<Result<Project>> {
   try {
   const parsedProject = projectSchema.parse(data);
   return await projectRepository.create(parsedProject);
   } catch (error) {
   if (error instanceof z.ZodError) {
      return {
         success: false,
         error: {
         code: String(STATUS_CODES.BAD_REQUEST),
         message: JSON.stringify(error.errors),
         },
      };
   } else {
      return {
         success: false,
         error: {
         code: String(STATUS_CODES.INTERNAL_SERVER_ERROR),
         message: `Failed to create project: ${error}`,
         },
      };
   }
   }
}

async getProjectById(id: number): Promise<Result<Project>> {
   if (isNaN(id) || id <= 0) {
   return {
      success: false,
      error: {
         code: String(STATUS_CODES.BAD_REQUEST),
         message: "Invalid project ID",
      },
   };
   }
   return await projectRepository.getById(id);
}

async listProjects(role?: string): Promise<Result<Project[]>> {
   return await projectRepository.list(role ? { role } : undefined);
}

async updateProject(id: number, data: any): Promise<Result<Project>> {
   try {
   const parsedProject = projectSchema.parse(data);
   return await projectRepository.update(id, parsedProject);
   } catch (error) {
   if (error instanceof z.ZodError) {
      return {
         success: false,
         error: {
         code: String(STATUS_CODES.BAD_REQUEST),
         message: JSON.stringify(error.errors),
         },
      };
   } else {
      return {
         success: false,
         error: {
         code: String(STATUS_CODES.INTERNAL_SERVER_ERROR),
         message: `Failed to update project: ${error}`,
         },
      };
   }
   }
}

async deleteProject(id: number): Promise<Result<Project>> {
   if (isNaN(id) || id <= 0) {
   return {
      success: false,
      error: {
         code: STATUS_CODES.BAD_REQUEST,
         message: "Invalid project ID",
      },
   };
   }
   return await projectRepository.delete(id);
}
}

export const projectsService = new ProjectService();
