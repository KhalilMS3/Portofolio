import { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import { Project } from "../types";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProjectsFromJson = async () => {
    const response = await fetch("./src/projects.json");
    const data = await response.json();
    setProjects(data);
    console.log("Data from Json:", data);
    return data;
  };
  useEffect(() => {
    loadProjectsFromJson();
  }, []);
  return (
    <>
      <section className="projects-section">
        <h3>Prosjekter</h3>
        <section id="projects" className="projects-cards">
          {projects?.map((project, idx) => (
            <ProjectCard
              key={idx}
              projectName={project.projectName}
              projectDesc={project.projectDesc}
              roles={project.roles}
              technologies={project.technologies}
              projectUrl={project.projectUrl}
            />
          ))}
        </section>
      </section>
    </>
  );
}
