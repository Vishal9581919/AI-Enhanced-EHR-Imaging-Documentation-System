import { useCallback, useEffect, useState } from "react";
import { NewLandingPage } from "./components/NewLandingPage";
import { NewDashboard, UploadData } from "./components/NewDashboard";
import { UnifiedReportPage, AnalysisReport } from "./components/UnifiedReportPage";
import { LoginDialog } from "./components/LoginDialog";
import { MedicalDashboard } from "./components/MedicalDashboard";
import { PatientManagement } from "./components/PatientManagement";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { reportAPI, ReportRecord, ReportPayload } from "./services/api";

type Page = 'landing' | 'dashboard' | 'report' | 'medical-dashboard' | 'patient-management';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisReport[]>([]);

  const deserializeReportRecord = useCallback((record: ReportRecord): AnalysisReport => {
    const reportData = record.report_data || {};
    const timestamp = reportData.timestamp
      ? new Date(reportData.timestamp)
      : record.created_at
      ? new Date(record.created_at)
      : new Date();

    const patientName =
      record.patient_name ||
      reportData.patientName ||
      reportData.patient_name ||
      "Unknown Patient";

    const patientId =
      record.patient_uid ||
      reportData.patientId ||
      reportData.patient_uid ||
      "N/A";

    const uploadDataFromRecord = reportData.uploadData || {};
    const uploadData: UploadData = {
      type: uploadDataFromRecord.type || reportData.type || "ehr",
      content:
        uploadDataFromRecord.content ||
        reportData.content ||
        reportData.ehrText ||
        "",
      fileName: uploadDataFromRecord.fileName || reportData.fileName,
      ehrText: uploadDataFromRecord.ehrText || reportData.ehrText,
      imageUrl: uploadDataFromRecord.imageUrl || reportData.imageUrl,
      apiResponse: uploadDataFromRecord.apiResponse || reportData.apiResponse,
      patientName,
      patientId,
    };

    return {
      id: record.report_uid,
      reportUid: record.report_uid,
      uploadData,
      timestamp,
      patientId,
      patientName,
      imageCaption:
        record.image_caption ||
        reportData.imageCaption ||
        uploadDataFromRecord.imageCaption ||
        "",
      clinicalSummary:
        record.clinical_summary ||
        reportData.clinicalSummary ||
        uploadDataFromRecord.clinicalSummary ||
        "",
      icdCode: record.icd10_code || reportData.icdCode || "N/A",
      icdDescription:
        record.icd10_description ||
        reportData.icdDescription ||
        "No ICD description",
      icdCategory:
        record.icd10_category ||
        reportData.icdCategory ||
        "Clinical Diagnosis",
      confidenceScore:
        record.confidence_score ??
        reportData.confidenceScore ??
        uploadDataFromRecord.confidenceScore ??
        0,
      findings:
        (Array.isArray(record.findings) && record.findings.length > 0
          ? record.findings
          : Array.isArray(reportData.findings)
          ? reportData.findings
          : Array.isArray(uploadDataFromRecord.findings)
          ? uploadDataFromRecord.findings
          : []) as string[],
      recommendations:
        (Array.isArray(record.recommendations) && record.recommendations.length > 0
          ? record.recommendations
          : Array.isArray(reportData.recommendations)
          ? reportData.recommendations
          : Array.isArray(uploadDataFromRecord.recommendations)
          ? uploadDataFromRecord.recommendations
          : []) as string[],
      aiModelUsed:
        record.ai_model_used ||
        reportData.aiModelUsed ||
        uploadDataFromRecord.aiModelUsed,
    };
  }, []);

  const refreshAnalysisHistory = useCallback(
    async (doctorName: string) => {
      if (!doctorName) {
        setAnalysisHistory([]);
        return;
      }
      try {
        const records = await reportAPI.list({ doctor_name: doctorName, limit: 200 });
        const mapped = records.map(deserializeReportRecord);
        setAnalysisHistory(mapped);
      } catch (error: any) {
        console.error("Failed to fetch reports", error);
        toast.error(error?.message || "Failed to load saved reports");
      }
    },
    [deserializeReportRecord]
  );

  useEffect(() => {
    if (!currentUser) {
      setAnalysisHistory([]);
      return;
    }
    refreshAnalysisHistory(currentUser);
  }, [currentUser, refreshAnalysisHistory]);

  const handleGetStarted = () => {
    setCurrentPage('dashboard');
    toast.success('Welcome to MediAI!');
  };

  const handleGenerateReport = (data: UploadData) => {
    setUploadData(data);
    setCurrentPage('report');
    toast.success('Analysis complete! Your diagnostic report is ready.');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setCurrentPage('medical-dashboard');
    toast.success(`Welcome back, Dr. ${username}!`);
  };

  const handleLogout = () => {
    setCurrentUser("");
    setCurrentPage('landing');
    toast.info('Logged out successfully');
  };

  const handleSaveReport = async (report: AnalysisReport) => {
    try {
      const doctorName = currentUser || 'Guest User';
      if (!currentUser) {
        toast.info('Saving report as Guest User');
      }

      const payload: ReportPayload = {
        report_uid: report.reportUid,
        patient_uid: report.patientId,
        patient_name: report.patientName,
        doctor_name: doctorName,
        clinical_summary: report.clinicalSummary,
        icd10_code: report.icdCode,
        icd10_description: report.icdDescription,
        icd10_category: report.icdCategory,
        confidence_score: report.confidenceScore,
        findings: report.findings,
        recommendations: report.recommendations,
        image_caption: report.imageCaption,
        ai_model_used: report.aiModelUsed,
        report_data: {
          ...report,
          timestamp: report.timestamp instanceof Date ? report.timestamp.toISOString() : report.timestamp,
        },
      };

      const saved = await reportAPI.create(payload);
      const mapped = deserializeReportRecord(saved);
      setAnalysisHistory((prev) => {
        const filtered = prev.filter((item) => item.reportUid !== mapped.reportUid);
        return [mapped, ...filtered];
      });
      toast.success('Report saved to your history!');
    } catch (error: any) {
      console.error("Failed to save report", error);
      toast.error(error?.message || 'Failed to save report');
    }
  };

  const handleSelectHistoryItem = (report: AnalysisReport) => {
    setUploadData(report.uploadData);
    setCurrentPage('report');
    toast.info('Viewing saved report');
  };

  const handleDeleteReport = async (reportUid: string) => {
    try {
      await reportAPI.delete(reportUid);
      setAnalysisHistory(prev => prev.filter(report => report.reportUid !== reportUid));
      toast.info('Report removed from patient management');
    } catch (error: any) {
      console.error("Failed to delete report", error);
      toast.error(error?.message || 'Failed to delete report');
    }
  };

  const handleOpenPatientManagement = () => {
    if (analysisHistory.length === 0) {
      toast.info('No saved reports yet. Save a report to populate patient management.');
    }
    setCurrentPage('patient-management');
  };

  const handleOpenLogin = () => {
    setShowLoginDialog(true);
  };

  return (
    <>
      {currentPage === 'landing' && (
        <NewLandingPage 
          onGetStarted={handleGetStarted}
          onLogin={handleOpenLogin}
          currentUser={currentUser}
        />
      )}
      
      {currentPage === 'dashboard' && (
        <NewDashboard 
          onGenerateReport={handleGenerateReport}
          onBack={handleBackToLanding}
        />
      )}
      
      {currentPage === 'report' && uploadData && (
        <UnifiedReportPage 
          uploadData={uploadData} 
          onBack={handleBackToDashboard}
          currentUser={currentUser}
          onLogout={handleLogout}
          analysisHistory={analysisHistory}
          onSelectHistoryItem={handleSelectHistoryItem}
          onSaveReport={handleSaveReport}
          onOpenPatientManagement={handleOpenPatientManagement}
        />
      )}

      {currentPage === 'medical-dashboard' && currentUser && (
        <MedicalDashboard 
          onLogout={handleLogout}
          currentUser={currentUser}
        />
      )}

      {currentPage === 'patient-management' && (
        <PatientManagement
          reports={analysisHistory}
          onBack={() => setCurrentPage(uploadData ? 'report' : 'dashboard')}
          onViewReport={handleSelectHistoryItem}
          onDeleteReport={handleDeleteReport}
        />
      )}

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLogin={handleLogin}
      />

      <Toaster position="top-right" />
    </>
  );
}