import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { RegisterPage } from "@/features/auth/components/RegisterPage";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProblemsListPage } from "@/features/problems/components/ProblemsListPage";
import { ProblemDetailPage } from "@/features/problems/components/ProblemDetailPage";
import { AppHeader } from "@/components/layout/AppHeader";

function Dashboard() {
  const { user } = useAuth();
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">
        Welcome {user?.username ?? user?.email}
      </h1>
      <p className="text-muted-foreground mt-2">You are logged in.</p>
    </main>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-6">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <AppHeader />
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "problems", element: <ProblemsListPage /> },
      { path: "problems/:pid", element: <ProblemDetailPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
