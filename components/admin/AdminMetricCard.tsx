import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral" | "positive";
  icon: LucideIcon;
  subtitle?: string;
}

export function AdminMetricCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  subtitle,
}: AdminMetricCardProps) {
  return (
    <div className="admin-metric-card">
      <div className="admin-metric-header">
        <span className="admin-metric-title">{title}</span>
        <span className="admin-metric-icon-box">
          <Icon size={16} />
        </span>
      </div>

      <div className="admin-metric-body">
        <span className="admin-metric-value">{value}</span>
        {change && (
          <span className={`admin-metric-trend admin-metric-trend--${trend}`}>
            {change}
          </span>
        )}
      </div>

      {subtitle && <p className="admin-metric-subtitle">{subtitle}</p>}
    </div>
  );
}
