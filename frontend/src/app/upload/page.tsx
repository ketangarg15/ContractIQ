"use client";

import React, { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload, FileText, Eye, CheckCircle, X, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContract } from "@/context/ContractContext";
import { uploadContract, getAnalyzeUrl } from "@/lib/api";
import RiskBadge from "@/components/ui/RiskBadge";
import { toast } from "sonner";

type UploadState = "idle" | "selected" | "uploading" | "success";

export default function UploadPage() {
  const router = useRouter();
  const { contracts, refreshContracts, setSelectedContractId } = useContract();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      toast.error("Invalid file type or size. Please upload a PDF or DOCX under 50MB.");
      return;
    }
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadState("selected");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ 
    onDrop,
    noClick: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }
    setUploadState("uploading");
    setProgress(5);
    setCurrentMessage("Uploading contract...");

    try {
      const uploadRes = await uploadContract(selectedFile);
      const contractId = uploadRes.contract_id;
      setProgress(15);
      setCurrentMessage("Contract saved, starting analysis...");

      const sseUrl = getAnalyzeUrl(contractId);
      const eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setCurrentMessage(data.message || data.stage);

          if (data.stage === "classifying") setProgress(20);
          else if (data.stage === "summarizing") setProgress(30);
          else if (data.stage === "extracting clauses") setProgress(45);
          else if (data.stage === "red flags") setProgress(55);
          else if (data.stage === "analyzing risk") setProgress(65);
          else if (data.stage === "obligations") setProgress(75);
          else if (data.stage === "entities") setProgress(80);
          else if (data.stage === "compliance") setProgress(85);
          else if (data.stage === "negotiation") setProgress(90);
          else if (data.stage === "saving") setProgress(95);
          else if (data.stage === "completed") {
            eventSource.close();
            setProgress(100);
            setUploadState("success");
            toast.success("Contract uploaded and analyzed successfully!");
            refreshContracts().then(() => {
              setSelectedContractId(String(contractId));
            });
          } else if (data.stage === "error") {
            eventSource.close();
            setUploadState("selected");
            toast.error(`Analysis failed: ${data.message}`);
          }
        } catch (err) {
          console.error("Error parsing SSE:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE Error:", err);
        eventSource.close();
        setUploadState("selected");
        toast.error("Connection lost during analysis.");
      };

    } catch (err: any) {
      setUploadState("selected");
      toast.error(err.message || "Failed to upload contract.");
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadState("idle");
    setProgress(0);
    setCurrentMessage("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-12">
      {/* Centered Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <h1 className="text-3xl font-semibold text-slate-900">Upload Contract</h1>
        <p className="text-slate-500 text-sm">
          Supports PDF and DOCX. Scanned files will be processed with OCR.
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 sm:p-8 space-y-6">
        
        {uploadState === "idle" && (
          <div 
            {...getRootProps()} 
            className={`max-w-xl mx-auto w-full border-2 border-dashed rounded-xl p-6 sm:p-10 text-center transition-all duration-200 ${
              isDragActive 
                ? "border-[#2563eb] bg-blue-50/50" 
                : "border-zinc-200 bg-zinc-50/50 hover:border-blue-300 hover:bg-zinc-100/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white text-slate-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-5 border border-slate-100 shadow-sm">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-[#2563eb]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
              {isDragActive ? "Drop the files here" : "Drop your contract here"}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-5 sm:mb-6 px-4">
              or click below to browse — PDF, DOCX up to 50MB
            </p>
            <button 
              onClick={open}
              className="px-5 sm:px-6 py-2 sm:py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-[#2563eb] hover:border-blue-200 hover:bg-blue-50 font-semibold rounded-lg text-xs sm:text-sm transition-all duration-200 shadow-sm"
            >
              Select File
            </button>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-medium text-slate-400 mt-5 sm:mt-6">
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> PDF</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> DOCX</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> OCR supported</span>
            </div>
          </div>
        )}

        {uploadState === "selected" && selectedFile && (
          <div className="space-y-6">
            <div className="border border-zinc-200 rounded-xl p-6 bg-zinc-50 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                  <FileText className="w-6 h-6 text-[#2563eb]" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{selectedFile.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || "Document"}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={handleClear}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                className="px-5 py-2.5 bg-[#2563eb] text-white font-semibold rounded-lg text-sm hover:bg-blue-600 shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload & Analyze
              </button>
            </div>
          </div>
        )}

        {uploadState === "uploading" && (
          <div className="space-y-8 py-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{currentMessage}</h3>
                <p className="text-sm text-slate-500">Please do not close this window.</p>
              </div>
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#2563eb] transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {uploadState === "success" && (
          <div className="space-y-8 py-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-2 border border-teal-100">
                <CheckCircle className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Contract Uploaded Successfully</h3>
                <p className="text-sm text-slate-500">AI analysis is complete. Critical risks found.</p>
              </div>
            </div>

            <div className="max-w-md mx-auto bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-800">Review Recommended</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  We identified 2 critical clauses and 3 high-risk deviations from your standard playbook.
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button 
                onClick={handleClear}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-all duration-200"
              >
                Upload Another
              </button>
              <button 
                onClick={() => router.push("/clause-analysis")}
                className="px-5 py-2.5 bg-[#2563eb] text-white font-semibold rounded-lg text-sm hover:bg-blue-600 shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                Continue to Clause Analysis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Uploads Card */}
      {uploadState === "idle" && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-100 bg-zinc-50/50">
            <h4 className="font-semibold text-slate-800 text-sm">Recent Uploads</h4>
          </div>
          <div className="divide-y divide-slate-100">
            {contracts.slice(0, 3).map((contract) => (
              <div key={contract.id} className="p-4 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <FileText className="w-5 h-5 text-slate-400 shrink-0 sm:mt-0 mt-0.5" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full min-w-0 gap-1 sm:gap-6">
                    <span className="font-medium text-slate-700 text-sm truncate block">{contract.name.replace(".pdf", "")}</span>
                    <span className="text-xs sm:text-sm text-slate-400 shrink-0">{contract.effectiveDate}</span>
                  </div>
                </div>
                <div className="w-auto sm:w-24 flex justify-end shrink-0">
                  <RiskBadge level={contract.overallRisk} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

