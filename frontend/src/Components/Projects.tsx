import ProjectCard from "./ProjectCard";
import { useProject } from "../hooks/useProject";

export default function Projects() {
  const { projects, loading, error } = useProject();

  return (
    <>
      <section className="projects-section">
        <h3>Prosjekter</h3>
        {loading ? (
          <p>Laster prosjekter...</p>
        ) : error ? (
          <p>Feil ved henting av prosjekter 🙁, sjekk om serveren kjører</p>
        ) : projects.length === 0 ? (
          <p>Ingen prosjekter funnet 🙁</p>
        ) : (
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
        )}
      </section>
    </>
  );
}
