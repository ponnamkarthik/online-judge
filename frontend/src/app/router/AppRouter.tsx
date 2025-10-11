import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { RegisterPage } from "@/features/auth/components/RegisterPage";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAuth } from "@/features/auth/hooks/useAuth";

function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="min-h-dvh flex flex-col">
      <AppHeader />
      <main className="p-6">
        <h1 className="text-2xl font-bold">
          Welcome {user?.username ?? user?.email}
        </h1>
        <p className="text-muted-foreground mt-2">You are logged in.</p>
      </main>
    </div>
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
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
