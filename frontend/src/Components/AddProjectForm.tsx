import React, { FormEvent, useEffect, useState } from "react";
import { Project } from "../types";

export default function AddProjectForm() {
  const [project, setProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [projectDesc, setProjectDesc] = useState("");
  const [projectUrl, setProjectUrl] = useState("");

  const handleCommaSeperatedInput = (input: string) => {
    return input.split(",").map((item) => item.trim());
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProject: Project ={
      projectName: projectName,
      roles: roles,
      technologies: technologies,
      projectDesc: projectDesc,
      projectUrl: projectUrl,
    };

    setProject(newProject)
  };
  useEffect(() => {
    if (project) {
      console.log("Project submitted:", project);
    }
  }, [project]);

  return (
    <section className="formSection">
      <h2>Legg til et nytt prosjekt</h2>
      <form onSubmit={handleSubmit} id="projectForm">
        <label htmlFor="projectName">Prosjekt navn</label>
        <input
          type="text"
          name="projectName"
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Prosjekt navn"
          required
        />
        <label htmlFor="roles">Roller</label>
        <caption>skriv inn roller med komma (,) som seprator</caption>
        <input
          type="text"
          name="roles"
          id="roles"
          value={roles.join(",")}
          onChange={(e) => setRoles(handleCommaSeperatedInput(e.target.value))}
          placeholder="Fullstack, UI/UX"
          required
        />
        <label htmlFor="technologiesAndTools">Teknologier & verktøy</label>
        <caption>
          skriv inn Teknologier og verkøty med komma (,) som seprator
        </caption>

        <input
          type="text"
          name="technologies"
          id="technologies"
          value={technologies.join(",")}
          onChange={(e) =>
            setTechnologies(handleCommaSeperatedInput(e.target.value))
          }
          placeholder="React, Node.js"
        />
        <label htmlFor="projectURL">URL</label>
        <input
          type="text"
          name="projectURL"
          id="projectURL"
          value={projectUrl}
          onChange={(e) => setProjectUrl(e.target.value)}
          placeholder="http://"
          required
        />
        <label htmlFor="projectDesc">Beskrivelse</label>
        <textarea
          name="projectDesc"
          id="projectDesc"
          value={projectDesc}
          onChange={(e) => setProjectDesc(e.target.value)}
          rows={10}
          cols={30}
          required
        />
        <div className="button-container">
          <button type="submit" onClick={handleSubmit}>
            Legg til
          </button>
        </div>
      </form>
    </section>
  );
}
