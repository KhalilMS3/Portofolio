import { Project } from "./types"

const loadFromJson = async () => {
   const response = await fetch('./projects.json')
   const data = await response.json()
   console.log("JSON says Hei",data)
   return data
}
const loadProjects = async() => {
   const response = await fetch('http://localhost:3999',
      {
         method: "GET",
         headers: {
            "Content-Type" : "application/json"
         }
      })
   
   console.log(response.status)
   console.log(response.ok)

   const data = await response.json()
   console.log("server says hey", data)

   const projectsSection = document.getElementById("projects");

   if (projectsSection) {
      // Clear existing projects in the section
      projectsSection.innerHTML = "";
      data.forEach((project: Project) => {
            const projectCard = document.createElement("article");
            projectCard.classList.add("project-card");
            
            const projectName = document.createElement("h4");
            projectName.textContent = project.projectName;
            projectCard.appendChild(projectName);
            
            const description = document.createElement("p");
            description.textContent = project.description;
            projectCard.appendChild(description);
            
            const projectURL = document.createElement("a");
            projectURL.href = project.url;
            projectURL.textContent = "Github Repo";
            projectCard.appendChild(projectURL);
            
            projectsSection.appendChild(projectCard);
         });
      
   }
}

const addProject = async (newProject: unknown) => {
   try {
      const response = await fetch('http://localhost:3999/add',
      {
         method: "POST",
         headers: {
            "Content-Type" : "application/json"
         },
         body: JSON.stringify(newProject)
         })
      
      console.log(response.status)
      console.log(response.ok)
      
      const data = await response.json()
      console.log(data)

      loadProjects()
   } catch (error) {
      console.error("Error loading projects", error)
   }
}

const form = document.querySelector("form") as HTMLFormElement;
form?.addEventListener("submit", async (event) => {
   event.preventDefault();

   
   const projectName = (form.elements.namedItem("projectName") as HTMLInputElement)?.value;
      const description = (form.elements.namedItem("description") as HTMLInputElement)?.value;
      const url = (form.elements.namedItem("projectURL") as HTMLInputElement)?.value;

   try {
      await addProject({projectName, description, url})
   } catch (error) {
      console.error("Error adding a new project", error)
   }
}
)

loadFromJson()
loadProjects()