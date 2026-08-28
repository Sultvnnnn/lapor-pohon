"use client";

import { ReportForm } from "@/components/reportForm";
import { X, ShieldCheck } from "@phosphor-icons/react";

interface UmkmReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UmkmReportModal = ({
  isOpen,
  onClose,
  onSuccess,
}: UmkmReportModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-white border border-black/10 rounded-[2.25rem] p-6 sm:p-8 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#19382B] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <ShieldCheck weight="bold" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111111] tracking-tight">
                Lapor Pohon Sekitar Usaha UMKM
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#88d937] text-[#111111] inline-block mt-0.5">
                PRIORITAS TERDAMPAK USAHA WARGA
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ecefe6] text-[#111111]/70 hover:text-[#111111] hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
          >
            <X weight="bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container */}
        <ReportForm
          onReportSubmitted={() => {
            if (onSuccess) onSuccess();
            onClose();
          }}
        />
      </div>
    </div>
  );
};
