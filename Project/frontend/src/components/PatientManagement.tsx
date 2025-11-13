import { useMemo, useState } from "react";
import { AnalysisReport } from "./UnifiedReportPage";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  ArrowLeft,
  FileText,
  Search,
  Trash2,
  Users,
  ClipboardList,
  Activity,
} from "lucide-react";

interface PatientManagementProps {
  reports: AnalysisReport[];
  onBack: () => void;
  onViewReport: (report: AnalysisReport) => void;
  onDeleteReport?: (reportUid: string) => void;
}

const formatDateTime = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export function PatientManagement({
  reports,
  onBack,
  onViewReport,
  onDeleteReport,
}: PatientManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { sortedReports, totalPatients, totalReports, latestReport } = useMemo(() => {
    const sorted = [...reports].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const uniquePatients = new Set(sorted.map((report) => report.patientId));

    return {
      sortedReports: sorted,
      totalPatients: uniquePatients.size,
      totalReports: sorted.length,
      latestReport: sorted[0] ?? null,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (!searchTerm.trim()) {
      return sortedReports;
    }
    const term = searchTerm.toLowerCase();
    return sortedReports.filter((report) => {
      return (
        report.patientName.toLowerCase().includes(term) ||
        report.patientId.toLowerCase().includes(term) ||
        report.icdCode.toLowerCase().includes(term) ||
        report.icdDescription.toLowerCase().includes(term)
      );
    });
  }, [sortedReports, searchTerm]);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#F5FAFF" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={onBack}
              className="-ml-2 mb-2"
              style={{ color: "#64748B" }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 style={{ color: "#1B262C" }}>Patient Management</h1>
            <p style={{ color: "#4A5568" }}>
              Review, organize, and access AI-generated diagnostic reports.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className="px-3 py-1 text-sm"
              style={{ backgroundColor: "#E0F2FE", color: "#0077B6" }}
            >
              {totalPatients} {totalPatients === 1 ? "Patient" : "Patients"}
            </Badge>
            <Badge
              className="px-3 py-1 text-sm"
              style={{ backgroundColor: "#BFDBFE", color: "#1B262C" }}
            >
              {totalReports} {totalReports === 1 ? "Report" : "Reports"}
            </Badge>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card
            className="p-5 shadow-sm"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5" style={{ color: "#0077B6" }} />
              <h3 style={{ color: "#1B262C" }}>Patients Managed</h3>
            </div>
            <p className="text-3xl font-semibold" style={{ color: "#1B262C" }}>
              {totalPatients}
            </p>
            <p style={{ color: "#64748B" }}>Unique patient profiles saved</p>
          </Card>

          <Card
            className="p-5 shadow-sm"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <ClipboardList className="w-5 h-5" style={{ color: "#00B4D8" }} />
              <h3 style={{ color: "#1B262C" }}>Total Reports</h3>
            </div>
            <p className="text-3xl font-semibold" style={{ color: "#1B262C" }}>
              {totalReports}
            </p>
            <p style={{ color: "#64748B" }}>
              Saved clinical summaries and imaging analyses
            </p>
          </Card>

          <Card
            className="p-5 shadow-sm"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5" style={{ color: "#0077B6" }} />
              <h3 style={{ color: "#1B262C" }}>Latest Update</h3>
            </div>
            <p className="text-lg font-semibold" style={{ color: "#1B262C" }}>
              {latestReport
                ? latestReport.patientName
                : "No reports saved yet"}
            </p>
            <p style={{ color: "#64748B" }}>
              {latestReport
                ? formatDateTime(latestReport.timestamp)
                : "Reports will appear after you save them from the analysis view."}
            </p>
          </Card>
        </div>

        <Card
          className="p-5 shadow-sm"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2FE" }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: "#0077B6" }} />
              <h2 style={{ color: "#1B262C" }}>Saved Diagnostic Reports</h2>
            </div>
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#94A3B8" }}
              />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by patient, ID, or ICD code"
                className="pl-9"
              />
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div
              className="p-12 text-center rounded-xl border"
              style={{ borderColor: "#E0F2FE", backgroundColor: "#F8FAFC" }}
            >
              <p className="text-lg font-medium" style={{ color: "#1B262C" }}>
                No saved reports found
              </p>
              <p style={{ color: "#64748B" }}>
                {reports.length === 0
                  ? "Generate and save an analysis report to get started."
                  : "Try adjusting your search or clear the filter to see all saved reports."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ color: "#1B262C" }}>
                      Patient
                    </TableHead>
                    <TableHead style={{ color: "#1B262C" }}>
                      Reported On
                    </TableHead>
                    <TableHead style={{ color: "#1B262C" }}>
                      ICD Code
                    </TableHead>
                    <TableHead style={{ color: "#1B262C" }}>
                      Findings Summary
                    </TableHead>
                    <TableHead className="text-right" style={{ color: "#1B262C" }}>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.reportUid ?? report.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium" style={{ color: "#1B262C" }}>
                            {report.patientName}
                          </p>
                          <p className="text-sm" style={{ color: "#64748B" }}>
                            ID: {report.patientId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p style={{ color: "#1B262C" }}>
                          {formatDateTime(report.timestamp)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{ backgroundColor: "#E0F2FE", color: "#0077B6" }}
                        >
                          {report.icdCode}
                        </Badge>
                        <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                          {report.icdDescription}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p
                          className="line-clamp-2 text-sm"
                          style={{ color: "#4A5568" }}
                        >
                          {report.clinicalSummary}
                        </p>
                      </TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewReport(report)}
                          style={{ borderColor: "#0077B6", color: "#0077B6" }}
                        >
                          View Report
                        </Button>
                        {onDeleteReport && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteReport(report.reportUid ?? report.id)}
                            style={{ color: "#EF4444" }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

