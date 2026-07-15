import './styles/index.css';
// Supports weights 100-900
import '@fontsource-variable/roboto';

import { createRouter, RouterProvider } from '@tanstack/react-router';
import esriId from '@arcgis/core/identity/IdentityManager';
import { Analytics } from '@vercel/analytics/react';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Completely disable the ArcGIS sign-in popup globally
esriId.getCredential = () => Promise.reject('ArcGIS Sign-in disabled');

// Create a new router instance
const router = createRouter({ routeTree, basepath: import.meta.env.BASE_URL });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No root element found');
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
      <Analytics />
    </StrictMode>,
  );
}
