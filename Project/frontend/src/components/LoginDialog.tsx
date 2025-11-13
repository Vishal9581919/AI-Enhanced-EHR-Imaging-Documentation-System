import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Activity, Lock, User } from "lucide-react";
import { useState } from "react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (username: string) => void;
}

export function LoginDialog({ open, onOpenChange, onLogin }: LoginDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
      onOpenChange(false);
      setUsername("");
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
              }}
            >
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <DialogTitle style={{ color: '#1B262C' }}>
                Login
              </DialogTitle>
              <DialogDescription>
                Access your analysis history
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username" style={{ color: '#1B262C' }}>
              Username or Email
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748B' }} />
              <Input
                id="username"
                type="text"
                placeholder="doctor@hospital.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                style={{ borderColor: '#E0F2FE' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" style={{ color: '#1B262C' }}>
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748B' }} />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                style={{ borderColor: '#E0F2FE' }}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full shadow-md hover:shadow-lg transition-shadow"
            style={{ 
              background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
              color: '#FFFFFF'
            }}
          >
            Sign In
          </Button>

          <p className="text-center text-[0.875rem]" style={{ color: '#64748B' }}>
            Demo: Use any username to login
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}