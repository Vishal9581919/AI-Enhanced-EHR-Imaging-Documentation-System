import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Progress } from "./ui/progress";
import { MRIUpload } from "./MRIUpload";
import { User, Brain, Calendar as CalendarIcon, Sparkles, RotateCcw } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export interface PatientData {
  patientId: string;
  name: string;
  age: string;
  gender: string;
  diagnosisDate: Date | undefined;
  glucoseLevel: string;
  bmi: string;
  clinicalNotes: string;
}

interface DashboardProps {
  onGenerateReport: (data: PatientData, mriImage: string) => void;
  userType: 'doctor' | 'guest';
}

export function Dashboard({ onGenerateReport, userType }: DashboardProps) {
  const [patientData, setPatientData] = useState<PatientData>({
    patientId: "",
    name: "",
    age: "",
    gender: "male",
    diagnosisDate: undefined,
    glucoseLevel: "",
    bmi: "",
    clinicalNotes: "",
  });

  const [mriImage, setMriImage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageUpload = (file: File, preview: string) => {
    setMriImage(preview);
  };

  const handleClearImage = () => {
    setMriImage("");
  };

  const handleClearForm = () => {
    setPatientData({
      patientId: "",
      name: "",
      age: "",
      gender: "male",
      diagnosisDate: undefined,
      glucoseLevel: "",
      bmi: "",
      clinicalNotes: "",
    });
    setMriImage("");
    setIsProcessing(false);
    setProgress(0);
  };

  const handleEnhanceImage = () => {
    setIsProcessing(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mriImage) {
      onGenerateReport(patientData, mriImage);
    }
  };

  const isFormValid = patientData.patientId && patientData.name && mriImage;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F8FAFB' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ color: '#1E2A35' }}>Patient Data Input</h1>
          <p style={{ color: '#64748B' }}>
            Enter patient information and upload MRI scans for AI-powered analysis
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Patient Information */}
            <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5" style={{ color: '#0E6BA8' }} />
                <h2 style={{ color: '#1E2A35' }}>Patient Information</h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID *</Label>
                  <Input
                    id="patientId"
                    value={patientData.patientId}
                    onChange={(e) => setPatientData({ ...patientData, patientId: e.target.value })}
                    placeholder="e.g., MRN-123456"
                    className="h-11"
                    style={{ backgroundColor: '#F8FAFB', borderColor: '#CBD5E1' }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Patient Name *</Label>
                  <Input
                    id="name"
                    value={patientData.name}
                    onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                    placeholder="Full name"
                    className="h-11"
                    style={{ backgroundColor: '#F8FAFB', borderColor: '#CBD5E1' }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={patientData.age}
                      onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                      placeholder="Years"
                      className="h-11"
                      style={{ backgroundColor: '#F8FAFB', borderColor: '#CBD5E1' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup
                      value={patientData.gender}
                      onValueChange={(value) => setPatientData({ ...patientData, gender: value })}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="cursor-pointer">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="cursor-pointer">Female</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Diagnosis Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 justify-start"
                        style={{ backgroundColor: '#F8FAFB', borderColor: '#CBD5E1', color: patientData.diagnosisDate ? '#1E2A35' : '#94A3B8' }}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {patientData.diagnosisDate ? format(patientData.diagnosisDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={patientData.diagnosisDate}
                        onSelect={(date) => setPatientData({ ...patientData, diagnosisDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="glucose">Glucose Level (mg/dL)</Label>
                    <Input
                      id="glucose"
                      type="number"
                      value={patientData.glucoseLevel}
                      onChange={(e) => setPatientData({ ...patientData, glucoseLevel: e.target.value })}
                      placeholder="e.g., 110"
                      className="h-11"
                      style={{ backgroundColor: '#F8FAFB', borderColor: '#CBD5E1' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bmi">BMI</Label>
                    <Input
                      id="bmi"
                      type="number"
                      step="0.1"
                      value={patientData.bmi}
                      onChange={(e) => setPatientData({ ...patientData, bmi: e.target.value })}
                      placeholder="e.g., 24.5"
                      className="h-11"
                      style={{ backgroundColor: '#F8FAFB', borderColor: '#CBD5E1' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Clinical Notes / Observations</Label>
                  <Textarea
                    id="notes"
                    value={patientData.clinicalNotes}
                    onChange={(e) => setPatientData({ ...patientData, clinicalNotes: e.target.value })}
                    placeholder="Enter detailed clinical observations, symptoms, medical history..."
                    className="min-h-32"
                    style={{ backgroundColor: '#F8FAFB', borderColor: '#CBD5E1' }}
                  />
                </div>
              </div>
            </Card>

            {/* Right Column - MRI Upload */}
            <Card className="p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5" style={{ color: '#007B83' }} />
                <h2 style={{ color: '#1E2A35' }}>MRI Imaging Data</h2>
              </div>

              <div className="space-y-5">
                <MRIUpload
                  onImageUpload={handleImageUpload}
                  uploadedImage={mriImage}
                  onClearImage={handleClearImage}
                />

                {mriImage && (
                  <>
                    <Button
                      type="button"
                      onClick={handleEnhanceImage}
                      disabled={isProcessing}
                      className="w-full h-11 rounded-lg shadow-sm"
                      style={{ backgroundColor: '#007B83', color: '#FFFFFF' }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Enhance and Analyze MRI'}
                    </Button>

                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[0.875rem]" style={{ color: '#64748B' }}>
                          <span>Processing MRI scan...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    {progress === 100 && !isProcessing && (
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
                        <p style={{ color: '#065F46' }}>
                          ✓ MRI enhancement complete. Ready for report generation.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearForm}
              className="h-12 px-6 rounded-lg"
              style={{ borderColor: '#CBD5E1', color: '#64748B' }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid}
              className="h-12 px-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              style={{ backgroundColor: '#0E6BA8', color: '#FFFFFF' }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate AI Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
