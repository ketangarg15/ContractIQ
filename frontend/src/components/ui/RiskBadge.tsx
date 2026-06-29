import { RiskLevel } from "@/types";

interface RiskBadgeProps {
  level: RiskLevel;
}

const riskStyles: Record<RiskLevel, string> = {
  Critical: "bg-violet-50 text-violet-700 border-violet-200/60",
  High: "bg-orange-50 text-orange-700 border-orange-200/60",
  Medium: "bg-amber-50 text-amber-700 border-amber-200/60",
  Low: "bg-teal-50 text-teal-700 border-teal-200/60",
};

const dotStyles: Record<RiskLevel, string> = {
  Critical: "bg-violet-500",
  High: "bg-orange-500",
  Medium: "bg-amber-500",
  Low: "bg-teal-500",
};

export default function RiskBadge({ level }: RiskBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${riskStyles[level]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[level]}`} />
      {level}
    </span>
  );
}
