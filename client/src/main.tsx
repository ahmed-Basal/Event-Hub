import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router'
import { router } from './App/Router/Router'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import lammaMubarmegeen from './theme/theme'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ErrorBoundary } from './shared'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 600) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={lammaMubarmegeen}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools />
            <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  </StrictMode>,
)
