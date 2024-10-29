import Footer from './Footer'
import Header from './Header'
import { PropsWithChildren } from 'react';
export default function Layout(props: PropsWithChildren) {
   const {children}  = props
   return (
     <>
     <Header />
         <main>
         {children}      
         </main>   
      <Footer />
     </>
  )
}
