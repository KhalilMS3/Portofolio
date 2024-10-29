import ProjectCard from "./ProjectCard";
import { useProject } from "../../hooks/useProject";
import { API_BASE } from "../../config/urls";

export default function Projects() {
  const { projects, setProjects, loading, error } = useProject();

  const onRemoveProject = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        setProjects((prev) =>
          prev.filter((project) => project.projectId !== id)
        );
        console.log(`Prosjekt med ID ${id} ble slettet.`);
      } else {
        console.error(
          `Sletting av prosjektet med ID ${id} feilet:`,
          response.statusText
        );
      }
    } catch (error) {
      console.error(`En feil oppstod ved sletting av prosjekt med ID ${id}:`);
    }
  };
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
            {projects?.map((project) => (
              <ProjectCard
                key={project.projectId}
                projectId={project.projectId}
                projectName={project.projectName}
                projectDesc={project.projectDesc}
                roles={project.roles}
                technologies={project.technologies}
                projectUrl={project.projectUrl}
                publishedAt={project.publishedAt}
                isPublic={project.public}
                status={project.status}
                onRemoveProject={onRemoveProject}
              />
            ))}
          </section>
        )}
      </section>
    </>
  );
}
