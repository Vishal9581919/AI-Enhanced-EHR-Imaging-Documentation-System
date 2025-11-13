import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Settings,
  LogOut,
  User,
  Search,
  Bell,
  TrendingUp,
  Users,
  Activity
} from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";

interface DoctorDashboardProps {
  onUploadNew: () => void;
}

const mockReports = [
  {
    id: "RPT-001",
    patientId: "MRN-45678",
    date: "2025-01-15",
    icdCode: "I67.4",
    summary: "Hypertensive encephalopathy with periventricular changes",
    status: "Completed"
  },
  {
    id: "RPT-002",
    patientId: "MRN-89012",
    date: "2025-01-14",
    icdCode: "G35",
    summary: "Multiple sclerosis - demyelinating lesions identified",
    status: "Completed"
  },
  {
    id: "RPT-003",
    patientId: "MRN-34567",
    date: "2025-01-13",
    icdCode: "C71.9",
    summary: "Brain neoplasm - requires further evaluation",
    status: "Pending Review"
  },
  {
    id: "RPT-004",
    patientId: "MRN-12345",
    date: "2025-01-12",
    icdCode: "I63.9",
    summary: "Cerebral infarction in left hemisphere",
    status: "Completed"
  }
];

const stats = [
  { label: "Total Reports", value: "156", icon: FileText, color: "#0077B6" },
  { label: "This Week", value: "24", icon: TrendingUp, color: "#00B4D8" },
  { label: "Active Patients", value: "89", icon: Users, color: "#0077B6" },
];

export function DoctorDashboard({ onUploadNew }: DoctorDashboardProps) {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'upload' | 'reports' | 'settings'>('dashboard');

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F5FAFF' }}>
      {/* Sidebar */}
      <div 
        className="w-64 border-r"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
              }}
            >
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span style={{ color: '#1B262C' }}>
              Medi<span style={{ color: '#0077B6' }}>AI</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {[
              { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
              { id: 'upload' as const, label: 'Upload', icon: Upload },
              { id: 'reports' as const, label: 'Reports', icon: FileText },
              { id: 'settings' as const, label: 'Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => {
                    setActiveSection(item.id);
                    if (item.id === 'upload') onUploadNew();
                  }}
                  className={`w-full justify-start h-11 ${isActive ? 'shadow-sm' : ''}`}
                  style={{
                    backgroundColor: isActive ? '#E0F2FE' : 'transparent',
                    color: isActive ? '#0077B6' : '#64748B'
                  }}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* User Profile at Bottom */}
        <div className="absolute bottom-0 w-64 p-6 border-t" style={{ borderColor: '#E0F2FE' }}>
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarFallback style={{ backgroundColor: '#0077B6', color: '#FFFFFF' }}>
                DS
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[0.875rem]" style={{ color: '#1B262C' }}>
                Dr. Sarah Smith
              </p>
              <p className="text-[0.75rem]" style={{ color: '#64748B' }}>
                City General Hospital
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            style={{ color: '#64748B' }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <div 
          className="border-b p-6"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ color: '#1B262C' }}>
                Welcome, Dr. Smith
              </h1>
              <p style={{ color: '#64748B' }}>
                Here's your practice overview
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#64748B' }} />
                <Input
                  placeholder="Search patients or reports..."
                  className="pl-10 w-80"
                  style={{ backgroundColor: '#F5FAFF', borderColor: '#E0F2FE' }}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="w-5 h-5" style={{ color: '#64748B' }} />
                <span 
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#F43F5E' }}
                />
              </Button>
              <Avatar>
                <AvatarFallback style={{ backgroundColor: '#0077B6', color: '#FFFFFF' }}>
                  DS
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[0.875rem] mb-1" style={{ color: '#64748B' }}>
                        {stat.label}
                      </p>
                      <p className="text-[2rem]" style={{ color: '#1B262C' }}>
                        {stat.value}
                      </p>
                    </div>
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: '#E0F2FE' }}
                    >
                      <Icon className="w-7 h-7" style={{ color: stat.color }} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Recent Reports Table */}
          <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ color: '#1B262C' }}>Recent Reports</h2>
              <Button
                onClick={onUploadNew}
                className="shadow-md"
                style={{ 
                  background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                  color: '#FFFFFF'
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>ICD-10 Code</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell style={{ color: '#1B262C' }}>{report.id}</TableCell>
                    <TableCell style={{ color: '#1B262C' }}>{report.patientId}</TableCell>
                    <TableCell style={{ color: '#64748B' }}>{report.date}</TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: '#E0F2FE', color: '#0077B6' }}>
                        {report.icdCode}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs" style={{ color: '#64748B' }}>
                      {report.summary}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        style={{ 
                          backgroundColor: report.status === 'Completed' ? '#D1FAE5' : '#FEF3C7',
                          color: report.status === 'Completed' ? '#065F46' : '#92400E'
                        }}
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        style={{ borderColor: '#E0F2FE', color: '#0077B6' }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
