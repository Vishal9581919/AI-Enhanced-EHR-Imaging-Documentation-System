import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { patientAPI, summaryAPI, reportAPI } from "../services/api";
import type { ReportRecord, Patient as BackendPatient } from "../services/api";
import { toast } from "sonner";
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
  Search,
  Bell,
  TrendingUp,
  Users,
  Activity,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
} from "lucide-react";

interface DashboardPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  phone: string;
  email: string;
  address: string;
  lastVisit: string;
  condition: string;
  status: "Active" | "Pending" | "Completed";
}

interface DashboardReport {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  createdAt: Date;
  icdCode: string;
  summary: string;
  status: "Completed" | "Pending Review";
}

interface AnalysisResult {
  enhancedImage: string;
  clinicalSummary: string;
  icdCodes: Array<{ code: string; description: string; confidence: number }>;
}

const parseExtra = (extra: any): Record<string, any> => {
  if (!extra) return {};
  if (typeof extra === "string") {
    try {
      return JSON.parse(extra);
    } catch {
      return {};
    }
  }
  if (typeof extra === "object") {
    return extra as Record<string, any>;
  }
  return {};
};

const mapBackendPatientToDashboard = (patient: BackendPatient): DashboardPatient => {
  const extra = parseExtra(patient.extra);
  const name = patient.name || `Patient ${patient.patient_uid}`;
  return {
    id: patient.patient_uid,
    name,
    age: typeof patient.age === "number" ? patient.age : extra.age ?? 0,
    gender: patient.gender || extra.gender || "Unknown",
    mrn: patient.patient_uid,
    phone: extra.phone || "—",
    email: extra.email || "—",
    address: extra.address || "—",
    lastVisit: extra.lastVisit || extra.last_visit || "—",
    condition: patient.icd10_description || extra.condition || "Awaiting diagnosis",
    status: patient.icd10_code ? "Completed" : (extra.status as DashboardPatient["status"]) || "Active",
  };
};

const mapReportRecordToDashboard = (record: ReportRecord): DashboardReport => {
  const createdAt = record.created_at ? new Date(record.created_at) : new Date();
  const reportData = record.report_data || {};
  return {
    id: record.report_uid,
    patientId: record.patient_uid,
    patientName:
      record.patient_name ||
      reportData.patientName ||
      reportData.patient_name ||
      record.patient_uid,
    date: createdAt.toLocaleDateString(),
    createdAt,
    icdCode: record.icd10_code || reportData.icdCode || "N/A",
    summary:
      record.clinical_summary ||
      reportData.clinicalSummary ||
      "Detailed summary available in report view.",
    status:
      record.icd10_code && record.icd10_code !== "N/A" ? "Completed" : "Pending Review",
  };
};

type Section = "dashboard" | "patients" | "mri-analysis" | "reports" | "settings";

interface MedicalDashboardProps {
  onLogout?: () => void;
  currentUser?: string;
}

export function MedicalDashboard({ onLogout, currentUser = "Sarah Smith" }: MedicalDashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [selectedPatient, setSelectedPatient] = useState<DashboardPatient | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<DashboardPatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [reports, setReports] = useState<DashboardReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (activeSection === 'patients') {
      loadPatients();
    }
  }, [activeSection]);

  useEffect(() => {
    if (currentUser) {
      loadReports();
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeSection === "reports" || activeSection === "dashboard") {
      loadReports();
    }
  }, [activeSection]);

  const loadPatients = async () => {
    setLoadingPatients(true);
    try {
      const fetchedPatients = await patientAPI.getAll();
      setPatients(fetchedPatients.map(mapBackendPatientToDashboard));
    } catch (error: any) {
      toast.error(`Failed to load patients: ${error.message}`);
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const fetchedReports = await reportAPI.list({ doctor_name: currentUser, limit: 200 });
      setReports(fetchedReports.map(mapReportRecordToDashboard));
    } catch (error: any) {
      console.error("Failed to load reports", error);
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFileName(file.name);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setUploadedImage(preview);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateReport = async () => {
    if (!clinicalNotes.trim() && !uploadedImage) {
      toast.error('Please provide clinical notes or upload an image');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Prepare images array
      const images: string[] = [];
      if (uploadedImage) {
        const base64 = uploadedImage.includes(',') ? uploadedImage.split(',')[1] : uploadedImage;
        images.push(base64);
      }

      const clinicalText = clinicalNotes.trim() || (uploadedImage ? 'Medical image analysis requested' : '');

      // Call backend API
      setProgress(50);
      const response = await summaryAPI.generate({
        clinical_text: clinicalText,
        images: images.length > 0 ? images : undefined,
        patient_uid: selectedPatient?.mrn,
        use_hf: true,
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Process API response
      const icdCodes = response.icd_suggestions?.map((s: any) => ({
        code: s.code,
        description: s.desc,
        confidence: s.score || 75,
      })) || [];

      setTimeout(() => {
        setIsGenerating(false);
        setAnalysisResult({
          enhancedImage: uploadedImage,
          clinicalSummary: response.model_output || `Analysis completed for ${selectedPatient?.name || 'patient'}`,
          icdCodes: icdCodes.length > 0 ? icdCodes : [
            { code: "N/A", description: "No ICD-10 code suggested", confidence: 0 },
          ],
        });
        loadReports();
        setActiveSection("reports");
        toast.success('Analysis complete!');
      }, 300);
    } catch (error: any) {
      setIsGenerating(false);
      setProgress(0);
      toast.error(`Failed to generate report: ${error.message || 'Unknown error'}`);
      console.error('Error generating report:', error);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient as any).condition?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const reportsThisWeek = reports.filter((report) => {
    const now = new Date();
    const diff = now.getTime() - report.createdAt.getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const pendingReviews = reports.filter((report) => report.status === "Pending Review").length;

  const dashboardStats = [
    { label: "Total Patients", value: patients.length.toString(), icon: Users, color: "#0077B6" },
    { label: "Reports This Week", value: reportsThisWeek.toString(), icon: TrendingUp, color: "#00B4D8" },
    { label: "Pending Reviews", value: pendingReviews.toString(), icon: FileText, color: "#0077B6" },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F5FAFF" }}>
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
        <div className="p-6 flex-1">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
              }}
            >
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span style={{ color: "#1B262C" }}>
              Medi<span style={{ color: "#0077B6" }}>AI</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {[
              { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
              { id: "patients" as const, label: "Patients", icon: Users },
              { id: "mri-analysis" as const, label: "MRI Analysis", icon: Upload },
              { id: "reports" as const, label: "Reports", icon: FileText },
              { id: "settings" as const, label: "Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full justify-start h-11 ${isActive ? "shadow-sm" : ""}`}
                  style={{
                    backgroundColor: isActive ? "#E0F2FE" : "transparent",
                    color: isActive ? "#0077B6" : "#64748B",
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
        <div className="p-6 border-t" style={{ borderColor: "#E0F2FE" }}>
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarFallback style={{ backgroundColor: "#0077B6", color: "#FFFFFF" }}>
                {currentUser
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[0.875rem]" style={{ color: "#1B262C" }}>
                Dr. {currentUser}
              </p>
              <p className="text-[0.75rem]" style={{ color: "#64748B" }}>
                City General Hospital
              </p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start" style={{ color: "#64748B" }} onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ color: "#1B262C" }}>
                {activeSection === "dashboard" && "Welcome, Dr. Smith"}
                {activeSection === "patients" && "Patient Management"}
                {activeSection === "mri-analysis" && "MRI Analysis & Upload"}
                {activeSection === "reports" && analysisResult ? "Analysis Results" : "Medical Reports"}
                {activeSection === "settings" && "Settings"}
              </h1>
              <p style={{ color: "#64748B" }}>
                {activeSection === "dashboard" && "Here's your practice overview"}
                {activeSection === "patients" && "View and manage patient records"}
                {activeSection === "mri-analysis" && "Upload clinical data and medical images"}
                {activeSection === "reports" && analysisResult ? "AI-generated diagnostic summary" : "View all diagnostic reports"}
                {activeSection === "settings" && "Manage your preferences"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" style={{ color: "#64748B" }} />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ backgroundColor: "#F43F5E" }} />
              </Button>
              <Avatar>
                <AvatarFallback style={{ backgroundColor: "#0077B6", color: "#FFFFFF" }}>
                  {currentUser
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Dashboard Section */}
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  {dashboardStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <Card key={index} className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[0.875rem] mb-1" style={{ color: "#64748B" }}>
                              {stat.label}
                            </p>
                            <p className="text-[2rem]" style={{ color: "#1B262C" }}>
                              {stat.value}
                            </p>
                          </div>
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E0F2FE" }}>
                            <Icon className="w-7 h-7" style={{ color: stat.color }} />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Recent Patients */}
                  <Card className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 style={{ color: "#1B262C" }}>Recent Patients</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveSection("patients")}
                        style={{ color: "#0077B6" }}
                      >
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {patients.length === 0 ? (
                        <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                          No patients found. Add a new patient to get started.
                        </p>
                      ) : (
                        patients.slice(0, 4).map((patient) => (
                          <div
                            key={patient.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5FAFF] cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setActiveSection("patients");
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback style={{ backgroundColor: "#E0F2FE", color: "#0077B6" }}>
                                  {patient.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p style={{ color: "#1B262C" }}>{patient.name}</p>
                                <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                                  {patient.mrn}
                                </p>
                              </div>
                            </div>
                            <Badge
                              style={{
                                backgroundColor: patient.status === "Completed" ? "#D1FAE5" : "#FEF3C7",
                                color: patient.status === "Completed" ? "#065F46" : "#92400E",
                              }}
                            >
                              {patient.status}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                    <h2 className="mb-4" style={{ color: "#1B262C" }}>
                      Quick Actions
                    </h2>
                    <div className="space-y-3">
                      <Button
                        onClick={() => setActiveSection("mri-analysis")}
                        className="w-full justify-start h-14"
                        style={{
                          background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
                          color: "#FFFFFF",
                        }}
                      >
                        <Upload className="w-5 h-5 mr-3" />
                        Upload MRI Image
                      </Button>
                      <Button
                        onClick={() => setActiveSection("patients")}
                        variant="outline"
                        className="w-full justify-start h-14"
                        style={{ borderColor: "#E0F2FE", color: "#0077B6" }}
                      >
                        <Users className="w-5 h-5 mr-3" />
                        Add New Patient
                      </Button>
                      <Button
                        onClick={() => setActiveSection("reports")}
                        variant="outline"
                        className="w-full justify-start h-14"
                        style={{ borderColor: "#E0F2FE", color: "#0077B6" }}
                      >
                        <FileText className="w-5 h-5 mr-3" />
                        View All Reports
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Patients Section */}
            {activeSection === "patients" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                    <Input
                      placeholder="Search patients by name, MRN, or condition..."
                      className="pl-10"
                      style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    className="shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
                      color: "#FFFFFF",
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Add Patient
                  </Button>
                </div>

                {selectedPatient ? (
                  // Patient Details View
                  <div className="grid lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                      <div className="flex items-center justify-between mb-6">
                        <h2 style={{ color: "#1B262C" }}>Patient Details</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPatient(null)}
                          style={{ color: "#64748B" }}
                        >
                          Back to List
                        </Button>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-20 h-20">
                            <AvatarFallback
                              className="text-[1.5rem]"
                              style={{ backgroundColor: "#0077B6", color: "#FFFFFF" }}
                            >
                              {selectedPatient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 style={{ color: "#1B262C" }}>{selectedPatient.name}</h3>
                            <p style={{ color: "#64748B" }}>MRN: {selectedPatient.mrn}</p>
                            <Badge
                              className="mt-2"
                              style={{
                                backgroundColor: selectedPatient.status === "Active" ? "#D1FAE5" : "#FEF3C7",
                                color: selectedPatient.status === "Active" ? "#065F46" : "#92400E",
                              }}
                            >
                              {selectedPatient.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                              Age
                            </p>
                            <p style={{ color: "#1B262C" }}>{selectedPatient.age} years</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                              Gender
                            </p>
                            <p style={{ color: "#1B262C" }}>{selectedPatient.gender}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                              <Phone className="w-4 h-4 inline mr-2" />
                              Phone
                            </p>
                            <p style={{ color: "#1B262C" }}>{selectedPatient.phone}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                              <Mail className="w-4 h-4 inline mr-2" />
                              Email
                            </p>
                            <p style={{ color: "#1B262C" }}>{selectedPatient.email}</p>
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                              <MapPin className="w-4 h-4 inline mr-2" />
                              Address
                            </p>
                            <p style={{ color: "#1B262C" }}>{selectedPatient.address}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                              <Calendar className="w-4 h-4 inline mr-2" />
                              Last Visit
                            </p>
                            <p style={{ color: "#1B262C" }}>{selectedPatient.lastVisit}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                              Primary Condition
                            </p>
                            <p style={{ color: "#1B262C" }}>{selectedPatient.condition}</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                      <h3 className="mb-4" style={{ color: "#1B262C" }}>
                        Health Stats
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-[0.875rem]" style={{ color: "#64748B" }}>
                              Blood Pressure
                            </span>
                            <span className="text-[0.875rem]" style={{ color: "#1B262C" }}>
                              140/90
                            </span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-[0.875rem]" style={{ color: "#64748B" }}>
                              Heart Rate
                            </span>
                            <span className="text-[0.875rem]" style={{ color: "#1B262C" }}>
                              72 bpm
                            </span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-[0.875rem]" style={{ color: "#64748B" }}>
                              BMI
                            </span>
                            <span className="text-[0.875rem]" style={{ color: "#1B262C" }}>
                              24.5
                            </span>
                          </div>
                          <Progress value={50} className="h-2" />
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button
                          onClick={() => setActiveSection("mri-analysis")}
                          className="w-full"
                          style={{
                            background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
                            color: "#FFFFFF",
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload MRI
                        </Button>
                      </div>
                    </Card>
                  </div>
                ) : (
                  // Patient List View
                  <Card className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>MRN</TableHead>
                          <TableHead>Age/Gender</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Last Visit</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPatients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback style={{ backgroundColor: "#E0F2FE", color: "#0077B6" }}>
                                    {patient.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p style={{ color: "#1B262C" }}>{patient.name}</p>
                                  <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                                    {patient.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell style={{ color: "#1B262C" }}>{patient.mrn}</TableCell>
                            <TableCell style={{ color: "#64748B" }}>
                              {patient.age}y / {patient.gender}
                            </TableCell>
                            <TableCell style={{ color: "#64748B" }}>{patient.condition}</TableCell>
                            <TableCell style={{ color: "#64748B" }}>{patient.lastVisit}</TableCell>
                            <TableCell>
                              <Badge
                                style={{
                                  backgroundColor: patient.status === "Active" ? "#D1FAE5" : patient.status === "Pending" ? "#FEF3C7" : "#E0F2FE",
                                  color: patient.status === "Active" ? "#065F46" : patient.status === "Pending" ? "#92400E" : "#0077B6",
                                }}
                              >
                                {patient.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedPatient(patient)}
                                style={{ borderColor: "#E0F2FE", color: "#0077B6" }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </div>
            )}

            {/* MRI Analysis Section */}
            {activeSection === "mri-analysis" && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Upload Form */}
                <Card className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                  <h2 className="mb-6" style={{ color: "#1B262C" }}>
                    Data Input Form
                  </h2>

                  <Tabs defaultValue="notes" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
                      <TabsTrigger value="image">MRI Upload</TabsTrigger>
                    </TabsList>

                    <TabsContent value="notes" className="space-y-4">
                      <div>
                        <label className="block mb-2" style={{ color: "#1B262C" }}>
                          Patient Clinical Notes
                        </label>
                        <Textarea
                          value={clinicalNotes}
                          onChange={(e) => setClinicalNotes(e.target.value)}
                          placeholder="Enter patient symptoms, medical history, physical examination findings, and relevant clinical information..."
                          className="min-h-[300px] resize-none"
                          style={{ backgroundColor: "#F5FAFF", borderColor: "#E0F2FE" }}
                        />
                      </div>

                      <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: "#E0F2FE" }}>
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#0077B6" }} />
                        <p className="text-[0.875rem]" style={{ color: "#0077B6" }}>
                          Include all relevant patient history and symptoms for accurate AI analysis
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="image" className="space-y-4">
                      {!uploadedImage ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`
                            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                            ${isDragging ? "border-[#00B4D8] bg-[#E0F2FE]" : "border-[#E0F2FE] hover:border-[#00B4D8]"}
                          `}
                          style={{ backgroundColor: isDragging ? "#E0F2FE" : "#F5FAFF" }}
                        >
                          <div className="flex flex-col items-center gap-4">
                            <div
                              className="w-20 h-20 rounded-full flex items-center justify-center"
                              style={{
                                background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
                              }}
                            >
                              <Upload className="w-10 h-10 text-white" />
                            </div>
                            <div>
                              <p className="text-[1.125rem]" style={{ color: "#1B262C" }}>
                                Upload MRI Image
                              </p>
                              <p className="mt-2" style={{ color: "#64748B" }}>
                                Drag and drop or click to browse
                              </p>
                            </div>
                            <p className="text-[0.875rem]" style={{ color: "#94A3B8" }}>
                              Supports DICOM, JPG, PNG formats
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: "#E0F2FE" }}>
                            <img src={uploadedImage} alt="Uploaded MRI scan" className="w-full h-80 object-cover" />
                          </div>
                          {fileName && (
                            <Badge style={{ backgroundColor: "#E0F2FE", color: "#0077B6" }}>
                              {fileName}
                            </Badge>
                          )}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setUploadedImage("");
                                setFileName("");
                              }}
                              className="flex-1"
                              style={{ borderColor: "#E0F2FE", color: "#64748B" }}
                            >
                              Remove
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex-1"
                              style={{ borderColor: "#00B4D8", color: "#00B4D8" }}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Replace
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.dcm"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  {/* Generate Button */}
                  <div className="mt-6 space-y-4">
                    <Button
                      onClick={handleGenerateReport}
                      disabled={(!clinicalNotes.trim() && !uploadedImage) || isGenerating}
                      className="w-full h-12 shadow-lg hover:shadow-xl transition-all"
                      style={{
                        background:
                          (clinicalNotes.trim() || uploadedImage) && !isGenerating
                            ? "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)"
                            : "#CBD5E1",
                        color: "#FFFFFF",
                      }}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      {isGenerating ? "Processing..." : "Generate Report"}
                    </Button>

                    {isGenerating && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[0.875rem]" style={{ color: "#64748B" }}>
                          <span>AI Analysis in progress...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </Card>

                {/* Information Panel */}
                <div className="space-y-6">
                  <Card className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                    <h3 className="mb-4" style={{ color: "#1B262C" }}>
                      What You'll Receive
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          icon: ImageIcon,
                          title: "Enhanced MRI Image",
                          desc: "AI-processed visualization with highlighted abnormalities",
                        },
                        {
                          icon: FileText,
                          title: "AI-Generated Clinical Summary",
                          desc: "Structured diagnostic findings and recommendations",
                        },
                        {
                          icon: Sparkles,
                          title: "Automatic ICD-10 Coding",
                          desc: "AI-assigned diagnostic codes with confidence scores",
                        },
                      ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div key={index} className="flex gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: "#E0F2FE" }}
                            >
                              <Icon className="w-5 h-5" style={{ color: "#0077B6" }} />
                            </div>
                            <div>
                              <p style={{ color: "#1B262C" }}>{item.title}</p>
                              <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  <Card className="p-6" style={{ backgroundColor: "#E0F2FE", borderColor: "#00B4D8" }}>
                    <h3 className="mb-3" style={{ color: "#0077B6" }}>
                      Sample Clinical Notes
                    </h3>
                    <p className="text-[0.875rem] leading-relaxed mb-4" style={{ color: "#1B262C" }}>
                      "58-year-old male with persistent headaches and dizziness for 3 weeks. BP: 140/90 mmHg. History
                      of hypertension (5 years). Neurological examination reveals no focal deficits. Complaints of
                      visual disturbances and occasional confusion."
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setClinicalNotes(
                          "58-year-old male with persistent headaches and dizziness for 3 weeks. BP: 140/90 mmHg. History of hypertension (5 years). Neurological examination reveals no focal deficits. Complaints of visual disturbances and occasional confusion."
                        );
                      }}
                      style={{ borderColor: "#0077B6", color: "#0077B6", backgroundColor: "#FFFFFF" }}
                    >
                      Use This Sample
                    </Button>
                  </Card>
                </div>
              </div>
            )}

            {/* Reports Section */}
            {activeSection === "reports" && (
              <div className="space-y-6">
                {analysisResult ? (
                  // Results Display
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        onClick={() => setAnalysisResult(null)}
                        style={{ color: "#64748B" }}
                      >
                        <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                        Back to Reports List
                      </Button>
                      <Button
                        className="shadow-md"
                        style={{
                          background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
                          color: "#FFFFFF",
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Export Report
                      </Button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Enhanced Image */}
                      <Card className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                        <h2 className="mb-4" style={{ color: "#1B262C" }}>
                          Enhanced MRI Image
                        </h2>
                        <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: "#E0F2FE" }}>
                          <img
                            src={analysisResult.enhancedImage}
                            alt="Enhanced MRI scan"
                            className="w-full h-96 object-cover"
                          />
                        </div>
                        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "#E0F2FE" }}>
                          <p className="text-[0.875rem]" style={{ color: "#0077B6" }}>
                            AI processing complete - Image enhanced for diagnostic clarity
                          </p>
                        </div>
                      </Card>

                      {/* AI Summary and ICD Codes */}
                      <div className="space-y-6">
                        {/* Clinical Summary */}
                        <Card className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                          <h2 className="mb-4" style={{ color: "#1B262C" }}>
                            AI-Generated Clinical Summary
                          </h2>
                          <div
                            className="p-4 rounded-lg text-[0.875rem] leading-relaxed whitespace-pre-line"
                            style={{ backgroundColor: "#F5FAFF", color: "#1B262C" }}
                          >
                            {analysisResult.clinicalSummary}
                          </div>
                        </Card>

                        {/* ICD-10 Codes */}
                        <Card className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                          <h2 className="mb-4" style={{ color: "#1B262C" }}>
                            Automatic ICD-10 Coding
                          </h2>
                          <div className="space-y-3">
                            {analysisResult.icdCodes.map((icd, index) => (
                              <div key={index} className="p-4 rounded-lg border" style={{ borderColor: "#E0F2FE" }}>
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <Badge
                                      className="mb-2"
                                      style={{ backgroundColor: "#0077B6", color: "#FFFFFF" }}
                                    >
                                      {icd.code}
                                    </Badge>
                                    <p style={{ color: "#1B262C" }}>{icd.description}</p>
                                  </div>
                                  <Badge
                                    style={{
                                      backgroundColor:
                                        icd.confidence >= 90
                                          ? "#D1FAE5"
                                          : icd.confidence >= 75
                                          ? "#FEF3C7"
                                          : "#FEE2E2",
                                      color:
                                        icd.confidence >= 90
                                          ? "#065F46"
                                          : icd.confidence >= 75
                                          ? "#92400E"
                                          : "#991B1B",
                                    }}
                                  >
                                    {icd.confidence}%
                                  </Badge>
                                </div>
                                <Progress value={icd.confidence} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Reports List
                  <Card className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 style={{ color: "#1B262C" }}>Medical Reports</h2>
                      <Button
                        onClick={() => setActiveSection("mri-analysis")}
                        className="shadow-md"
                        style={{
                          background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
                          color: "#FFFFFF",
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        New Analysis
                      </Button>
                    </div>

                    {loadingReports ? (
                      <p style={{ color: "#64748B" }}>Loading reports...</p>
                    ) : reports.length === 0 ? (
                      <p style={{ color: "#64748B" }}>No reports available. Generate a new analysis to create one.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Report ID</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>ICD-10 Code</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell style={{ color: "#1B262C" }}>{report.id}</TableCell>
                              <TableCell style={{ color: "#1B262C" }}>{report.patientName}</TableCell>
                              <TableCell style={{ color: "#64748B" }}>{report.date}</TableCell>
                              <TableCell>
                                <Badge style={{ backgroundColor: "#E0F2FE", color: "#0077B6" }}>
                                  {report.icdCode}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-xs" style={{ color: "#64748B" }}>
                                {report.summary}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  style={{
                                    backgroundColor: report.status === "Completed" ? "#D1FAE5" : "#FEF3C7",
                                    color: report.status === "Completed" ? "#065F46" : "#92400E",
                                  }}
                                >
                                  {report.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  style={{ borderColor: "#E0F2FE", color: "#0077B6" }}
                                  onClick={() => toast.info("Navigate to Patient Management to view full report details.")}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </Card>
                )}
              </div>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                  <h2 className="mb-6" style={{ color: "#1B262C" }}>
                    Profile Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2" style={{ color: "#1B262C" }}>
                        Full Name
                      </label>
                      <Input
                        defaultValue={`Dr. ${currentUser}`}
                        style={{ backgroundColor: "#F5FAFF", borderColor: "#E0F2FE" }}
                      />
                    </div>
                    <div>
                      <label className="block mb-2" style={{ color: "#1B262C" }}>
                        Hospital/Clinic
                      </label>
                      <Input
                        defaultValue="City General Hospital"
                        style={{ backgroundColor: "#F5FAFF", borderColor: "#E0F2FE" }}
                      />
                    </div>
                    <div>
                      <label className="block mb-2" style={{ color: "#1B262C" }}>
                        Email
                      </label>
                      <Input
                        defaultValue="sarah.smith@hospital.com"
                        type="email"
                        style={{ backgroundColor: "#F5FAFF", borderColor: "#E0F2FE" }}
                      />
                    </div>
                    <Button
                      className="w-full"
                      style={{
                        background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
                        color: "#FFFFFF",
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </Card>

                <Card className="p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}>
                  <h2 className="mb-6" style={{ color: "#1B262C" }}>
                    AI Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border" style={{ borderColor: "#E0F2FE" }}>
                      <p style={{ color: "#1B262C" }}>Confidence Threshold</p>
                      <p className="text-[0.875rem] mb-3" style={{ color: "#64748B" }}>
                        Minimum confidence for ICD-10 suggestions
                      </p>
                      <Progress value={75} className="h-2 mb-2" />
                      <p className="text-[0.875rem] text-right" style={{ color: "#0077B6" }}>
                        75%
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ borderColor: "#E0F2FE" }}>
                      <p style={{ color: "#1B262C" }}>Auto-Save Reports</p>
                      <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                        Automatically save generated reports
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ borderColor: "#E0F2FE" }}>
                      <p style={{ color: "#1B262C" }}>Notification Preferences</p>
                      <p className="text-[0.875rem]" style={{ color: "#64748B" }}>
                        Get notified when analysis is complete
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
