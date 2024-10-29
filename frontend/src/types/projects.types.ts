import { z } from 'zod';

// Skjema for å validere prosjektdata
export const projectSchema = z.object({
  projectId: z.number().optional(), // Project ID kan være undefined ved opprettelse
  projectName: z.string(),
  projectDesc: z.string(),
  roles: z.array(z.string()),
  technologies: z.array(z.string()),
  projectUrl: z.string().url(), // Valider at URL er gyldig
  publishedAt: z.string(), // Format kan også valideres mer spesifikt hvis ønsket
  public: z.boolean(),
  status: z.string(),
});

// Type for prosjektdata basert på skjemaet
export type Project = z.infer<typeof projectSchema>;

// Valider prosjektdataene på frontend
export const validateProject = (data: unknown) => {
  const result = projectSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
};

export type ProjectCardProps = {
  projectId: number | undefined;
  projectName: string;
  projectDesc: string;
  roles: string[];
  technologies: string[];
  projectUrl: string;
  publishedAt: string;
  isPublic: boolean;
  status: string
};

