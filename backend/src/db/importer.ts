import fs from 'fs/promises';
import { projectSchema } from "../types";

async function loadProjectsFromFile(path: string) {
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
async function addRoleIfNotExists(role: string) {
   const response = await fetch('http://localhost:3999/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: role })
   });
   const result = await response.json();
   return result.id; // Return role ID
}
async function importProjectsToDatabase(projects: any[]) {
   try {
      for (const project of projects) {
         // Validere prosjektdataene lokalt med Zod
         try {
            projectSchema.parse(project);
         } catch (validationError) {
            console.error(`Validation failed for project: ${project.projectName}`, validationError);
            continue; // Hopp over prosjektet hvis valideringen feiler
         }

         // Hent eller lagre roller og få deres ID-er
         const roleIds = await Promise.all(project.roles.map(addRoleIfNotExists));

         const response = await fetch('http://localhost:3999/api/projects', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                  projectName: project.projectName,
                  projectDesc: project.projectDesc || '',
                  projectUrl: project.projectUrl || '',
                  technologies: project.technologies,
                  publishedAt: project.publishedAt,
                  public: project.public,
                  status: project.status,
                  roles: roleIds
               })
         });

         const result = await response.json();
         console.log('Imported project:', result);
      }
   } catch (error) {
      console.error("Error during project import:", error);
   }
}

async function importProjects() {
   try {  
      const projects = await loadProjectsFromFile('./src/data/projects.json');
      await importProjectsToDatabase(projects);
      console.log('All projects have been imported successfully.');
   } catch (error) {
      console.error(`Failed to import projects: ${error}`);
   }
}

importProjects();
