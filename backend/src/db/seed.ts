import fs from 'fs/promises';
import { projectsService } from '@/features/projects/projects.service';
import { Project, projectSchema } from '@/features/projects/projects.schema';

async function loadProjectsFromFile(path: string): Promise<Project[]> {
  try {
    const data = await fs.readFile(path, 'utf8');
    const parsedData = JSON.parse(data);

    if (!parsedData.projects || !Array.isArray(parsedData.projects)) {
      throw new Error("Projects data is not in the expected format");
    }

    console.log("Loaded projects:", parsedData.projects);
    return parsedData.projects;
  } catch (error) {
    console.error("Failed to load projects from file:", error);
    throw error;
  }
}

async function importProjectsToDatabase(projects: Project[]) {
  try {
    for (const project of projects) {
      try {
        // Validere prosjektdataene lokalt med Zod
        const validatedProject = projectSchema.parse(project);

        // Send til service-laget som tar seg av validering og oppretting i databasen
        const response = await projectsService.createProject(validatedProject);

        if (!response.success) {
          console.error(`Failed to import project: ${project.projectName}`, response.error);
        } else {
          console.log('Imported project:', response.data);
        }
      } catch (validationError) {
        console.error(`Validation failed for project: ${project.projectName}`, validationError);
      }
    }
    console.log('All projects have been imported successfully.');
  } catch (error) {
    console.error("Error during project import:", error);
  }
}

export async function seed() {
  try {
    const projects = await loadProjectsFromFile('./src/data/projects.json');
    await importProjectsToDatabase(projects);
  } catch (error) {
    console.error(`Failed to import projects: ${error}`);
  }
}

