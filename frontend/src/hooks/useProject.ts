import { useEffect, useState } from "react";
import { Project } from "../types/projects.types";
import { API_BASE } from "../config/urls";

export const useProject = (role?: string) => {
   
   const [projects, setProjects] = useState<Project[]>([]);
   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string | unknown>(null)
const fetchProjectsFromServer = async () => {
         setLoading(true)
         try {
            // creating a dynamic endpoint to handle filtering 
            let endpoint = `${API_BASE}/projects`
            if (role) {
               endpoint += `?role=${encodeURIComponent(role)}`
            }
            const response = await fetch(endpoint);
            const data = await response.json();
            if (response.ok) {
               setError(null)
               setProjects(data);
               console.log("Data from Server:", data);
            } else {
               setError("Faild fetching data from server")
            }
         } catch (error) {
            setError(error)
         } finally {
            setLoading(false)
         }
      }
   useEffect(() => {
      
      fetchProjectsFromServer()
   }, [role])

   return {projects, loading, error}
}
