import './index.css'
import Header from './Components/Header'
import Projects from './Components/Projects'
import AddProjectForm from './Components/AddProjectForm'
import Footer from './Components/Footer'

function App() {
  
   return (
      <>
         <Header />
         <main>
            <Projects/>
            <AddProjectForm/>
         </main>
         <Footer/>
      </>
   )
   
}

export default App
