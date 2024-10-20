import fs from 'fs/promises';

async function loadProjectsFromFile(path: string) {
   const data = await fs.readFile(path, 'utf8');
   const parsedData = JSON.parse(data);
   const projects = parsedData.projects
   console.log(projects)
   return projects; // Returner listen med prosjekter
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
   for (const project of projects) {
      // Hent eller lagre roller og få deres ID-er
      const roleIds = await Promise.all(project.roles.map(addRoleIfNotExists));

      // Prosjektdata inkludert teknologier (lagres direkte som felt)
      const response = await fetch('http://localhost:3999/api/projects', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               projectName: project.projectName,
               projectDesc: project.projectDesc,
               projectUrl: project.projectUrl,
               technologies: JSON.stringify(project.technologies), // Lagre teknologier som JSON-streng
               publishedAt: project.publishedAt,
               public: project.public,
               status: project.status,
               roles: roleIds // Bruk ID-er for roller
            })
      });

      const result = await response.json();
      console.log('Imported project:', result);
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
