import { Hono } from "hono";
import { cors } from "hono/cors";
import { date, z } from "zod";
import { projectsService } from "./features/projects/projects.service";
import { Result, Project, projectSchema } from "./types";

const app = new Hono();

app.use("/*", cors());

// Opprett et nytt prosjekt
app.post("/api/projects", async (c) => {
try {
   const body = await c.req.json();
   console.log("Received project data:", body);

   // Validere prosjektdata med Zod
   const response = await projectsService.createProject(body);

   if (!response.success) {
      return c.json({ success: false, error: response.error.message });
   }
   return c.json(response.data, 201);
} catch (error) {
   console.error("Error creating project:", error);
   if (error instanceof z.ZodError) {
      return c.json({ success: false, error: error.errors }, 400);
   }
   return c.json({ success: false, error: "Failed to create project" }, 500);
}
});

// Hent alle prosjekter, med valgfri filtrering på rolle
app.get("/api/projects", async (c) => {
const role = c.req.query("role");
const response = await projectsService.listProjects(role);
if (!response.success) {
   return c.json({ success: false, error: response.error.message }, 500);
}
return c.json(response.data, 200);
});

// Hent et prosjekt etter ID
app.get("/api/projects/:id", async (c) => {
const id = Number(c.req.param("id"));
const response = await projectsService.getProjectById(id);
if (!response.success) {
   return c.json({ success: false, error: response.error.message });
}
return c.json(response.data, 200);
});

// Update a project
app.patch("/api/projects/:id", async (c) => {
try {
   const id = Number(c.req.param("id"));
   const body = await c.req.json();
   console.log("Received update data:", body);

   // Validation with Zod by projectsService
   const response = await projectsService.updateProject(id, body);

   if (!response.success) {
      return c.json({ success: false, error: response.error.message });
   }
   return c.json(response.data, 200);
} catch (error) {
   console.error("Error updating project:", error);
   if (error instanceof z.ZodError) {
      return c.json({ success: false, error: error.errors }, 400);
   }
   return c.json({ success: false, error: "Failed to update project" }, 500);
}
});

// Delete a project
app.delete("/api/projects/:id", async (c) => {
const id = Number(c.req.param("id"));
const response = await projectsService.deleteProject(id);
if (!response.success) {
   if (response.error.code === "404") {
      return c.json({ success: false, error: response.error.message }, 404);
   }
   return c.json({ success: false, error: response.error.message }, 500);
}
return c.json(
   { success: true, message: "Project deleted successfully" },
   200
);
});

export default app;
