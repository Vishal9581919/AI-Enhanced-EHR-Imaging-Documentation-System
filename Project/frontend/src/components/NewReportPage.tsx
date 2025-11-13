import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { 
  Download, 
  Save, 
  ArrowLeft,
  FileText,
  CheckCircle2,
  Image as ImageIcon,
  Code,
  TrendingUp
} from "lucide-react";
import { UploadData } from "./NewDashboard";
import { useRef, useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface NewReportPageProps {
  uploadData: UploadData;
  onBack: () => void;
}

const generateMockReport = (data: UploadData) => {
  const isEHR = data.type === 'ehr';
  
  return {
    patientId: "MRN-" + Math.floor(Math.random() * 100000),
    imageCaption: isEHR 
      ? "No image provided - EHR analysis only"
      : "T2-weighted brain MRI demonstrating periventricular white matter hyperintensities consistent with chronic small vessel ischemic disease. No acute infarction or hemorrhage identified.",
    clinicalSummary: isEHR
      ? `Clinical Assessment: ${data.content.slice(0, 200)}... \n\nAI Analysis reveals signs consistent with chronic hypertensive changes. Patient demonstrates classic symptoms of elevated blood pressure with neurological manifestations. Recommended imaging confirms suspicion of microvascular disease.`
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

export function NewReportPage({ uploadData, onBack }: NewReportPageProps) {
  const [imageView, setImageView] = useState<'original' | 'enhanced'>('enhanced');
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const report = generateMockReport(uploadData);
  const isImageReport = uploadData.type === 'image';

  const handleDownloadPDF = async () => {
    if (!reportRef.current || isDownloading) return;

    try {
      setIsDownloading(true);
      const element = reportRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pageWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imageData, "PNG", 0, position, pageWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, position, pageWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`diagnostic-report-${report.patientId}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F5FAFF' }}>
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
              Back to Upload
            </Button>
            <h1 style={{ color: '#1B262C' }}>
              AI Diagnostic Report
            </h1>
            <p style={{ color: '#64748B' }}>
              Patient ID: {report.patientId} • Generated: {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              className="shadow-md hover:shadow-lg transition-shadow"
              style={{ 
                background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                color: '#FFFFFF'
              }}
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Preparing...' : 'Download PDF'}
            </Button>
            <Button
              variant="outline"
              style={{ borderColor: '#0077B6', color: '#0077B6' }}
            >
              <Save className="w-4 h-4 mr-2" />
              Save to EHR
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Image Analysis */}
          <div className="space-y-6">
            {isImageReport && uploadData.content && (
              <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ color: '#1B262C' }}>Medical Image Analysis</h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={imageView === 'original' ? 'default' : 'outline'}
                      onClick={() => setImageView('original')}
                      style={imageView === 'original' ? {
                        background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                        color: '#FFFFFF'
                      } : {}}
                    >
                      Original
                    </Button>
                    <Button
                      size="sm"
                      variant={imageView === 'enhanced' ? 'default' : 'outline'}
                      onClick={() => setImageView('enhanced')}
                      style={imageView === 'enhanced' ? {
                        background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                        color: '#FFFFFF'
                      } : {}}
                    >
                      Enhanced
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border-2 bg-black" style={{ borderColor: '#E0F2FE' }}>
                  <div className="relative">
                    <img 
                      src={uploadData.content} 
                      alt="Medical scan" 
                      className="w-full h-96 object-contain"
                      style={{
                        filter: imageView === 'enhanced' ? 'contrast(1.2) brightness(1.1)' : 'none'
                      }}
                    />
                    {imageView === 'enhanced' && (
                      <Badge 
                        className="absolute top-4 right-4"
                        style={{ backgroundColor: '#00B4D8', color: '#FFFFFF' }}
                      >
                        AI Enhanced
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#E0F2FE' }}>
                  <ImageIcon className="w-5 h-5" style={{ color: '#0077B6' }} />
                  <p className="text-[0.875rem]" style={{ color: '#1B262C' }}>
                    {uploadData.fileName || 'medical-image.jpg'}
                  </p>
                </div>
              </Card>
            )}

            <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" style={{ color: '#0077B6' }} />
                <h3 style={{ color: '#1B262C' }}>Image Caption (AI-Generated)</h3>
              </div>
              <p className="leading-relaxed" style={{ color: '#4A5568' }}>
                {report.imageCaption}
              </p>
            </Card>

            <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
              <h3 className="mb-4" style={{ color: '#1B262C' }}>Key Findings</h3>
              <ul className="space-y-3">
                {report.findings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#00B4D8' }} />
                    <span style={{ color: '#4A5568' }}>{finding}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Right Panel - Clinical Report */}
          <div className="space-y-6">
            {/* Confidence Score */}
            <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: '#0077B6' }} />
                  <h3 style={{ color: '#1B262C' }}>AI Confidence Score</h3>
                </div>
                <Badge 
                  className="px-3 py-1 text-[1.125rem]"
                  style={{ 
                    background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  {report.confidenceScore}%
                </Badge>
              </div>
              <Progress value={report.confidenceScore} className="h-3 mb-2" />
              <p className="text-[0.875rem]" style={{ color: '#64748B' }}>
                High confidence diagnostic analysis
              </p>
            </Card>

            {/* Clinical Summary */}
            <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
              <h2 className="mb-4" style={{ color: '#1B262C' }}>
                Structured Clinical Summary
              </h2>
              <div 
                className="p-4 rounded-lg leading-relaxed whitespace-pre-line"
                style={{ backgroundColor: '#F5FAFF' }}
              >
                <p style={{ color: '#4A5568' }}>
                  {report.clinicalSummary}
                </p>
              </div>
            </Card>

            {/* ICD-10 Code */}
            <Card 
              className="p-6"
              style={{ 
                background: 'linear-gradient(135deg, #E0F2FE 0%, #BFDBFE 100%)',
                borderColor: '#00B4D8'
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5" style={{ color: '#0077B6' }} />
                <h3 style={{ color: '#0077B6' }}>ICD-10 Code Assignment</h3>
              </div>
              
              <div className="flex items-start gap-4">
                <Badge 
                  className="text-[1.5rem] px-4 py-2"
                  style={{ 
                    background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  {report.icdCode}
                </Badge>
                <div>
                  <p className="mb-1" style={{ color: '#0077B6' }}>
                    {report.icdDescription}
                  </p>
                  <p className="text-[0.875rem]" style={{ color: '#1B262C' }}>
                    Category: {report.icdCategory}
                  </p>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
              <h3 className="mb-4" style={{ color: '#1B262C' }}>
                AI Recommendations
              </h3>
              <ol className="space-y-3">
                {report.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ 
                        background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                        color: '#FFFFFF'
                      }}
                    >
                      {index + 1}
                    </div>
                    <span style={{ color: '#4A5568' }}>{rec}</span>
                  </li>
                ))}
              </ol>
            </Card>

            {/* Export Options */}
            <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
              <h3 className="mb-4" style={{ color: '#1B262C' }}>Export Options</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  style={{ borderColor: '#E0F2FE', color: '#0077B6' }}
                >
                  Download .txt
                </Button>
                <Button 
                  variant="outline"
                  style={{ borderColor: '#E0F2FE', color: '#0077B6' }}
                >
                  Export CSV
                </Button>
                <Button 
                  variant="outline"
                  className="col-span-2"
                  style={{ borderColor: '#E0F2FE', color: '#0077B6' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save to Drive
                </Button>
              </div>
            </Card>

            {/* Disclaimer */}
            <Card 
              className="p-4"
              style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}
            >
              <p className="text-[0.875rem]" style={{ color: '#92400E' }}>
                ⚠️ This AI-generated report is for clinical decision support only. 
                Final diagnosis and treatment decisions must be made by qualified healthcare professionals.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
