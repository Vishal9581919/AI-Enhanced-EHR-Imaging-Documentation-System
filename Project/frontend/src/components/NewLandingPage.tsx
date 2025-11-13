import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Brain, FileText, Code, Shield, Upload, Cpu, FileCheck, ArrowRight, Activity, Zap, Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";

interface NewLandingPageProps {
  onGetStarted: () => void;
  onLogin?: () => void;
  currentUser?: string;
}

export function NewLandingPage({ onGetStarted, onLogin, currentUser }: NewLandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: FileText,
      title: "EHR Summarization",
      description: "AI converts raw clinical notes into concise, structured summaries."
    },
    {
      icon: Brain,
      title: "Medical Image Analysis",
      description: "Works with MRI, X-ray, CT, and histopathology images."
    },
    {
      icon: Code,
      title: "ICD-10 Auto Coding",
      description: "Assigns the correct ICD-10 diagnostic code automatically."
    },
    {
      icon: Shield,
      title: "Data Privacy",
      description: "HIPAA-compliant system ensuring complete data confidentiality."
    }
  ];

  const steps = [
    { number: "1", title: "Upload", description: "Medical images or EHR records" },
    { number: "2", title: "AI Processing", description: "Advanced analysis in seconds" },
    { number: "3", title: "Get Enhanced Report", description: "Structured summaries & codes" }
  ];

  return (
    <div style={{ backgroundColor: '#F5FAFF' }}>
      {/* Navbar */}
      <nav className="border-b" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                }}
              >
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-[1.5rem]" style={{ color: '#1B262C' }}>
                Medi<span style={{ color: '#0077B6' }}>AI</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                <div className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#E0F2FE' }}>
                  <span style={{ color: '#0077B6' }}>Dr. {currentUser}</span>
                </div>
              ) : (
                <Button 
                  variant="ghost"
                  onClick={onLogin}
                  style={{ color: '#0077B6' }}
                >
                  Login
                </Button>
              )}
              <Button
                onClick={onGetStarted}
                className="shadow-lg hover:shadow-xl transition-shadow"
                style={{ 
                  background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                  color: '#FFFFFF'
                }}
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: '#0077B6' }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: '#0077B6' }} />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t" style={{ borderColor: '#E0F2FE' }}>
              <div className="flex flex-col gap-3">
                {!currentUser && (
                  <Button variant="ghost" onClick={onLogin} style={{ color: '#0077B6' }}>Login</Button>
                )}
                {currentUser && (
                  <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: '#E0F2FE', color: '#0077B6' }}>
                    Dr. {currentUser}
                  </div>
                )}
                <Button
                  onClick={onGetStarted}
                  style={{ 
                    background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 
                className="text-[3rem] mb-6 leading-tight"
                style={{ color: '#1B262C' }}
              >
                AI-Powered Clinical Insight Generator
              </h1>
              <p 
                className="text-[1.25rem] mb-8 leading-relaxed"
                style={{ color: '#4A5568' }}
              >
                Upload any medical image or EHR record to generate enhanced visuals, 
                structured summaries, and ICD-10 codes in seconds.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="shadow-lg hover:shadow-xl transition-all h-12 px-8"
                  style={{ 
                    background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  Try Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8"
                  style={{ 
                    borderColor: '#0077B6',
                    color: '#0077B6'
                  }}
                >
                  Learn More
                </Button>
              </div>
            </motion.div>

            {/* Right Side - Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758202292826-c40e172eed1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwQUklMjB0ZWNobm9sb2d5JTIwaGVhbHRoY2FyZXxlbnwxfHx8fDE3NjIyNjY2ODN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="AI Medical Analysis"
                  className="w-full h-[400px] object-cover"
                />
                {/* Animated pulse overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,119,182,0.1) 0%, rgba(0,180,216,0.1) 100%)'
                  }}
                />
              </div>
              
              {/* Floating card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 p-4 rounded-xl shadow-xl"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#E0F2FE' }}
                  >
                    <Zap className="w-6 h-6" style={{ color: '#0077B6' }} />
                  </div>
                  <div>
                    <p className="text-[0.875rem]" style={{ color: '#64748B' }}>
                      Processing Speed
                    </p>
                    <p style={{ color: '#0077B6' }}>
                      &lt;3 seconds
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[2.5rem] mb-4" style={{ color: '#1B262C' }}>
              Our Features
            </h2>
            <p className="text-[1.125rem]" style={{ color: '#4A5568' }}>
              Comprehensive AI-powered tools for modern healthcare
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card 
                    className="p-6 h-full hover:shadow-lg transition-shadow"
                    style={{ borderColor: '#E0F2FE' }}
                  >
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: '#E0F2FE' }}
                    >
                      <Icon className="w-7 h-7" style={{ color: '#0077B6' }} />
                    </div>
                    <h3 className="mb-3" style={{ color: '#1B262C' }}>
                      {feature.title}
                    </h3>
                    <p className="text-[0.9375rem]" style={{ color: '#64748B' }}>
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[2.5rem] mb-4" style={{ color: '#1B262C' }}>
              How It Works
            </h2>
            <p className="text-[1.125rem]" style={{ color: '#4A5568' }}>
              Three simple steps to get your AI-powered diagnostic report
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card 
                  className="p-8 text-center h-full"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}
                >
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-[1.5rem]"
                    style={{ 
                      background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                      color: '#FFFFFF'
                    }}
                  >
                    {step.number}
                  </div>
                  <h3 className="mb-2" style={{ color: '#1B262C' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: '#64748B' }}>
                    {step.description}
                  </p>
                </Card>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8" style={{ color: '#00B4D8' }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[2rem] mb-4" style={{ color: '#1B262C' }}>
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-[1.125rem]" style={{ color: '#4A5568' }}>
              Leading hospitals and clinics rely on MediAI
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            {[1, 2, 3, 4].map((item) => (
              <div 
                key={item}
                className="h-20 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#F5FAFF', border: '1px solid #E0F2FE' }}
              >
                <Activity className="w-8 h-8" style={{ color: '#0077B6' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                }}
              >
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span style={{ color: '#1B262C' }}>
                Medi<span style={{ color: '#0077B6' }}>AI</span>
              </span>
            </div>

            <div className="flex gap-8">
              <button className="hover:opacity-70 transition-opacity" style={{ color: '#64748B' }}>
                Privacy Policy
              </button>
              <button className="hover:opacity-70 transition-opacity" style={{ color: '#64748B' }}>
                Terms
              </button>
              <button className="hover:opacity-70 transition-opacity" style={{ color: '#64748B' }}>
                Contact
              </button>
              <button className="hover:opacity-70 transition-opacity" style={{ color: '#64748B' }}>
                GitHub
              </button>
            </div>
          </div>

          <div className="text-center mt-8 pt-8 border-t" style={{ borderColor: '#E0F2FE' }}>
            <p style={{ color: '#64748B' }}>
              © 2025 MediAI — AI-Driven Healthcare Diagnostics
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}