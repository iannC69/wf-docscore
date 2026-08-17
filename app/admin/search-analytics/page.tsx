"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  TrendingUp,
  AlertTriangle,
  Zap,
  RefreshCw,
  FileQuestion,
  CheckCircle2,
} from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";

interface TopQueryItem {
  query: string;
  count: number;
  resultCount: number;
}

interface SearchLogItem {
  id: string;
  query: string;
  resultCount: number;
  latencyMs: number;
  timestamp: string;
  ip: string;
}

export default function AdminSearchAnalyticsPage() {
  const [data, setData] = useState<{
    totalSearches: number;
    missedCount: number;
    missedRate: number;
    avgLatencyMs: string;
    topQueries: TopQueryItem[];
    recentLogs: SearchLogItem[];
    missedLogs: SearchLogItem[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"top" | "missed" | "recent">("missed");

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/search-analytics");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load search analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="admin-search-analytics-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">DISCOVERY TELEMETRY</div>
          <h1 className="admin-page-title">Search Telemetry & Content Gap Inspector</h1>
          <p className="admin-page-description">
            Analyze user search queries in real time, identify missing documentation articles (0-result searches), and monitor search engine latency.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={loadAnalytics}
            className="admin-btn admin-btn--secondary"
          >
            <RefreshCw size={14} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="admin-metrics-grid">
        <AdminMetricCard
          title="Total Searches Logged"
          value={data?.totalSearches ?? 0}
          change="Real-time"
          trend="neutral"
          icon={Search}
          subtitle="Indexed search requests"
        />

        <AdminMetricCard
          title="0-Result Missed Queries"
          value={data?.missedCount ?? 0}
          change={`${data?.missedRate ?? 0}% miss rate`}
          trend={data && data.missedCount > 0 ? "down" : "positive"}
          icon={AlertTriangle}
          subtitle="Opportunities for new documentation"
        />

        <AdminMetricCard
          title="Avg Search Latency"
          value={`${data?.avgLatencyMs ?? 0}ms`}
          change="Ultra-Fast"
          trend="positive"
          icon={Zap}
          subtitle="In-memory search execution speed"
        />

        <AdminMetricCard
          title="Top Search Volume"
          value={data?.topQueries?.[0]?.count ?? 0}
          change={data?.topQueries?.[0]?.query ? `"${data.topQueries[0].query}"` : "None"}
          trend="neutral"
          icon={TrendingUp}
          subtitle="Most requested subject"
        />
      </div>

      {/* Main Panel */}
      <section className="admin-panel-card">
        <div className="admin-panel-card-header">
          <div className="admin-panel-title-box">
            <Search size={16} className="admin-panel-icon" />
            <h2 className="admin-panel-title">Search Query Stream</h2>
          </div>

          <div className="admin-editor-mode-toggle">
            <button
              type="button"
              onClick={() => setActiveTab("missed")}
              className={`admin-tab-btn ${activeTab === "missed" ? "admin-tab-btn--active" : ""}`}
            >
              <FileQuestion size={13} />
              <span>Missing Content Gaps ({data?.missedCount ?? 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("top")}
              className={`admin-tab-btn ${activeTab === "top" ? "admin-tab-btn--active" : ""}`}
            >
              <TrendingUp size={13} />
              <span>Top Queries</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("recent")}
              className={`admin-tab-btn ${activeTab === "recent" ? "admin-tab-btn--active" : ""}`}
            >
              <Search size={13} />
              <span>All Recent Searches</span>
            </button>
          </div>
        </div>

        <div className="admin-table-wrapper">
          {activeTab === "missed" && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Missed Query (0 Results)</th>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                  <th>Latency</th>
                  <th>Action Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {!data?.missedLogs || data.missedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      No missed search queries recorded! Documentation coverage is optimal.
                    </td>
                  </tr>
                ) : (
                  data.missedLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <strong className="admin-query-missed">"{log.query}"</strong>
                      </td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.ip}</td>
                      <td>{log.latencyMs}ms</td>
                      <td>
                        <a
                          href={`/admin/content?new=true&slug=${encodeURIComponent(
                            log.query.replace(/\s+/g, "-")
                          )}`}
                          className="admin-btn admin-btn--primary admin-btn--sm"
                        >
                          Create Doc Article
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "top" && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Search Query</th>
                  <th>Total Searches</th>
                  <th>Results Returned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {!data?.topQueries || data.topQueries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-table-empty">
                      No search queries recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.topQueries.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong className="admin-user-tag">"{item.query}"</strong>
                      </td>
                      <td>
                        <span className="admin-metric-trend admin-metric-trend--neutral">
                          {item.count} searches
                        </span>
                      </td>
                      <td>{item.resultCount} articles</td>
                      <td>
                        {item.resultCount > 0 ? (
                          <span className="admin-status-pill admin-status-pill--success">
                            Covered
                          </span>
                        ) : (
                          <span className="admin-status-pill admin-status-pill--danger">
                            Missing Doc
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "recent" && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Search Query</th>
                  <th>Results Found</th>
                  <th>Latency</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {!data?.recentLogs || data.recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      No recent searches logged.
                    </td>
                  </tr>
                ) : (
                  data.recentLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="admin-table-time">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td>
                        <span className="admin-user-tag">"{log.query}"</span>
                      </td>
                      <td>
                        {log.resultCount > 0 ? (
                          <span className="admin-status-pill admin-status-pill--success">
                            {log.resultCount} docs
                          </span>
                        ) : (
                          <span className="admin-status-pill admin-status-pill--danger">
                            0 docs
                          </span>
                        )}
                      </td>
                      <td>{log.latencyMs}ms</td>
                      <td>{log.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
