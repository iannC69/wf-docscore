"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Radio,
  Server,
  Zap,
  Search,
  Lock,
} from "lucide-react";
import { CURRENT_VERSION } from "@/lib/version";

interface MaintenanceScreenProps {
  message?: string;
  estimatedEndTime?: string;
}

export function MaintenanceScreen({
  message = "Wildfire Docs is currently undergoing scheduled platform upgrades and engine optimizations. We'll be back online shortly.",
  estimatedEndTime = "30 minutes",
}: MaintenanceScreenProps) {
  return (
    <div className="maintenance-screen-wrapper">
      <div className="maintenance-card">
        {/* Top Brand & Badge */}
        <div className="maintenance-header">
          <div className="maintenance-brand-icon">
            <img
              src="/logo.png"
              alt="Wildfire Logo"
              className="maintenance-logo-img"
              width={42}
              height={42}
            />
          </div>

          <div className="maintenance-beacon-badge">
            <Radio size={12} className="admin-live-pulse-dot" />
            <span>SYSTEM MAINTENANCE PROTOCOL</span>
          </div>

          <h1 className="maintenance-title">Engine Calibrations in Progress</h1>
          <p className="maintenance-message">{message}</p>
        </div>

        {/* Live Calibration Progress Bar */}
        <div className="maintenance-progress-section">
          <div className="maintenance-progress-label-row">
            <span className="maintenance-progress-task">CALIBRATING CACHE & SEARCH VECTORS</span>
            <span className="maintenance-progress-percent">94%</span>
          </div>
          <div className="maintenance-progress-track">
            <div className="maintenance-progress-bar" />
          </div>
        </div>

        {/* Telemetry Matrix Grid */}
        <div className="maintenance-telemetry-grid">
          <div className="maintenance-telemetry-card">
            <div className="maintenance-telemetry-top">
              <Zap size={14} className="maintenance-telemetry-icon" />
              <span className="maintenance-telemetry-name">Edge Delivery</span>
            </div>
            <span className="maintenance-telemetry-status">Purging ISR Store</span>
          </div>

          <div className="maintenance-telemetry-card">
            <div className="maintenance-telemetry-top">
              <Search size={14} className="maintenance-telemetry-icon" />
              <span className="maintenance-telemetry-name">Search Index</span>
            </div>
            <span className="maintenance-telemetry-status">Rebuilding Vectors</span>
          </div>

          <div className="maintenance-telemetry-card">
            <div className="maintenance-telemetry-top">
              <Lock size={14} className="maintenance-telemetry-icon" />
              <span className="maintenance-telemetry-name">Fortress Auth</span>
            </div>
            <span className="maintenance-telemetry-status">100% Operational</span>
          </div>

          <div className="maintenance-telemetry-card">
            <div className="maintenance-telemetry-top">
              <Server size={14} className="maintenance-telemetry-icon" />
              <span className="maintenance-telemetry-name">Est. Completion</span>
            </div>
            <span className="maintenance-telemetry-status maintenance-telemetry-status--highlight">
              {estimatedEndTime}
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="maintenance-footer">
          <Link href="/admin/login" className="maintenance-admin-btn">
            <span>Enter Administrator Gateway</span>
            <ArrowRight size={14} />
          </Link>

          <div className="maintenance-watermark">
            <ShieldCheck size={13} />
            <span>POWERED BY WF-DOCSCORE v{CURRENT_VERSION} • LIQUID OBSIDIAN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
