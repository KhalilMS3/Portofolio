import { serve } from "@hono/node-server"; //? To start a server
import { Hono } from "hono"; //? Hono tools
import { cors } from "hono/cors"; //? To let frontend to communicate with backend
import { serveStatic } from "@hono/node-server/serve-static"; 
import {readFile, writeFile} from 'node:fs/promises'
import { Project } from "./types";
const app = new Hono()

app.use("/*", cors())

app.use("/statics/*", serveStatic({root: "./"}))


const getProjects = async () => {
      const data = await readFile("./projects.json", "utf-8")
      const parsedData = JSON.parse(data)
      return parsedData
}

const updateProjects = async (projects: Project) => {
   await writeFile("./projects.json", JSON.stringify(projects, null, 2))
   
}
//? Get a request form http://localhost:3999
//? normally "headers" and other data

// getting data from server
app.get('/', async (c) => {
   const projects = await getProjects()
   const data = c.json(projects)
   return data

})

app.post("/add", async (c) => {
   const newProject = await c.req.json<Project>()
   console.log(newProject)

   const projects = await getProjects()
   projects.push(newProject)

   await updateProjects(projects)
   return c.json(projects)
})

const port = 3999

console.log(`Server is running on port ${port}`)

serve({
   fetch: app.fetch,
   port
})