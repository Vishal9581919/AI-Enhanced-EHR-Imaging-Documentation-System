import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Activity } from "lucide-react";
import { useState } from "react";

interface LandingPageProps {
  onLogin: (userType: 'doctor' | 'guest') => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleDoctorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin('doctor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8FAFB' }}>
      <div className="w-full max-w-4xl">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0E6BA8' }}>
              <Activity className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-[2rem]" style={{ color: '#1E2A35' }}>
              AI-Enhanced EHR & MRI Assistant
            </h1>
          </div>
          <p className="text-[1.125rem]" style={{ color: '#64748B' }}>
            Intelligent medical record and imaging summarization platform
          </p>
        </div>

        {/* Login Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Doctor Login Card */}
          <Card className="p-8 border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
            <h2 className="mb-6 text-center" style={{ color: '#0E6BA8' }}>
              Doctor Login
            </h2>
            <form onSubmit={handleDoctorLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" style={{ color: '#1E2A35' }}>
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11"
                  style={{ backgroundColor: '#F8FAFB', borderColor: '#CBD5E1' }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: '#1E2A35' }}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  style={{ backgroundColor: '#F8FAFB', borderColor: '#CBD5E1' }}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                style={{ backgroundColor: '#0E6BA8', color: '#FFFFFF' }}
              >
                Secure Login
              </Button>
            </form>
            <p className="mt-4 text-center text-[0.875rem]" style={{ color: '#94A3B8' }}>
              🔒 HIPAA-compliant authentication
            </p>
          </Card>

          {/* Guest Demo Card */}
          <Card className="p-8 border-2 flex flex-col justify-center items-center" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
            <h2 className="mb-4 text-center" style={{ color: '#007B83' }}>
              Guest Demo Access
            </h2>
            <p className="text-center mb-8" style={{ color: '#64748B' }}>
              Explore the platform features with sample data. No login required.
            </p>
            <Button
              onClick={() => onLogin('guest')}
              variant="outline"
              className="w-full h-11 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              style={{ 
                borderColor: '#007B83', 
                color: '#007B83',
                backgroundColor: '#FFFFFF'
              }}
            >
              Try Demo Mode
            </Button>
            <p className="mt-4 text-center text-[0.875rem]" style={{ color: '#94A3B8' }}>
              Limited functionality for demonstration
            </p>
          </Card>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
          <p className="text-[0.9375rem]" style={{ color: '#92400E' }}>
            ⚠️ For clinical decision support only. Not a diagnostic tool.
          </p>
        </div>
      </div>
    </div>
  );
}
