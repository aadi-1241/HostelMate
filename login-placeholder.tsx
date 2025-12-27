// This is a placeholder since Auth is handled by Replit Auth Blueprint
// The backend will redirect here or to /api/login
// We just need a landing page for unauthenticated users

import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function LoginPlaceholder() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">HostelMate</h1>
          <p className="text-muted-foreground text-sm">
            Enterprise Management System
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-border shadow-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Welcome Back</h2>
            <p className="text-xs text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </div>
          
          <Button className="w-full py-6 text-base shadow-lg shadow-primary/20" onClick={handleLogin}>
            Sign In with Replit
          </Button>
        </div>
      </div>
    </div>
  );
}
