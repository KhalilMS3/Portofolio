type ProjectCardProps = {
  projectName: string;
  projectDesc: string;
  roles: string[];
  technologies: string[];
  projectUrl: string;
};
export default function ProjectCard(props: ProjectCardProps) {
  const {
    projectName = "Project#",
    projectDesc = "project description",
    roles = ["None"],
    technologies = ["0"],
    projectUrl = "#",
  } = props;

  return (
    <article className="project-card">
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
        <a href={projectUrl}>Github Repo</a>
      </section>
    </article>
  );
}
