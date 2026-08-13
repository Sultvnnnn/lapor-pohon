export type RiskLevel = "rendah" | "sedang" | "tinggi";

export const getRiskLevel = (score: number): RiskLevel => {
  if (score < 0.33) return "rendah";
  if (score < 0.66) return "sedang";
  return "tinggi";
};

type RiskLevelConfig = {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
};

export const riskLevelConfig: Record<RiskLevel, RiskLevelConfig> = {
  rendah: {
    label: "Risiko Rendah",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-500",
  },
  sedang: {
    label: "Risiko Sedang",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-500",
  },
  tinggi: {
    label: "Risiko Tinggi",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    borderColor: "border-red-500",
  },
};
