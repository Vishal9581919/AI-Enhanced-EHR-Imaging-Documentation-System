import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Download, 
  Save, 
  ZoomIn, 
  ZoomOut, 
  Contrast,
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { PatientData } from "./Dashboard";
import { useRef, useState } from "react";
import jsPDF from "jspdf";

interface ReportPageProps {
  patientData: PatientData;
  mriImage: string;
  onBack: () => void;
}

// Mock AI-generated data
const generateMockReport = (patientData: PatientData) => {
  return {
    mriDescription: "T2-weighted MRI scan demonstrates increased signal intensity in the periventricular white matter regions, suggestive of chronic microvascular changes. No evidence of acute infarction or hemorrhage. Ventricular size appears within normal limits. Gray-white matter differentiation is preserved.",
    clinicalSummary: `Patient ${patientData.name} (Age: ${patientData.age}, Gender: ${patientData.gender}) presents with clinical findings consistent with chronic microvascular disease. Glucose level of ${patientData.glucoseLevel || 'N/A'} mg/dL and BMI of ${patientData.bmi || 'N/A'} are noted. ${patientData.clinicalNotes ? 'Clinical notes indicate: ' + patientData.clinicalNotes.slice(0, 150) + '...' : 'No additional clinical notes provided.'}`,
    icdCode: "I67.4",
    icdDescription: "Hypertensive encephalopathy",
    recommendations: [
      "Continue monitoring blood pressure and glucose levels regularly",
      "Consider neurology consult for comprehensive evaluation",
      "Recommend follow-up MRI in 6-12 months to assess progression",
      "Lifestyle modifications including diet and exercise regimen",
      "Evaluate for cardiovascular risk factors"
    ],
    confidenceScore: 87,
    additionalFindings: [
      "Mild age-related cerebral atrophy",
      "No mass effect or midline shift",
      "Cerebellum and brainstem unremarkable"
    ]
  };
};

export function ReportPage({ patientData, mriImage, onBack }: ReportPageProps) {
  const [zoom, setZoom] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const report = generateMockReport(patientData);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

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
      pdf.text(`Patient: ${patientData.name}`, margin, y);
      y += 6;
      pdf.text(`Patient ID: ${patientData.patientId}`, margin, y);
      y += 10;

      // Diagnosis section
      pdf.setFontSize(14);
      pdf.text("Diagnosis", margin, y);
      y += 6;
      pdf.setFontSize(12);
      const diagnosis = `${report.icdCode} - ${report.icdDescription}`;
      const diagLines = pdf.splitTextToSize(diagnosis, pageWidth - margin * 2);
      pdf.text(diagLines, margin, y);
      y += diagLines.length * 6 + 6;

      // Clinical summary
      pdf.setFontSize(14);
      pdf.text("Clinical Summary", margin, y);
      y += 6;
      pdf.setFontSize(12);
      const summaryLines = pdf.splitTextToSize(report.clinicalSummary, pageWidth - margin * 2);
      summaryLines.forEach((line) => {
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, margin, y);
        y += 6;
      });
      y += 4;

      // Additional findings
      if (report.additionalFindings?.length) {
        pdf.setFontSize(14);
        if (y > 275) {
          pdf.addPage();
          y = 20;
        }
        pdf.text("Additional Findings", margin, y);
        y += 6;
        pdf.setFontSize(12);
        for (const f of report.additionalFindings) {
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

      if (mriImage) {
        try {
          const enhanced = await createEnhancedImage(mriImage);
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
          console.error("Unable to embed MRI image", error);
        }
      }

      pdf.save(`clinical-report-${patientData.patientId}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F8FAFB' }}>
      <div className="max-w-7xl mx-auto" ref={reportRef}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-2 -ml-2"
              style={{ color: '#64748B' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 style={{ color: '#1E2A35' }}>AI-Generated Clinical Report</h1>
            <p style={{ color: '#64748B' }}>
              Patient: {patientData.name} (ID: {patientData.patientId})
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              className="h-11 px-5 rounded-lg shadow-md"
              style={{ backgroundColor: '#007B83', color: '#FFFFFF' }}
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Preparing...' : 'Download PDF'}
            </Button>
            <Button
              className="h-11 px-5 rounded-lg shadow-md"
              style={{ backgroundColor: '#0E6BA8', color: '#FFFFFF' }}
            >
              <Save className="w-4 h-4 mr-2" />
              Save to EHR
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Enhanced MRI */}
          <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
            <h2 className="mb-4" style={{ color: '#1E2A35' }}>Enhanced MRI Scan</h2>
            
            {/* MRI Image Viewer */}
            <div className="mb-4 rounded-lg overflow-hidden border-2" style={{ borderColor: '#CBD5E1' }}>
              <div 
                className="bg-black flex items-center justify-center p-4"
                style={{ minHeight: '400px' }}
              >
                <img 
                  src={mriImage} 
                  alt="Enhanced MRI" 
                  style={{ 
                    transform: `scale(${zoom / 100})`,
                    filter: `contrast(${contrast}%)`,
                    transition: 'all 0.3s ease',
                    maxWidth: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>

            {/* Image Controls */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="flex-1"
                style={{ borderColor: '#CBD5E1' }}
              >
                <ZoomIn className="w-4 h-4 mr-2" />
                Zoom In
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="flex-1"
                style={{ borderColor: '#CBD5E1' }}
              >
                <ZoomOut className="w-4 h-4 mr-2" />
                Zoom Out
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setContrast(contrast === 100 ? 120 : 100)}
                className="flex-1"
                style={{ borderColor: '#CBD5E1' }}
              >
                <Contrast className="w-4 h-4 mr-2" />
                Contrast
              </Button>
            </div>

            <Separator className="my-4" />

            {/* AI-Generated MRI Description */}
            <div>
              <h3 className="mb-3" style={{ color: '#1E2A35' }}>
                AI-Generated MRI Description
              </h3>
              <p className="text-[0.9375rem] leading-relaxed" style={{ color: '#475569' }}>
                {report.mriDescription}
              </p>
            </div>

            <Separator className="my-4" />

            {/* Additional Findings */}
            <div>
              <h3 className="mb-3" style={{ color: '#1E2A35' }}>
                Additional Findings
              </h3>
              <ul className="space-y-2">
                {report.additionalFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#007B83' }} />
                    <span className="text-[0.9375rem]" style={{ color: '#475569' }}>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Right Panel - Clinical Report */}
          <div className="space-y-6">
            {/* Confidence Score */}
            <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ color: '#1E2A35' }}>AI Confidence Score</h3>
                <Badge 
                  className="px-3 py-1"
                  style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                >
                  {report.confidenceScore}%
                </Badge>
              </div>
              <Progress value={report.confidenceScore} className="h-3" />
              <p className="mt-2 text-[0.875rem]" style={{ color: '#64748B' }}>
                High confidence in diagnostic analysis
              </p>
            </Card>

            {/* Structured Clinical Summary */}
            <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" style={{ color: '#0E6BA8' }} />
                <h2 style={{ color: '#1E2A35' }}>Structured AI Clinical Summary</h2>
              </div>
              <ScrollArea className="h-48 rounded-md border p-4" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-[0.9375rem] leading-relaxed" style={{ color: '#475569' }}>
                  {report.clinicalSummary}
                </p>
              </ScrollArea>
            </Card>

            {/* ICD-10 Code */}
            <Card className="p-6" style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
              <h3 className="mb-3" style={{ color: '#92400E' }}>
                ICD-10 Code Assignment
              </h3>
              <div className="flex items-start gap-3">
                <Badge 
                  className="text-[1.125rem] px-3 py-2"
                  style={{ backgroundColor: '#FBBF24', color: '#78350F' }}
                >
                  {report.icdCode}
                </Badge>
                <div>
                  <p style={{ color: '#78350F' }}>
                    {report.icdDescription}
                  </p>
                  <p className="mt-1 text-[0.875rem]" style={{ color: '#92400E' }}>
                    Based on clinical presentation and imaging findings
                  </p>
                </div>
              </div>
            </Card>

            {/* AI Recommendations */}
            <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <h3 className="mb-4" style={{ color: '#1E2A35' }}>
                AI Recommendations
              </h3>
              <ul className="space-y-3">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: '#E0F2FE', color: '#0E6BA8' }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-[0.9375rem]" style={{ color: '#475569' }}>
                      {recommendation}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Disclaimer */}
            <Card className="p-4" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#991B1B' }} />
                <div>
                  <p style={{ color: '#991B1B' }}>
                    This AI-generated report is intended for clinical decision support only. 
                    Final diagnosis and treatment decisions should be made by qualified healthcare professionals.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
