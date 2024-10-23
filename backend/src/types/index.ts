import { z } from "zod";

export type Project = {
   projectId?: number;
   projectName: string;
   projectDesc: string;
   roles: string[];
   technologies: string[];
   projectUrl: string;
   publishedAt: string;
   public: boolean;
   status: string;
};

export type Success<T> = {
   success: true;
   data: T
}
export type Failure<T> = {
   success: false,
   error: {
      code: string,
      message: string,
   }
}
export type Result<T> =
   | Success<T>
   | Failure<T>

export const projectSchema = z.object({
projectName: z.string(),
projectDesc: z.string(),
roles: z.array(z.string()),
technologies: z.array(z.string()),
projectUrl: z.string(),
publishedAt: z.string(),
public: z.boolean(),
status: z.string(),
})