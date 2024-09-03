import { serve } from "@hono/node-server"; //? To start a server
import { Hono } from "hono"; //? Hono tools
import { cors } from "hono/cors"; //? To let frontend to communicate with backend
import { serveStatic } from "@hono/node-server/serve-static"; 
import {readFile} from 'node:fs/promises'

const app = new Hono()

app.use("/*", cors())

app.use("/statics/*", serveStatic({root: "./"}))

//? Get a request form ../localhost:3999/json
//? normally "headers" and other data

app.get('/projects', async (c) => {
   const data = await readFile("./projects.json", "utf-8")
   return c.json(JSON.parse(data))
})

const port = 3999

console.log("Server is running ")

serve({
   fetch: app.fetch,
   port
})