   import { Hono } from "hono";
   import { cors } from "hono/cors";
   import { projectRepository, STATUS_CODES } from "./features/projects/projects.repository";
   import { z } from "zod";

   const app = new Hono();

   app.use("/*", cors());

   // const projects = [
   //    {
   //       "projectName": "What to See",
   //       "projectDesc": "Bygget en nettside for sammenligning av filmer i favorittlister, ønskelister og sjangere mellommellom brukere/venner, Implementerte funksjonalitet som lar brukere dele og sammenligne filmanbefalinger. Benyttet Sanity som headless CMS for enkel håndtering av filmdata  og brukerdata.",
   //       "roles": ["Fullstack", "UI/UX"],
   //       "technologies": ["HTML", "SCSS", "React","React Routing", "JavaScript", "Sanity"],
   //       "projectUrl": "https://github.com/KhalilMS3/WhatToSee_UIN24"
   //    },
   //    {
   //       "projectName": "BookSeekr",
   //       "projectDesc": "Utviklet en interaktiv nettside for bokssøk ved bruk av React og JavaScript. Integrerte en API for å hente bokdata og implementerte søkefunksjonalitet for å finne bøker basert på ulike kriterier og optimalisert brukeropplevelsen gjennom et responsivt design og god bruk av UI/UX-prinsipper.",
   //       "roles": ["Fullstack", "UI/UX"],
   //       "technologies": ["HTML", "SCSS", "React", "JavaScript", "API"],
   //       "projectUrl": "https://github.com/KhalilMS3/uin23ak4_booksearch_SFOUK"
   //    },
   //    {
   //       "projectName": "Tourly",
   //       "projectDesc": "Deltok i et team av studenter for å utvikle en prototype for en app som kobler lokale guider med turister. Var ansvarlig for backend-utvikling ved hjelp av Java, inkludert funksjonalitet for søking av turer basert på byer og matchingsalgoritmer hvor jeg fikk erfaring med samarbeid i team og bruk av agile metoder",
   //       "roles": ["Back-end"],
   //       "technologies": ["Java", "Agile Programming","Unit-testing", "OOP"],
   //       "projectUrl": "https://github.com/firas-mk/G-38"
   //    },
   //    {
   //       "projectName": "Roj Senter",
   //       "projectDesc": "Utførte et freelance-oppdrag for Damask Group, med ansvar for utvikling av digital medlemsregistrering for Roj Senter (trossamfunn). Fullstack-utvikling, inkludert UI/UX-design og backend for medlemsregistrering, utmeldingsskjema og engangskode-autentisering. Brukte Wix Studio (headless CMS) for nettsidebyggin og lagring og håndtering av personlig informasjon, samt JavaScript for automatiserte e-poster, OTP-autentisering via telefonnummer og validering av medlemsdata i inn- og utmeldingsskjemaene",
   //       "roles": ["Full-stack", "UI/UX"],
   //       "technologies": ["Wix Studio", "JavaScript", "Twilio (OTP-auth)", "Unit-testing"],
   //       "projectUrl": "https://rojsenter.no"
   //    }
   // ]

   // validating data using zod
   const projectSchema = z.object({
   projectName: z.string(),
   projectDesc: z.string(),
   roles: z.array(z.string()),
   technologies: z.array(z.string()),
   projectUrl: z.string(),
   publishedAt: z.string(),
   public: z.boolean(),
   status: z.string(),
   });

   // Get all projects
   app.get("/api/projects", async (c) => {
   const response = await projectRepository.list();
   if (!response.success) {
      return c.json({ success: false, error: response.error.message }, 500);
   }
   return c.json(response.data, 200);
   });

   // GET a single project by ID
   app.get("/api/projects/:id", async (c) => {
   const id = Number(c.req.param("id"));
   const response = await projectRepository.getById(id);
   if (!response.success) {
      return c.json({ success: false, error: response.error.message }, 404);
   }
   return c.json(response.data, 200);
   });

app.get("/api/projects/role/:roleName", async (c) => {
   const roleName = c.req.param("roleName")

   
   if (!roleName) {
      return c.json({ success: false, error: "Role name must be provided" }, 400)
   }
   const response = await projectRepository.getProjectsByRole(roleName)

   if (!response.success) {
      return c.json({ success: false, error: response.error.message }, 500)
   }

      return c.json({ success: true, data: response.data}, 200)
   

   })

   // Add a project
   app.post("/api/projects", async (c) => {
   try {
      const body = await c.req.json();
      console.log("Received project data:", body); // Log for debugging

      // Validere dataene med Zod
      const parsedProject = projectSchema.parse(body);

      let roleIds = body.roleIds;

      if (
         !Array.isArray(roleIds) ||
         !roleIds.every((id) => typeof id === "number")
      ) {
         roleIds = roleIds.map((id: any) => Number(id)); // Konverter til `number` hvis nødvendig
      }

      // Call create method from projectRepository
      const response = await projectRepository.create(parsedProject, roleIds);
      if (!response.success) {
         return c.json({ success: false, error: response.error.message }, 500);
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

   // Update a project
  app.patch("/api/projects/:id", async (c) => {
   const id = Number(c.req.param("id"));

   if (isNaN(id)) {
      return c.json({ success: false, error: "Invalid project ID" }, 400);
   }

   const project = await c.req.json();

   if (!project.roles || !Array.isArray(project.roles)) {
      return c.json({ success: false, error: "roles must be provided as an array" }, 400);
   }

   const response = await projectRepository.update(id, project, project.roleIds);

   if (!response.success) {
      return c.json({ success: false, error: response.error.message }, 500);
   }

   return c.json(response.data, 200);
});


  // Delete a project
app.delete("/api/projects/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const response = await projectRepository.delete(id);
  
  if (!response.success) {
    if (response.error.code === `${STATUS_CODES.NOT_FOUND}`) {

      return c.json({ success: false, error: response.error.message }, 404);
    }
    return c.json({ success: false, error: response.error.message }, 500);
  }

  return c.json({ success: true, message: "Project deleted successfully" }, 200);
});


   export default app;
