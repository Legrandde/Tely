import { RouterProvider } from 'react-router-dom'
import './index.css'
import { Route } from "./routes/Routes";


function App() {
  

  return (
    <>
      <RouterProvider router={Route} />
    </>
  )
}

export default App
