import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import Root from './Root.tsx'
import Highways from './Highways.tsx'


const router = createBrowserRouter([
  { path: '/', element: <Root /> },
  { path: '/highways', element: <Highways /> },
], { basename: '/wurm-utils' })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>,
)
