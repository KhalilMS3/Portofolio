import { readFile } from 'node:fs/promises'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use("/*", cors())

const projects = [
   {
      "projectName": "What to See",
      "projectDesc": "Bygget en nettside for sammenligning av filmer i favorittlister, ønskelister og sjangere mellommellom brukere/venner, Implementerte funksjonalitet som lar brukere dele og sammenligne filmanbefalinger. Benyttet Sanity som headless CMS for enkel håndtering av filmdata  og brukerdata.",
      "roles": ["Fullstack", "UI/UX"],
      "technologies": ["HTML", "SCSS", "React","React Routing", "JavaScript", "Sanity"], 
      "projectUrl": "https://github.com/KhalilMS3/WhatToSee_UIN24"
   },
   {
      "projectName": "BookSeekr",
      "projectDesc": "Utviklet en interaktiv nettside for bokssøk ved bruk av React og JavaScript. Integrerte en API for å hente bokdata og implementerte søkefunksjonalitet for å finne bøker basert på ulike kriterier og optimalisert brukeropplevelsen gjennom et responsivt design og god bruk av UI/UX-prinsipper.",
      "roles": ["Fullstack", "UI/UX"],
      "technologies": ["HTML", "SCSS", "React", "JavaScript", "API"], 
      "projectUrl": "https://github.com/KhalilMS3/uin23ak4_booksearch_SFOUK"
   },
   {
      "projectName": "Tourly",
      "projectDesc": "Deltok i et team av studenter for å utvikle en prototype for en app som kobler lokale guider med turister. Var ansvarlig for backend-utvikling ved hjelp av Java, inkludert funksjonalitet for søking av turer basert på byer og matchingsalgoritmer hvor jeg fikk erfaring med samarbeid i team og bruk av agile metoder",
      "roles": ["Back-end"],
      "technologies": ["Java", "Agile Programming","Unit-testing", "OOP"], 
      "projectUrl": "https://github.com/firas-mk/G-38"
   },
   {
      "projectName": "Roj Senter",
      "projectDesc": "Utførte et freelance-oppdrag for Damask Group, med ansvar for utvikling av digital medlemsregistrering for Roj Senter (trossamfunn). Fullstack-utvikling, inkludert UI/UX-design og backend for medlemsregistrering, utmeldingsskjema og engangskode-autentisering. Brukte Wix Studio (headless CMS) for nettsidebyggin og lagring og håndtering av personlig informasjon, samt JavaScript for automatiserte e-poster, OTP-autentisering via telefonnummer og validering av medlemsdata i inn- og utmeldingsskjemaene",
      "roles": ["Full-stack", "UI/UX"],
      "technologies": ["Wix Studio", "JavaScript", "Twilio (OTP-auth)", "Unit-testing"], 
      "projectUrl": "https://rojsenter.no"
   }
]

app.get('/projects',  (c) => {
   return c.json(projects)
})

export default app

