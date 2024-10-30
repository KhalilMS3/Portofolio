import React, { useEffect, useState } from "react";
import { Project } from "../../types/projects.types";
import { API_BASE } from "../../config/urls";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddProjectForm() {
  const [project, setProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [projectDesc, setProjectDesc] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState("Draft");

  const handleCommaSeperatedInput = (input: string) => {
    return input.split(",").map((item) => item.trim());
  };
  const notifySuccess = () => {
    toast.success("Prosjekt opprettet 🎉"),
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      };
  }
  const notifyError = () => {
    toast.error("Kunne ikke opprette prosjektet 🙁"),
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      };
  };
  const clearFormFields = () => {
    setProjectName("");
    setRoles([]);
    setTechnologies([]);
    setProjectDesc("");
    setProjectUrl("");
    setPublishedAt("");
    setIsPublic(false);
    setStatus("Draft");
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProject: Project = {
      projectName: projectName,
      roles: roles,
      technologies: technologies,
      projectDesc: projectDesc,
      projectUrl: projectUrl,
      publishedAt: publishedAt,
      public: isPublic,
      status: status,
    };

    setProject(newProject);
    clearFormFields();
  };
  useEffect(() => {
    if (project) {
      console.log("Project submitted:", project);
      fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      })
        .then((response) => {
          if (!response.ok) {
            notifyError()
            console.error("Failed to create project");
          }
          return response.json();
        })
        .then((data) => {
          notifySuccess()
          console.log("Project created successfully:", data);
        })
        .catch((error) => {
          notifyError();
          console.error("Error creating project", error);
        });
    }
  }, [project]);

  return (
    <>
      <section className="formSection">
        <h2>Legg til et nytt prosjekt</h2>
        <form onSubmit={handleSubmit} id="projectForm">
          <label htmlFor="projectName">Prosjekt navn*</label>
          <input
            type="text"
            name="projectName"
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Prosjekt navn"
            required
          />
          <label htmlFor="roles">Roller*</label>
          <small>skriv inn roller med komma (,) som seprator</small>
          <input
            type="text"
            name="roles"
            id="roles"
            value={roles.join(",")}
            onChange={(e) =>
              setRoles(handleCommaSeperatedInput(e.target.value))
            }
            placeholder="Fullstack, UI/UX"
            required
          />
          <label htmlFor="technologiesAndTools">Teknologier & verktøy*</label>
          <small>
            skriv inn Teknologier og verkøty med komma (,) som seprator
          </small>

          <input
            type="text"
            name="technologiesAndTools"
            id="technologiesAndTools"
            value={technologies.join(",")}
            onChange={(e) =>
              setTechnologies(handleCommaSeperatedInput(e.target.value))
            }
            placeholder="React, Node.js"
          />
          <label htmlFor="projectURL">URL*</label>
          <input
            type="text"
            name="projectURL"
            id="projectURL"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            placeholder="http://"
            required
          />
          <section className="micro-info-group">
            <div className="micro-info">
              <label htmlFor="publishedAt">Publiseringsdato*</label>
              <input
                type="date"
                name="publishedAt"
                id="publishedAt"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                required
              />
            </div>
            <div className="micro-info">
              <label htmlFor="status">Status*</label>
              <select
                name="status"
                id="status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                }}
                required
              >
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="micro-info">
              <label htmlFor="public">Tilgjenglig/Offentlig*</label>
              <input
                type="checkbox"
                name="public"
                id="public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            </div>
          </section>
          <label htmlFor="projectDesc">Beskrivelse*</label>
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
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"/>
    </>
  );
}
