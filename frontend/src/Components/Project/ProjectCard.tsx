import { useState } from "react";
import { ProjectCardProps } from "../../types/projects.types";

export default function ProjectCard(
  props: ProjectCardProps & { onRemoveProject: (id: number) => void }
) {
  const [showRemove, setShowRemove] = useState(false);
  const { onRemoveProject } = props;
  const updateShowState = () => {
    setShowRemove(true);
  };
  const {
    projectId = 0,
    projectName = "Project#",
    projectDesc = "project description",
    roles = ["None"],
    technologies = ["0"],
    projectUrl = "#",
    publishedAt = "dd.mm.åååå",
    isPublic = false,
    status = "Draft",
  } = props;

  return (
    <article
      className="project-card"
      onMouseEnter={updateShowState}
      onMouseLeave={() => setShowRemove(false)}
    >
      <section className="project-info">
        <h4 className="project-name">{projectName}</h4>
        <p className="project-desc">{projectDesc}</p>
      </section>
      <span className="divider"></span>
      <section className="project-details">
        <p>Rolle:</p>
        <ul className="roles list-elements">
          {roles?.map((role, idx) => (
            <li key={idx}>{role}</li>
          ))}
        </ul>
        <p>Teknologier:</p>
        <ul className="technologies list-elements">
          {technologies?.map((technology, idx) => (
            <li key={idx}>{technology}</li>
          ))}
        </ul>
        {projectUrl.includes("github") ? (
          <a href={projectUrl}>Github Repo</a>
        ) : (
          <a href={projectUrl}>Besøk nettside</a>
        )}
        {showRemove ? (
          <a
            className="remove-button"
            onClick={() => onRemoveProject(projectId)}
          >
            X Slett prosjekt
          </a>
        ) : null}
      </section>
    </article>
  );
}
