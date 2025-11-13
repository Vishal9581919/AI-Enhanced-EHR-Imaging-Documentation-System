import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Download, 
  Save, 
  ArrowLeft,
  FileText,
  CheckCircle2,
  Image as ImageIcon,
  Code,
  TrendingUp,
  Activity,
  History,
  User,
  LogOut,
  Users
} from "lucide-react";
import { UploadData } from "./NewDashboard";
import { useRef, useState } from "react";
import jsPDF from "jspdf";

export interface AnalysisReport {
  id: string;
  reportUid?: string;
  uploadData: UploadData;
  timestamp: Date;
  patientId: string;
  patientName: string;
  imageCaption: string;
  clinicalSummary: string;
  icdCode: string;
  icdDescription: string;
  icdCategory: string;
  confidenceScore: number;
  findings: string[];
  recommendations: string[];
  aiModelUsed?: string;
}

interface UnifiedReportPageProps {
  uploadData: UploadData;
  onBack: () => void;
  currentUser?: string;
  onLogout?: () => void;
  analysisHistory?: AnalysisReport[];
  onSelectHistoryItem?: (report: AnalysisReport) => void;
  onSaveReport?: (report: AnalysisReport) => void;
  onOpenPatientManagement?: () => void;
}

const generateReportFromAPI = (data: UploadData, apiResponse?: any): AnalysisReport => {
  const isEHR = data.type === 'ehr';
  const patientName = apiResponse?.patient?.patient_name || data.patientName || "Unknown Patient";
  const resolvedPatientId = apiResponse?.patient?.patient_uid || data.patientId || "MRN-" + Math.floor(Math.random() * 100000);
  
  // Use API response if available, otherwise fall back to mock data
  if (apiResponse) {
    const icdSuggestion = apiResponse.icd_suggestions && apiResponse.icd_suggestions.length > 0 
      ? apiResponse.icd_suggestions[0] 
      : null;
    
    // Parse model output to extract findings and recommendations
    const modelOutput = apiResponse.model_output || '';
    const findings = extractFindings(modelOutput);
    const recommendations = extractRecommendations(modelOutput);
    
    // Get image analysis from AI model if available
    let imageCaption = "No image provided - EHR analysis only";
    if (!isEHR && apiResponse.image_analysis && apiResponse.image_analysis.length > 0) {
      const imageAnalysis = apiResponse.image_analysis[0];
      if (imageAnalysis.caption) {
        imageCaption = imageAnalysis.caption;
      } else if (apiResponse.images_info && apiResponse.images_info.length > 0) {
        imageCaption = apiResponse.images_info[0].caption || "AI-enhanced medical image analysis completed.";
      }
    } else if (!isEHR) {
      imageCaption = "AI-enhanced medical image analysis completed. See clinical summary for detailed findings.";
    }
    
    // Extract radiological analysis if present in model output
    const radiologicalSection = modelOutput.includes('RADIOLOGICAL ANALYSIS:') 
      ? modelOutput.split('RADIOLOGICAL ANALYSIS:')[1] 
      : '';
    
    return {
      id: `REPORT-${Date.now()}`,
      reportUid: undefined,
      uploadData: data,
      timestamp: new Date(),
      patientId: resolvedPatientId,
      patientName,
      imageCaption: imageCaption,
      clinicalSummary: modelOutput || `Clinical Assessment: ${data.ehrText?.slice(0, 200) || data.content.slice(0, 200)}...`,
      icdCode: icdSuggestion?.code || "N/A",
      icdDescription: icdSuggestion?.desc || "No ICD-10 code suggested",
      icdCategory: "Clinical Diagnosis",
      confidenceScore: icdSuggestion?.score || 75,
      findings: findings.length > 0 ? findings : [
        "Analysis completed based on provided clinical data",
        "Review clinical summary for detailed findings"
      ],
      recommendations: recommendations.length > 0 ? recommendations : [
        "Review full clinical summary above",
        "Consult with specialist if needed"
      ],
      aiModelUsed: apiResponse.ai_model_used || 'AI Analysis'
    };
  }
  
  // Fallback to mock data if no API response
  return {
    id: `REPORT-${Date.now()}`,
    reportUid: undefined,
    uploadData: data,
    timestamp: new Date(),
    patientId: resolvedPatientId,
    patientName,
    imageCaption: isEHR 
      ? "No image provided - EHR analysis only"
      : "T2-weighted brain MRI demonstrating periventricular white matter hyperintensities consistent with chronic small vessel ischemic disease. No acute infarction or hemorrhage identified.",
    clinicalSummary: isEHR
      ? `Clinical Assessment: ${data.content.slice(0, 200)}...\n\nAI Analysis reveals signs consistent with chronic hypertensive changes. Patient demonstrates classic symptoms of elevated blood pressure with neurological manifestations. Recommended imaging confirms suspicion of microvascular disease.`
      : "Patient imaging demonstrates findings consistent with chronic microvascular ischemic disease. White matter changes are noted in periventricular regions bilaterally. No acute pathology identified. Findings suggest long-standing hypertensive or atherosclerotic changes.",
    icdCode: "I67.4",
    icdDescription: "Hypertensive encephalopathy",
    icdCategory: "Cerebrovascular diseases",
    confidenceScore: 89,
    findings: [
      "Periventricular white matter hyperintensities",
      "Chronic microvascular ischemic changes",
      "No acute hemorrhage or infarction",
      "Age-appropriate cerebral atrophy",
      "Ventricular size within normal limits"
    ],
    recommendations: [
      "Blood pressure management and monitoring",
      "Cardiovascular risk factor assessment",
      "Follow-up MRI in 6-12 months",
      "Neurology consultation recommended",
      "Lifestyle modifications including diet and exercise"
    ]
  };
};

// Helper functions to extract structured data from model output
const extractFindings = (text: string): string[] => {
  const findings: string[] = [];
  const lines = text.split('\n');
  let inFindings = false;
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('finding') || lower.includes('observation')) {
      inFindings = true;
      continue;
    }
    if (inFindings && (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*'))) {
      findings.push(line.trim().substring(1).trim());
    }
    if (inFindings && findings.length >= 5) break;
  }
  
  return findings.length > 0 ? findings : [];
};

const extractRecommendations = (text: string): string[] => {
  const recommendations: string[] = [];
  const lines = text.split('\n');
  let inRecommendations = false;
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('recommend') || lower.includes('next step') || lower.includes('suggest')) {
      inRecommendations = true;
      continue;
    }
    if (inRecommendations && (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*'))) {
      recommendations.push(line.trim().substring(1).trim());
    }
    if (inRecommendations && recommendations.length >= 5) break;
  }
  
  return recommendations.length > 0 ? recommendations : [];
};

export function UnifiedReportPage({ 
  uploadData, 
  onBack, 
  currentUser,
  onLogout,
  analysisHistory = [],
  onSelectHistoryItem,
  onSaveReport,
  onOpenPatientManagement
}: UnifiedReportPageProps) {
  const [imageView, setImageView] = useState<'original' | 'enhanced'>('original');
  const [showHistory, setShowHistory] = useState(false);
  const [report] = useState(() => generateReportFromAPI(uploadData, uploadData.apiResponse));
  const isImageReport = uploadData.type === 'image';
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSave = () => {
    if (onSaveReport) {
      onSaveReport(report);
    }
  };

  const createEnhancedImage = (src: string) =>
    new Promise<{ dataUrl: string; width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }
        ctx.filter = "contrast(1.2) brightness(1.1)";
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", 0.92),
          width: canvas.width,
          height: canvas.height,
        });
      };
      img.onerror = (err) => reject(err);
      img.src = src;
    });

  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let y = 18;

      // Header
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, 20, "F");
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.text("MediAI Report", margin, y);
      y += 10;

      // Patient details
      pdf.setFontSize(12);
      pdf.text(`Patient: ${report.patientName}`, margin, y);
      y += 6;
      pdf.text(`Patient ID: ${report.patientId}`, margin, y);
      y += 10;

      // ICD-10
      pdf.setFontSize(14);
      pdf.text("ICD-10", margin, y);
      y += 6;
      pdf.setFontSize(12);
      const icdLine = `${report.icdCode} - ${report.icdDescription}`;
      const icdLines = pdf.splitTextToSize(icdLine, pageWidth - margin * 2);
      pdf.text(icdLines, margin, y);
      y += icdLines.length * 6 + 6;

      // Clinical summary
      pdf.setFontSize(14);
      pdf.text("Clinical Summary", margin, y);
      y += 6;
      pdf.setFontSize(12);
      const summaryLines = pdf.splitTextToSize(report.clinicalSummary, pageWidth - margin * 2);
      for (const l of summaryLines) {
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(l, margin, y);
        y += 6;
      }
      y += 4;

      // Findings
      if (report.findings?.length) {
        pdf.setFontSize(14);
        if (y > 275) {
          pdf.addPage();
          y = 20;
        }
        pdf.text("Findings", margin, y);
        y += 6;
        pdf.setFontSize(12);
        for (const f of report.findings) {
          const lines = pdf.splitTextToSize(`• ${f}`, pageWidth - margin * 2);
          for (const l of lines) {
            if (y > 280) {
              pdf.addPage();
              y = 20;
            }
            pdf.text(l, margin, y);
            y += 6;
          }
        }
      }

      // Recommendations
      if (report.recommendations?.length) {
        pdf.setFontSize(14);
        if (y > 275) {
          pdf.addPage();
          y = 20;
        }
        pdf.text("Recommendations", margin, y);
        y += 6;
        pdf.setFontSize(12);
        for (const r of report.recommendations) {
          const lines = pdf.splitTextToSize(`• ${r}`, pageWidth - margin * 2);
          for (const l of lines) {
            if (y > 280) {
              pdf.addPage();
              y = 20;
            }
            pdf.text(l, margin, y);
            y += 6;
          }
        }
      }

      const imageSource = isImageReport ? (uploadData.imageUrl || uploadData.content) : undefined;

      if (imageSource) {
        try {
          const enhanced = await createEnhancedImage(imageSource);
          const sectionMaxWidth = pageWidth - margin * 2;
          const sectionMaxHeight = 120;
          const ratio = Math.min(sectionMaxWidth / enhanced.width, sectionMaxHeight / enhanced.height, 1);
          const renderWidth = enhanced.width * ratio;
          const renderHeight = enhanced.height * ratio;

          if (y > 275) {
            pdf.addPage();
            y = 20;
          }

          pdf.setFontSize(14);
          pdf.text("Enhanced Imaging", margin, y);
          y += 6;

          if (y + renderHeight > 285) {
            pdf.addPage();
            y = 20;
          }

          pdf.addImage(enhanced.dataUrl, "JPEG", margin, y, renderWidth, renderHeight);
          y += renderHeight + 6;
        } catch (error) {
          console.error("Unable to embed enhanced image", error);
        }
      }

      pdf.save(`diagnostic-report-${report.patientId}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5FAFF' }}>
      {/* History Sidebar - Only visible if logged in and toggled */}
      {currentUser && showHistory && (
        <div 
          className="w-80 border-r flex-shrink-0 overflow-y-auto"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}
        >
          <div className="p-6 border-b" style={{ borderColor: '#E0F2FE' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" style={{ color: '#0077B6' }} />
                <h3 style={{ color: '#1B262C' }}>Analysis History</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </Button>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: '#E0F2FE' }}>
              <User className="w-4 h-4" style={{ color: '#0077B6' }} />
              <span className="text-[0.875rem]" style={{ color: '#1B262C' }}>{currentUser}</span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {analysisHistory.length === 0 ? (
              <p className="text-center text-[0.875rem] py-8" style={{ color: '#64748B' }}>
                No previous analyses
              </p>
            ) : (
              analysisHistory.map((item) => (
                <Card 
                  key={item.id}
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderColor: '#E0F2FE' }}
                  onClick={() => onSelectHistoryItem?.(item)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge style={{ backgroundColor: '#E0F2FE', color: '#0077B6' }}>
                      {item.patientId}
                    </Badge>
                    <span className="text-[0.75rem]" style={{ color: '#64748B' }}>
                      {item.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[0.875rem] mb-1" style={{ color: '#1B262C' }}>
                    {item.patientName}
                  </p>
                  <p className="text-[0.75rem]" style={{ color: '#64748B' }}>
                    {item.icdCode} - {item.icdDescription}
                  </p>
                  <p className="text-[0.75rem]" style={{ color: '#64748B' }}>
                    Confidence: {item.confidenceScore}%
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Navigation */}
        <nav className="border-b sticky top-0 z-10" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
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
                <Separator orientation="vertical" className="h-8" />
                <h2 style={{ color: '#1B262C' }}>AI Diagnostic Report</h2>
              </div>

              <div className="flex items-center gap-3">
                {currentUser && (
                  <>
                    {onOpenPatientManagement && (
                      <Button
                        variant="ghost"
                        onClick={onOpenPatientManagement}
                        style={{ color: '#64748B' }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Patient Mgmt
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => setShowHistory(!showHistory)}
                      style={{ color: '#64748B' }}
                    >
                      <History className="w-4 h-4 mr-2" />
                      History
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={onLogout}
                      style={{ color: '#64748B' }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  onClick={onBack}
                  style={{ color: '#64748B' }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Unified Results Card */}
        <div className="max-w-7xl mx-auto p-6" ref={reportRef}>
          <Card 
            className="overflow-hidden shadow-lg"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}
          >
            {/* Report Header */}
            <div 
              className="p-6 border-b"
              style={{ 
                background: 'linear-gradient(135deg, #E0F2FE 0%, #BFDBFE 100%)',
                borderColor: '#E0F2FE'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="mb-1" style={{ color: '#0077B6' }}>
                    Diagnostic Analysis Results
                  </h1>
                  <p style={{ color: '#1B262C' }}>
                    Patient: {report.patientName} • ID: {report.patientId} • Generated: {report.timestamp.toLocaleDateString()} at {report.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    className="shadow-md hover:shadow-lg transition-shadow"
                    style={{ 
                      background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                      color: '#FFFFFF'
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Report
                  </Button>
                  <Button
                    variant="outline"
                    disabled={isDownloading}
                    onClick={handleDownloadPDF}
                    style={{ borderColor: '#0077B6', color: '#0077B6' }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloading ? 'Preparing...' : 'Download PDF'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Section 1: Enhanced Image (Before/After Toggle) */}
                {isImageReport && uploadData.content && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: '#E0F2FE' }}
                        >
                          <ImageIcon className="w-5 h-5" style={{ color: '#0077B6' }} />
                        </div>
                        <h3 style={{ color: '#1B262C' }}>1️⃣ Medical Image Analysis</h3>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border-2 bg-black" style={{ borderColor: '#E0F2FE' }}>
                      <div className="relative">
                        <img 
                          src={uploadData.content} 
                          alt="Medical scan" 
                          className="w-full h-80 object-contain"
                          style={{
                            filter: imageView === 'enhanced' ? 'contrast(1.2) brightness(1.1) saturate(1.1)' : 'none'
                          }}
                        />
                        {imageView === 'enhanced' && (
                          <Badge 
                            className="absolute top-4 right-4"
                            style={{ backgroundColor: '#00B4D8', color: '#FFFFFF' }}
                          >
                            ✨ AI Enhanced
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={imageView === 'original' ? 'default' : 'outline'}
                        onClick={() => setImageView('original')}
                        className="flex-1"
                        style={imageView === 'original' ? {
                          background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                          color: '#FFFFFF'
                        } : { borderColor: '#E0F2FE', color: '#0077B6' }}
                      >
                        Original
                      </Button>
                      <Button
                        size="sm"
                        variant={imageView === 'enhanced' ? 'default' : 'outline'}
                        onClick={() => setImageView('enhanced')}
                        className="flex-1"
                        style={imageView === 'enhanced' ? {
                          background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                          color: '#FFFFFF'
                        } : { borderColor: '#E0F2FE', color: '#0077B6' }}
                      >
                        Enhanced
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#F5FAFF' }}>
                      <FileText className="w-4 h-4" style={{ color: '#0077B6' }} />
                      <span className="text-[0.875rem]" style={{ color: '#1B262C' }}>
                        {uploadData.fileName || 'medical-image.jpg'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Section 2: Structured Clinical Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#E0F2FE' }}
                    >
                      <FileText className="w-5 h-5" style={{ color: '#0077B6' }} />
                    </div>
                    <h3 style={{ color: '#1B262C' }}>2️⃣ Structured Clinical Summary</h3>
                  </div>

                  <div 
                    className="p-5 rounded-xl border-2 leading-relaxed whitespace-pre-line min-h-[200px]"
                    style={{ backgroundColor: '#F5FAFF', borderColor: '#E0F2FE' }}
                  >
                    <p style={{ color: '#4A5568' }}>
                      {report.clinicalSummary}
                    </p>
                  </div>

                  {/* AI Confidence Score */}
                  <div className="p-4 rounded-xl border-2" style={{ borderColor: '#E0F2FE' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" style={{ color: '#0077B6' }} />
                        <span style={{ color: '#1B262C' }}>AI Confidence Score</span>
                      </div>
                      <Badge 
                        style={{ 
                          background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                          color: '#FFFFFF'
                        }}
                      >
                        {report.confidenceScore}%
                      </Badge>
                    </div>
                    <Progress value={report.confidenceScore} className="h-2" />
                  </div>

                  {/* Key Findings */}
                  <div className="p-4 rounded-xl border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
                    <h4 className="mb-3" style={{ color: '#1B262C' }}>Key Findings</h4>
                    <ul className="space-y-2">
                      {report.findings.slice(0, 3).map((finding, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#00B4D8' }} />
                          <span className="text-[0.875rem]" style={{ color: '#4A5568' }}>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Section 3: ICD-10 Code + Description */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#E0F2FE' }}
                    >
                      <Code className="w-5 h-5" style={{ color: '#0077B6' }} />
                    </div>
                    <h3 style={{ color: '#1B262C' }}>3️⃣ ICD-10 Code Assignment</h3>
                  </div>

                  <div 
                    className="p-6 rounded-xl border-2"
                    style={{ 
                      background: 'linear-gradient(135deg, #E0F2FE 0%, #BFDBFE 100%)',
                      borderColor: '#00B4D8'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <Badge 
                        className="text-[1.75rem] px-5 py-3"
                        style={{ 
                          background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                          color: '#FFFFFF'
                        }}
                      >
                        {report.icdCode}
                      </Badge>
                      <div className="flex-1">
                        <p className="mb-1" style={{ color: '#0077B6' }}>
                          {report.icdDescription}
                        </p>
                        <p className="text-[0.875rem]" style={{ color: '#1B262C' }}>
                          Category: {report.icdCategory}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Image Caption / AI Analysis */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: '#E0F2FE' }}
                      >
                        <Activity className="w-5 h-5" style={{ color: '#0077B6' }} />
                      </div>
                      <h3 style={{ color: '#1B262C' }}>4️⃣ AI Image Caption & Analysis</h3>
                    </div>
                    {report.aiModelUsed && (
                      <Badge style={{ backgroundColor: '#E0F2FE', color: '#0077B6' }}>
                        {report.aiModelUsed}
                      </Badge>
                    )}
                  </div>

                  <div 
                    className="p-5 rounded-xl border-2 leading-relaxed min-h-[120px]"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}
                  >
                    <p style={{ color: '#4A5568' }}>
                      {report.imageCaption}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* AI Recommendations */}
              <div className="p-6 rounded-xl border-2" style={{ backgroundColor: '#F5FAFF', borderColor: '#E0F2FE' }}>
                <h3 className="mb-4" style={{ color: '#1B262C' }}>
                  AI Clinical Recommendations
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {report.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ 
                          background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                          color: '#FFFFFF'
                        }}
                      >
                        <span className="text-[0.75rem]">{index + 1}</span>
                      </div>
                      <span className="text-[0.875rem]" style={{ color: '#4A5568' }}>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div 
                className="mt-6 p-4 rounded-xl border-2"
                style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}
              >
                <p className="text-[0.875rem]" style={{ color: '#92400E' }}>
                  ⚠️ <strong>Medical Disclaimer:</strong> This AI-generated report is for clinical decision support only. 
                  Final diagnosis and treatment decisions must be made by qualified healthcare professionals. 
                  Always verify findings with additional clinical assessment.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
