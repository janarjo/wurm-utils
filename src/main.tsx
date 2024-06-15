import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import {
  createHashRouter,
  RouterProvider,
} from 'react-router-dom'
import Root from './components/Root.tsx'
import Highways from './components/Highways.tsx'
import Treasures from './components/Treasures.tsx'
import Bridges from './components/Bridges.tsx'
import Tunnels from './components/Tunnels.tsx'

const router = createHashRouter([
  { path: '/', element: <Root /> },
  { path: '/highways', element: <Highways /> },
  { path: '/treasures', element: <Treasures /> },
  { path: '/bridges', element: <Bridges /> },
  { path: '/tunnels', element: <Tunnels /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>,
)
