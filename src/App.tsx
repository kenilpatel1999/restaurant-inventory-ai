import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';

const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Inventory = lazy(() => import('@/pages/Inventory').then((m) => ({ default: m.Inventory })));
const Predictions = lazy(() => import('@/pages/Predictions').then((m) => ({ default: m.Predictions })));
const Suppliers = lazy(() => import('@/pages/Suppliers').then((m) => ({ default: m.Suppliers })));
const Contracts = lazy(() => import('@/pages/Contracts').then((m) => ({ default: m.Contracts })));
const Orders = lazy(() => import('@/pages/Orders').then((m) => ({ default: m.Orders })));
const Analytics = lazy(() => import('@/pages/Analytics').then((m) => ({ default: m.Analytics })));
const Assistant = lazy(() => import('@/pages/Assistant').then((m) => ({ default: m.Assistant })));
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-light dark:text-muted-dark">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
            <Route path="/inventory" element={<Suspense fallback={<PageLoader />}><Inventory /></Suspense>} />
            <Route path="/predictions" element={<Suspense fallback={<PageLoader />}><Predictions /></Suspense>} />
            <Route path="/suppliers" element={<Suspense fallback={<PageLoader />}><Suppliers /></Suspense>} />
            <Route path="/contracts" element={<Suspense fallback={<PageLoader />}><Contracts /></Suspense>} />
            <Route path="/orders" element={<Suspense fallback={<PageLoader />}><Orders /></Suspense>} />
            <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
            <Route path="/assistant" element={<Suspense fallback={<PageLoader />}><Assistant /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
