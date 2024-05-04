import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import Root from './components/Root.tsx'
import Highways from './components/Highways.tsx'
import Treasures from './components/Treasures.tsx'


const router = createBrowserRouter([
  { path: '/', element: <Root /> },
  { path: '/highways', element: <Highways /> },
  { path: '/treasures', element: <Treasures /> },
], { basename: '/wurm-utils' })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>,
)
