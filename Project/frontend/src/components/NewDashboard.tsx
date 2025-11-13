import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Upload, FileText, Image as ImageIcon, Sparkles, AlertCircle, ArrowLeft, Activity } from "lucide-react";
import { useState, useRef } from "react";
import { summaryAPI, imageAPI, imageToBase64, patientAPI } from "../services/api";
import { toast } from "sonner";

export interface UploadData {
  type: 'ehr' | 'image';
  content: string; // Either text content or image URL
  fileName?: string;
  // Add properties for both EHR text and image
  ehrText?: string;
  imageUrl?: string;
  // API response data
  apiResponse?: any;
  patientName: string;
  patientId: string;
}

interface NewDashboardProps {
  onGenerateReport: (data: UploadData) => void;
  onBack?: () => void;
}

export function NewDashboard({ onGenerateReport, onBack }: NewDashboardProps) {
  const [activeTab, setActiveTab] = useState<'ehr' | 'image'>('image');
  const [ehrText, setEhrText] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setUploadedImage(preview);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/plain' || file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setEhrText(text);
        setActiveTab('ehr');
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateReport = async () => {
    if (!patientName.trim() || !patientId.trim()) {
      toast.error('Please enter patient name and ID before generating the report');
      return;
    }

    if (!ehrText.trim() && !uploadedImage) {
      toast.error('Please provide either clinical notes or an image');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    
    try {
      const trimmedPatientId = patientId.trim();
      const trimmedPatientName = patientName.trim();
      const trimmedNotes = ehrText.trim();

      if (trimmedPatientId) {
        try {
          await patientAPI.create({
            patient_uid: trimmedPatientId,
            name: trimmedPatientName || undefined,
            clinical_notes: trimmedNotes || undefined,
          });
        } catch (error: any) {
          const message = error?.message?.toLowerCase?.() || "";
          if (message.includes("exists")) {
            await patientAPI.update(trimmedPatientId, {
              name: trimmedPatientName || undefined,
              clinical_notes: trimmedNotes || undefined,
            });
          } else {
            console.warn("Unable to sync patient record:", error);
          }
        }
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Prepare images array
      const images: string[] = [];
      if (uploadedImage) {
        // Extract base64 from data URL
        const base64 = uploadedImage.includes(',') ? uploadedImage.split(',')[1] : uploadedImage;
        images.push(base64);
      }

      // Combine EHR text and any additional context
      const clinicalText = ehrText.trim() || (uploadedImage ? 'Medical image analysis requested' : '');

      // Call backend API
      setProgress(50);
      const response = await summaryAPI.generate({
        patient_uid: trimmedPatientId || undefined,
        clinical_text: clinicalText,
        images: images.length > 0 ? images : undefined,
        use_hf: true, // Use Hugging Face API if available
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Store the API response in the upload data for the report page
      setTimeout(() => {
        setIsGenerating(false);
        onGenerateReport({
          type: uploadedImage ? 'image' : 'ehr',
          content: uploadedImage || ehrText,
          fileName: fileName || (uploadedImage ? 'medical-image.jpg' : 'ehr-text.txt'),
          ehrText: ehrText,
          imageUrl: uploadedImage,
          // Store API response
          apiResponse: response,
          patientName: trimmedPatientName,
          patientId: trimmedPatientId,
        });
      }, 300);
    } catch (error: any) {
      setIsGenerating(false);
      setProgress(0);
      toast.error(`Failed to generate report: ${error.message || 'Unknown error'}`);
      console.error('Error generating report:', error);
    }
  };

  const canGenerate = Boolean(patientName.trim()) && Boolean(patientId.trim()) && Boolean(ehrText.trim() || uploadedImage);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5FAFF' }}>
      {/* Top Navigation Bar */}
      {onBack && (
        <nav className="border-b" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
          <div className="max-w-6xl mx-auto px-6 py-4">
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

              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={onBack}
                style={{ color: '#64748B' }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </nav>
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ color: '#1B262C' }}>Upload & Analyze</h1>
          <p className="text-[1.125rem]" style={{ color: '#4A5568' }}>
            Upload both medical images and clinical notes for comprehensive AI-powered diagnostic analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Upload */}
          <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
            <h2 className="mb-6" style={{ color: '#1B262C' }}>Data Upload</h2>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: '#1B262C' }}>
                  Patient Name
                </label>
                <Input
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g., John Doe"
                  style={{ backgroundColor: '#F5FAFF', borderColor: '#E0F2FE' }}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: '#1B262C' }}>
                  Patient ID / MRN
                </label>
                <Input
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g., MRN-102938"
                  style={{ backgroundColor: '#F5FAFF', borderColor: '#E0F2FE' }}
                />
              </div>
            </div>

            {/* Info Banner */}
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: '#E0F2FE' }}>
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#0077B6' }} />
              <div>
                <p style={{ color: '#0077B6' }}>
                  Upload both clinical notes and medical images for the most comprehensive analysis
                </p>
                <p className="text-[0.875rem] mt-1" style={{ color: '#0077B6', opacity: 0.8 }}>
                  The AI will combine all available data to generate a detailed diagnostic summary
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'ehr' | 'image')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="ehr" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Upload EHR Text
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Upload Image
                </TabsTrigger>
              </TabsList>

              {/* EHR Text Tab */}
              <TabsContent value="ehr" className="space-y-4">
                <div>
                  <label className="block mb-2" style={{ color: '#1B262C' }}>
                    Paste Clinical Notes or Upload Text File
                  </label>
                  <Textarea
                    value={ehrText}
                    onChange={(e) => setEhrText(e.target.value)}
                    placeholder="Enter patient clinical notes, symptoms, medical history, or any EHR data..."
                    className="min-h-[300px] resize-none"
                    style={{ backgroundColor: '#F5FAFF', borderColor: '#E0F2FE' }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                    style={{ borderColor: '#00B4D8', color: '#00B4D8' }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload .txt or .pdf
                  </Button>
                  {fileName && (
                    <Badge style={{ backgroundColor: '#E0F2FE', color: '#0077B6' }}>
                      {fileName}
                    </Badge>
                  )}
                </div>

                <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: '#FEF3C7' }}>
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#92400E' }} />
                  <p className="text-[0.875rem]" style={{ color: '#92400E' }}>
                    Supports JPG, PNG, PDF, and TXT formats
                  </p>
                </div>
              </TabsContent>

              {/* Image Upload Tab */}
              <TabsContent value="image" className="space-y-4">
                {!uploadedImage ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                      ${isDragging ? 'border-[#00B4D8] bg-[#E0F2FE]' : 'border-[#E0F2FE] hover:border-[#00B4D8]'}
                    `}
                    style={{ backgroundColor: isDragging ? '#E0F2FE' : '#F5FAFF' }}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)'
                        }}
                      >
                        <Upload className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <p className="text-[1.125rem]" style={{ color: '#1B262C' }}>
                          Drag and drop your medical image
                        </p>
                        <p className="mt-2" style={{ color: '#64748B' }}>
                          or click to browse files
                        </p>
                      </div>
                      <p className="text-[0.875rem]" style={{ color: '#94A3B8' }}>
                        MRI, X-ray, CT scan, or histopathology images
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: '#E0F2FE' }}>
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded medical scan" 
                        className="w-full h-80 object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadedImage("");
                          setFileName("");
                        }}
                        className="flex-1"
                        style={{ borderColor: '#E0F2FE', color: '#64748B' }}
                      >
                        Remove Image
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                        style={{ borderColor: '#00B4D8', color: '#00B4D8' }}
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
              accept=".jpg,.jpeg,.png,.pdf,.txt,.dcm"
              onChange={handleFileInput}
              className="hidden"
            />

            {/* Generate Button */}
            <div className="mt-6 space-y-4">
              <Button
                onClick={handleGenerateReport}
                disabled={!canGenerate || isGenerating}
                className="w-full h-12 shadow-lg hover:shadow-xl transition-all"
                style={{ 
                  background: canGenerate && !isGenerating 
                    ? 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)'
                    : '#CBD5E1',
                  color: '#FFFFFF'
                }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isGenerating ? 'Processing...' : 'Generate Report'}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[0.875rem]" style={{ color: '#64748B' }}>
                    <span>AI Analysis in progress...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          </Card>

          {/* Right Panel - Info/Preview */}
          <div className="space-y-6">
            <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0F2FE' }}>
              <h3 className="mb-4" style={{ color: '#1B262C' }}>
                What You'll Get
              </h3>
              <div className="space-y-4">
                {[
                  { icon: ImageIcon, title: "Enhanced Medical Image", desc: "AI-processed visuals with highlighted regions" },
                  { icon: FileText, title: "Structured Clinical Summary", desc: "Concise, organized medical findings" },
                  { icon: Sparkles, title: "ICD-10 Code Assignment", desc: "Automatic diagnostic code generation" },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#E0F2FE' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: '#0077B6' }} />
                      </div>
                      <div>
                        <p style={{ color: '#1B262C' }}>{item.title}</p>
                        <p className="text-[0.875rem]" style={{ color: '#64748B' }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6" style={{ backgroundColor: '#E0F2FE', borderColor: '#00B4D8' }}>
              <h3 className="mb-3" style={{ color: '#0077B6' }}>
                Sample EHR Text
              </h3>
              <p className="text-[0.875rem] leading-relaxed" style={{ color: '#1B262C' }}>
                "Patient presents with persistent headache and dizziness for 3 weeks. 
                Blood pressure 140/90. History of hypertension. Neurological exam shows 
                no focal deficits. MRI ordered to rule out structural abnormalities."
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEhrText("Patient presents with persistent headache and dizziness for 3 weeks. Blood pressure 140/90. History of hypertension. Neurological exam shows no focal deficits. MRI ordered to rule out structural abnormalities.");
                  setActiveTab('ehr');
                }}
                className="mt-3"
                style={{ borderColor: '#0077B6', color: '#0077B6', backgroundColor: '#FFFFFF' }}
              >
                Use This Sample
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}