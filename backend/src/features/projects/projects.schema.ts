import { z } from "zod";

export const projectSchema = z.object({
projectId: z.number().optional(),
projectName: z.string(),
projectDesc: z.string(),
roles: z.array(z.string()),
technologies: z.array(z.string()),
projectUrl: z.string(),
publishedAt: z.string(),
public: z.boolean(),
status: z.string(),
});

export const projectSchemaDB = projectSchema.extend({
technologies: z.string(),
roles: z.string(),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectDB = z.infer<typeof projectSchemaDB>;

export const validateProject = (data: unknown) => {
const result = projectSchema.safeParse(data);
if (result.success) {
   return { success: true, data: result.data };
} else {
   return { success: false, error: result.error };
}
};

export const validateProjectDB = (data: unknown) => {
const result = projectSchemaDB.safeParse(data);
if (result.success) {
   return { success: true, data: result.data };
} else {
   return { success: false, error: result.error };
}
};