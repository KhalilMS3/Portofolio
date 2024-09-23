import './index.css'
import Header from './Components/Header'
import Projects from './Components/Projects'
import AddProjectForm from './Components/AddProjectForm'

function App() {
  
   return (
      <>
         <Header />
         <main>
            <Projects/>
            <AddProjectForm/>
         </main>
      </>
   )
   
}

export default App
