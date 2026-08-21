"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ListTodo,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  User,
  Users,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  MessageSquare,
  CheckSquare,
  Square,
  Trash2,
  Edit3,
  ExternalLink,
  RefreshCw,
  X,
  Send,
  Sliders,
  ShieldCheck,
  Tag,
  ArrowRight,
  TrendingUp,
  Award,
  Check,
  Bell,
  Radio,
  Database,
  CornerDownLeft,
  CheckCheck,
  AtSign,
} from "lucide-react";

import {
  AdminTask,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TaskStats,
  TaskSubtask,
} from "@/types/tasks";
import { PublicTeamMember } from "@/lib/security/teamStore";

// ── Category & Priority Definition Dictionaries ───────────────────────────────

const PRIORITY_META: Record<TaskPriority, { label: string; color: string; bg: string; border: string }> = {
  urgent: { label: "URGENT",  color: "#f43f5e", bg: "hsl(350 89% 60% / 0.14)", border: "hsl(350 89% 60% / 0.35)" },
  high:   { label: "RIDICATĂ", color: "#ff6b00", bg: "hsl(26 100% 52% / 0.14)",  border: "hsl(26 100% 52% / 0.35)" },
  medium: { label: "MEDIE",   color: "#f59e0b", bg: "hsl(43 96% 52% / 0.14)",   border: "hsl(43 96% 52% / 0.35)" },
  low:    { label: "SCĂZUTĂ", color: "#06b6d4", bg: "hsl(186 100% 50% / 0.12)", border: "hsl(186 100% 50% / 0.3)" },
};

const CATEGORY_META: Record<TaskCategory, { label: string; color: string; bg: string }> = {
  docs_creation: { label: "Ghid Nou",            color: "#10b981", bg: "hsl(142 71% 45% / 0.12)" },
  docs_update:   { label: "Actualizare Ghid",    color: "#06b6d4", bg: "hsl(186 100% 50% / 0.12)" },
  review:        { label: "Audit & Verificare",  color: "#a855f7", bg: "hsl(280 100% 65% / 0.12)" },
  media:         { label: "Asset-uri Media",     color: "#f59e0b", bg: "hsl(43 96% 52% / 0.12)" },
  system:        { label: "Mentenanță Sistem",   color: "#6366f1", bg: "hsl(235 85% 65% / 0.12)" },
  bug_fix:       { label: "Rezolvare Eroare",    color: "#f43f5e", bg: "hsl(350 89% 60% / 0.12)" },
};

const STATUS_COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: "todo",        label: "De Făcut (Backlog)",     color: "#94a3b8" },
  { key: "in_progress", label: "În Lucru (Active)",      color: "#06b6d4" },
  { key: "in_review",   label: "În Verificare (Review)", color: "#a855f7" },
  { key: "completed",   label: "Finalizate (Completed)", color: "#10b981" },
];

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [members, setMembers] = useState<PublicTeamMember[]>([]);
  const [docSlugs, setDocSlugs] = useState<{ slug: string; title: string }[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // View & Filters
  const [activeTab, setActiveTab] = useState<"kanban" | "table" | "workload">("kanban");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal Inspector State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);
  const [formTitle, setFormTitle] = useState<string>("");
  const [formDesc, setFormDesc] = useState<string>("");
  const [formPriority, setFormPriority] = useState<TaskPriority>("medium");
  const [formCategory, setFormCategory] = useState<TaskCategory>("docs_update");
  const [formAssignees, setFormAssignees] = useState<string[]>([]);
  const [formTargetDoc, setFormTargetDoc] = useState<string>("");
  const [formDueDate, setFormDueDate] = useState<string>("");
  const [formSubtasks, setFormSubtasks] = useState<TaskSubtask[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState<string>("");
  const [newCommentInput, setNewCommentInput] = useState<string>("");
  const [savingTask, setSavingTask] = useState<boolean>(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/tasks");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setMembers(data.members || []);
        setDocSlugs(data.docSlugs || []);
        setStats(data.stats || null);
        setCurrentUser(data.currentUser || "");
      }
    } catch (err) {
      console.error("[Admin Tasks] Failed to fetch data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (assigneeFilter === "my_tasks" && !t.assignees.includes(currentUser)) return false;
      if (assigneeFilter !== "all" && assigneeFilter !== "my_tasks" && !t.assignees.includes(assigneeFilter)) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchDoc = t.targetDoc?.toLowerCase().includes(q);
        const matchAssignee = t.assignees.some((a) => a.toLowerCase().includes(q));
        return matchTitle || matchDesc || matchDoc || matchAssignee;
      }
      return true;
    });
  }, [tasks, assigneeFilter, priorityFilter, categoryFilter, searchQuery, currentUser]);

  // Open modal for new task or editing
  const openCreateModal = () => {
    setEditingTask(null);
    setFormTitle("");
    setFormDesc("");
    setFormPriority("medium");
    setFormCategory("docs_update");
    setFormAssignees(currentUser ? [currentUser] : []);
    setFormTargetDoc("");
    setFormDueDate("");
    setFormSubtasks([]);
    setNewSubtaskInput("");
    setNewCommentInput("");
    setModalOpen(true);
  };

  const openEditModal = (task: AdminTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || "");
    setFormPriority(task.priority);
    setFormCategory(task.category);
    setFormAssignees(task.assignees || []);
    setFormTargetDoc(task.targetDoc || "");
    setFormDueDate(task.dueDate || "");
    setFormSubtasks(task.subtasks || []);
    setNewSubtaskInput("");
    setNewCommentInput("");
    setModalOpen(true);
  };

  // Subtask handlers inside modal
  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setFormSubtasks((prev) => [
      ...prev,
      {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: newSubtaskInput.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskInput("");
  };

  const handleToggleSubtaskInModal = (id: string) => {
    setFormSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtaskInModal = (id: string) => {
    setFormSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  // Save / Update Task
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || savingTask) return;

    setSavingTask(true);
    try {
      if (editingTask) {
        // PATCH
        const res = await fetch("/api/admin/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingTask.id,
            updates: {
              title: formTitle.trim(),
              description: formDesc.trim(),
              priority: formPriority,
              category: formCategory,
              assignees: formAssignees,
              targetDoc: formTargetDoc.trim() || undefined,
              dueDate: formDueDate || undefined,
              subtasks: formSubtasks,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? data.task : t)));
          setModalOpen(false);
        }
      } else {
        // POST
        const res = await fetch("/api/admin/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle.trim(),
            description: formDesc.trim(),
            priority: formPriority,
            category: formCategory,
            assignees: formAssignees,
            targetDoc: formTargetDoc.trim() || undefined,
            dueDate: formDueDate || undefined,
            subtasks: formSubtasks,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setTasks((prev) => [data.task, ...prev]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Failed to save task", err);
    } finally {
      setSavingTask(false);
    }
  };

  // Quick Status Transition (e.g. Advance on Kanban)
  const handleMoveStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          updates: { status: newStatus },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
      }
    } catch (err) {
      console.error("Failed to move task status", err);
    }
  };

  // Toggle Subtask Direct on card
  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          action: "toggle_subtask",
          subtaskId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
      }
    } catch (err) {
      console.error("Failed to toggle subtask", err);
    }
  };

  // Add Comment on Task
  const handleAddComment = async (taskId: string) => {
    if (!newCommentInput.trim()) return;
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          action: "add_comment",
          comment: newCommentInput.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
        if (editingTask && editingTask.id === taskId) {
          setEditingTask(data.task);
        }
        setNewCommentInput("");
      }
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Sigur dorești să ștergi această sarcină?")) return;
    try {
      const res = await fetch(`/api/admin/tasks?id=${encodeURIComponent(taskId)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        if (editingTask?.id === taskId) setModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  // Assignee toggle helper
  const toggleAssignee = (username: string) => {
    setFormAssignees((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]
    );
  };

  // Helper to find member avatar
  const getMemberAvatar = (username: string) => {
    const m = members.find((mem) => mem.username.toLowerCase() === username.toLowerCase());
    return m?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`;
  };

  // Helper to insert @mention in chat input
  const handleInsertMention = (username: string) => {
    setNewCommentInput((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return `@${username} `;
      return `${trimmed} @${username} `;
    });
  };

  // Helper to render chat message text with highlighted @mentions
  const renderChatTextWithMentions = (text: string) => {
    const parts = text.split(/(@[a-zA-Z0-9_-]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const u = part.substring(1);
        const isTarget = members.some((m) => m.username.toLowerCase() === u.toLowerCase());
        if (isTarget) {
          return (
            <span key={index} className="admin-chat-mention-tag">
              {part}
            </span>
          );
        }
      }
      return part;
    });
  };

  return (
    <div className="admin-page-container">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-pretitle-tag">
            <ListTodo size={11} className="text-orange-400" />
            <span>TASK HUB &amp; WORKFLOW MANAGER</span>
          </div>
          <h1 className="admin-page-title">Gestiune Sarcini &amp; TODO Echipă</h1>
          <p className="admin-page-desc">
            Asignare, organizare pe Kanban și urmărire a ghidurilor și cerințelor echipei WildFire Docs.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="admin-btn admin-btn--secondary"
            title="Reîncarcă datele"
          >
            <RefreshCw size={13} className={refreshing ? "admin-spin" : ""} />
            <span>{refreshing ? "Actualizare..." : "Sincronizează"}</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="admin-btn admin-btn--primary"
          >
            <Plus size={14} />
            <span>Adaugă Sarcină Nouă</span>
          </button>
        </div>
      </div>

      {/* ── KPI Metric Grid ─────────────────────────────────────────────── */}
      <div className="admin-db-kpi-grid">
        <div className="admin-db-kpi-card">
          <div className="admin-db-kpi-header">
            <span className="admin-db-kpi-title">Total Sarcini Înregistrate</span>
            <div className="admin-db-kpi-icon-box admin-db-kpi-icon-box--cyan">
              <ListTodo size={16} />
            </div>
          </div>
          <div className="admin-db-kpi-body">
            <span className="admin-db-kpi-value admin-db-kpi-value--cyan">
              {stats?.total || tasks.length}
            </span>
            <span className="admin-db-kpi-badge admin-db-kpi-badge--cyan">
              <TrendingUp size={10} /> Active
            </span>
          </div>
          <p className="admin-db-kpi-subtitle">Flux complet de redactare și audit</p>
        </div>

        <div className="admin-db-kpi-card">
          <div className="admin-db-kpi-header">
            <span className="admin-db-kpi-title">În Lucru / De Făcut</span>
            <div className="admin-db-kpi-icon-box admin-db-kpi-icon-box--amber">
              <Clock size={16} />
            </div>
          </div>
          <div className="admin-db-kpi-body">
            <span className="admin-db-kpi-value admin-db-kpi-value--amber">
              {(stats?.inProgress || 0) + (stats?.todo || 0)}
            </span>
            <span className="admin-db-kpi-badge admin-db-kpi-badge--amber">
              {stats?.inProgress || 0} În Lucru
            </span>
          </div>
          <p className="admin-db-kpi-subtitle">{stats?.todo || 0} sarcini în așteptare backlog</p>
        </div>

        <div className="admin-db-kpi-card">
          <div className="admin-db-kpi-header">
            <span className="admin-db-kpi-title">Rată de Finalizare</span>
            <div className="admin-db-kpi-icon-box admin-db-kpi-icon-box--emerald">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="admin-db-kpi-body">
            <span className="admin-db-kpi-value admin-db-kpi-value--emerald">
              {stats?.completionRate || 0}%
            </span>
            <span className="admin-db-kpi-badge admin-db-kpi-badge--emerald">
              {stats?.completed || 0} Finalizate
            </span>
          </div>
          <p className="admin-db-kpi-subtitle">Eficiența generală de completare a echipei</p>
        </div>

        <div className="admin-db-kpi-card">
          <div className="admin-db-kpi-header">
            <span className="admin-db-kpi-title">Sarcini Urgente</span>
            <div className="admin-db-kpi-icon-box" style={{ background: "hsl(350 89% 60% / 0.12)", color: "#f43f5e", borderColor: "hsl(350 89% 60% / 0.3)" }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="admin-db-kpi-body">
            <span className="admin-db-kpi-value" style={{ color: "#f43f5e" }}>
              {stats?.urgentCount || 0}
            </span>
            <span className="admin-db-kpi-badge" style={{ background: "hsl(350 89% 60% / 0.15)", color: "#fda4af" }}>
              Prioritate 1
            </span>
          </div>
          <p className="admin-db-kpi-subtitle">Necesită atenție prioritară imediată</p>
        </div>
      </div>

      {/* ── View Navigation Tabs & Filters ───────────────────────────────── */}
      <div className="admin-tasks-top-bar">
        <div className="admin-tasks-views-nav">
          <button
            type="button"
            onClick={() => setActiveTab("kanban")}
            className={`admin-tasks-view-btn ${activeTab === "kanban" ? "admin-tasks-view-btn--active" : ""}`}
          >
            <Layers size={14} />
            <span>Panou Kanban</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className={`admin-tasks-view-btn ${activeTab === "table" ? "admin-tasks-view-btn--active" : ""}`}
          >
            <CheckSquare size={14} />
            <span>Tabel Structurat</span>
            <span className="admin-tasks-tab-badge">{filteredTasks.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("workload")}
            className={`admin-tasks-view-btn ${activeTab === "workload" ? "admin-tasks-view-btn--active" : ""}`}
          >
            <Users size={14} />
            <span>Workload Echipă</span>
          </button>
        </div>

        {/* Global Toolbar Filters */}
        <div className="admin-tasks-filters-row">
          <div className="admin-tasks-search-wrap">
            <Search size={13} className="text-zinc-500" />
            <input
              type="text"
              placeholder="Caută sarcini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-tasks-search-input"
            />
          </div>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="admin-tasks-select"
          >
            <option value="all">Toți Membrii</option>
            {currentUser && <option value="my_tasks">Doar ale mele (@{currentUser})</option>}
            {members.map((m) => (
              <option key={m.username} value={m.username}>
                @{m.username} ({m.displayName})
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="admin-tasks-select"
          >
            <option value="all">Toate Prioritățile</option>
            <option value="urgent">Urgent</option>
            <option value="high">Ridicată</option>
            <option value="medium">Medie</option>
            <option value="low">Scăzută</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-tasks-select"
          >
            <option value="all">Toate Categoriile</option>
            <option value="docs_creation">Ghid Nou</option>
            <option value="docs_update">Actualizare Ghid</option>
            <option value="review">Audit &amp; Review</option>
            <option value="media">Asset-uri Media</option>
            <option value="system">Mentenanță Sistem</option>
            <option value="bug_fix">Rezolvare Eroare</option>
          </select>
        </div>
      </div>

      {/* ── TAB 1: KANBAN BOARD VIEW ─────────────────────────────────────── */}
      {activeTab === "kanban" && (
        <div className="admin-kanban-board">
          {STATUS_COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);

            return (
              <div key={col.key} className="admin-kanban-col">
                <div className="admin-kanban-col-header" style={{ borderColor: `${col.color}40` }}>
                  <div className="admin-kanban-col-title-group">
                    <span className="admin-kanban-col-dot" style={{ background: col.color }} />
                    <h3 className="admin-kanban-col-title">{col.label}</h3>
                  </div>
                  <span className="admin-kanban-col-count" style={{ color: col.color, borderColor: `${col.color}30` }}>
                    {colTasks.length}
                  </span>
                </div>

                <div className="admin-kanban-cards-stack">
                  {colTasks.length === 0 ? (
                    <div className="admin-kanban-empty-slot">
                      <span>Nicio sarcină în această coloană</span>
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const priority = PRIORITY_META[task.priority];
                      const category = CATEGORY_META[task.category];
                      const subtasksDone = task.subtasks?.filter((s) => s.completed).length || 0;
                      const subtasksTotal = task.subtasks?.length || 0;

                      return (
                        <div
                          key={task.id}
                          className="admin-kanban-card"
                          style={{
                            "--card-priority-border": priority.border,
                            "--card-priority-glow": `${priority.color}15`,
                          } as React.CSSProperties}
                        >
                          {/* Priority Indicator Line */}
                          <div className="admin-kanban-card-top-line" style={{ background: priority.color }} />

                          {/* Header Tags */}
                          <div className="admin-kanban-card-meta-row">
                            <span
                              className="admin-task-pill"
                              style={{ color: category.color, background: category.bg, borderColor: `${category.color}35` }}
                            >
                              {category.label}
                            </span>
                            <span
                              className="admin-task-pill"
                              style={{ color: priority.color, background: priority.bg, borderColor: priority.border }}
                            >
                              {priority.label}
                            </span>
                          </div>

                          {/* Task Title & Description */}
                          <h4
                            className="admin-kanban-card-title"
                            onClick={() => openEditModal(task)}
                            title="Click pentru a edita sau vedea detalii"
                          >
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="admin-kanban-card-desc">{task.description}</p>
                          )}

                          {/* Target Doc Link */}
                          {task.targetDoc && (
                            <a
                              href={`/docs/${task.targetDoc}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-kanban-doc-pill"
                            >
                              <BookOpen size={10} className="text-cyan-400" />
                              <span>/docs/{task.targetDoc}</span>
                              <ExternalLink size={9} className="opacity-50" />
                            </a>
                          )}

                          {/* Subtasks Progress */}
                          {subtasksTotal > 0 && (
                            <div className="admin-kanban-subtasks-preview">
                              <div className="admin-kanban-subtasks-header">
                                <span className="admin-kanban-subtasks-lbl">
                                  <CheckSquare size={11} className="text-emerald-400" />
                                  {subtasksDone}/{subtasksTotal} Subtask-uri
                                </span>
                                <span className="admin-kanban-subtasks-pct">
                                  {Math.round((subtasksDone / subtasksTotal) * 100)}%
                                </span>
                              </div>
                              <div className="admin-kanban-progress-track">
                                <div
                                  className="admin-kanban-progress-fill"
                                  style={{
                                    width: `${(subtasksDone / subtasksTotal) * 100}%`,
                                    background: subtasksDone === subtasksTotal ? "#10b981" : "#06b6d4",
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Card Footer: Assignees & Dates */}
                          <div className="admin-kanban-card-footer">
                            <div className="admin-kanban-assignees-strip">
                              {task.assignees.length === 0 ? (
                                <span className="admin-kanban-unassigned">Neasignat</span>
                              ) : (
                                task.assignees.map((u) => (
                                  <div
                                    key={u}
                                    className="admin-kanban-avatar-wrap"
                                    title={`Asignat lui @${u}`}
                                  >
                                    <img
                                      src={getMemberAvatar(u)}
                                      alt={u}
                                      className="admin-kanban-avatar-img"
                                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://cdn.discordapp.com/embed/avatars/0.png"; }}
                                    />
                                  </div>
                                ))
                              )}
                            </div>

                            {task.dueDate && (
                              <span className="admin-kanban-due-chip">
                                <Calendar size={10} />
                                {task.dueDate}
                              </span>
                            )}

                            {task.comments && task.comments.length > 0 && (
                              <span className="admin-kanban-chat-chip" title={`${task.comments.length} note în discuție`}>
                                <MessageSquare size={10} />
                                {task.comments.length}
                              </span>
                            )}
                          </div>

                          {/* Quick Status Transition Actions */}
                          <div className="admin-kanban-quick-actions">
                            {col.key !== "todo" && (
                              <button
                                type="button"
                                onClick={() => handleMoveStatus(task.id, col.key === "completed" ? "in_review" : col.key === "in_review" ? "in_progress" : "todo")}
                                className="admin-kanban-move-btn"
                                title="Mută înapoi"
                              >
                                <ChevronLeft size={12} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => openEditModal(task)}
                              className="admin-kanban-edit-btn"
                            >
                              <Edit3 size={11} /> Detalii
                            </button>

                            {col.key !== "completed" && (
                              <button
                                type="button"
                                onClick={() => handleMoveStatus(task.id, col.key === "todo" ? "in_progress" : col.key === "in_progress" ? "in_review" : "completed")}
                                className="admin-kanban-move-btn"
                                title="Avasează status"
                              >
                                <ChevronRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 2: STRUCTURED TABLE VIEW ─────────────────────────────────── */}
      {activeTab === "table" && (
        <div className="admin-panel-card">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "130px" }}>Status</th>
                  <th style={{ width: "110px" }}>Prioritate</th>
                  <th style={{ width: "130px" }}>Categorie</th>
                  <th>Titlu &amp; Descriere Sarcină</th>
                  <th style={{ width: "160px" }}>Membru Asignat</th>
                  <th style={{ width: "120px" }}>Termen Limită</th>
                  <th style={{ textAlign: "right", width: "110px" }}>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-table-empty">
                      <ListTodo size={24} style={{ margin: "0 auto 8px", opacity: 0.35 }} />
                      <p>Nicio sarcină nu corespunde filtrelor selectate.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const priority = PRIORITY_META[task.priority];
                    const category = CATEGORY_META[task.category];
                    const col = STATUS_COLUMNS.find((c) => c.key === task.status);

                    return (
                      <tr key={task.id}>
                        <td>
                          <select
                            value={task.status}
                            onChange={(e) => handleMoveStatus(task.id, e.target.value as TaskStatus)}
                            className="admin-table-status-select"
                            style={{ color: col?.color, borderColor: `${col?.color}40` }}
                          >
                            <option value="todo">De Făcut</option>
                            <option value="in_progress">În Lucru</option>
                            <option value="in_review">În Review</option>
                            <option value="completed">Finalizat</option>
                          </select>
                        </td>
                        <td>
                          <span
                            className="admin-status-pill"
                            style={{ color: priority.color, background: priority.bg, borderColor: priority.border, fontSize: "0.68rem" }}
                          >
                            {priority.label}
                          </span>
                        </td>
                        <td>
                          <span
                            className="admin-status-pill"
                            style={{ color: category.color, background: category.bg, borderColor: `${category.color}35`, fontSize: "0.68rem" }}
                          >
                            {category.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span
                              style={{ fontWeight: 700, color: "#f8fafc", cursor: "pointer" }}
                              onClick={() => openEditModal(task)}
                            >
                              {task.title}
                            </span>
                            {task.targetDoc && (
                              <a
                                href={`/docs/${task.targetDoc}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-perm-tag admin-perm-tag--cyan"
                                style={{ width: "fit-content", textDecoration: "none", fontSize: "0.68rem", padding: "1px 6px" }}
                              >
                                <BookOpen size={9} />
                                /docs/{task.targetDoc}
                              </a>
                            )}
                            {task.comments && task.comments.length > 0 && (
                              <span className="admin-perm-tag admin-perm-tag--purple" style={{ fontSize: "0.65rem", padding: "1px 6px", width: "fit-content" }}>
                                <MessageSquare size={9} />
                                {task.comments.length} {task.comments.length === 1 ? "notă" : "note"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            {task.assignees.length === 0 ? (
                              <span className="admin-table-muted">—</span>
                            ) : (
                              task.assignees.map((u) => (
                                <span
                                  key={u}
                                  className="admin-perm-tag admin-perm-tag--blue"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  @{u}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="admin-table-mono admin-table-muted" style={{ fontSize: "0.74rem" }}>
                            {task.dueDate || "—"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => openEditModal(task)}
                              className="admin-btn admin-btn--secondary"
                              style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                              title="Editează"
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="admin-feedback-delete-action"
                              title="Șterge"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: TEAM WORKLOAD & CAPACITY ──────────────────────────────── */}
      {activeTab === "workload" && (
        <div className="admin-workload-grid">
          {members.map((member) => {
            const memberTasks = tasks.filter((t) => t.assignees.includes(member.username));
            const activeCount = memberTasks.filter((t) => t.status !== "completed").length;
            const completedCount = memberTasks.filter((t) => t.status === "completed").length;
            const urgentCount = memberTasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;
            const rate = memberTasks.length > 0 ? Math.round((completedCount / memberTasks.length) * 100) : 100;

            return (
              <div key={member.id || member.username} className="admin-workload-card">
                <div className="admin-workload-header">
                  <div className="admin-workload-user-info">
                    <img
                      src={member.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${member.username}`}
                      alt={member.displayName}
                      className="admin-workload-avatar"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://cdn.discordapp.com/embed/avatars/0.png"; }}
                    />
                    <div>
                      <h4 className="admin-workload-name">{member.displayName}</h4>
                      <span className="admin-workload-handle">@{member.username}</span>
                    </div>
                  </div>

                  <span className="admin-perm-tag admin-perm-tag--orange">
                    {activeCount} Sarcini Active
                  </span>
                </div>

                {/* Capacity Meter */}
                <div className="admin-workload-meter-box">
                  <div className="admin-workload-meter-header">
                    <span className="admin-workload-meter-label">Completare Sarcini Asignate</span>
                    <span className="admin-workload-meter-pct">{rate}%</span>
                  </div>
                  <div className="admin-workload-track">
                    <div
                      className="admin-workload-fill"
                      style={{
                        width: `${rate}%`,
                        background: rate === 100 ? "#10b981" : "linear-gradient(90deg, #ff6b00, #f59e0b)",
                      }}
                    />
                  </div>
                </div>

                {/* Quick stats strip */}
                <div className="admin-workload-stats-row">
                  <div className="admin-workload-stat-chip">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span>{completedCount} Finalizate</span>
                  </div>
                  {urgentCount > 0 && (
                    <div className="admin-workload-stat-chip" style={{ color: "#fda4af", borderColor: "hsl(350 89% 60% / 0.3)" }}>
                      <AlertTriangle size={11} className="text-rose-400" />
                      <span>{urgentCount} Urgente</span>
                    </div>
                  )}
                </div>

                {/* Top upcoming tasks */}
                <div className="admin-workload-tasks-list">
                  <span className="admin-workload-section-lbl">Sarcini curente:</span>
                  {memberTasks.filter((t) => t.status !== "completed").slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="admin-workload-task-item"
                      onClick={() => openEditModal(t)}
                    >
                      <span
                        className="admin-workload-task-dot"
                        style={{ background: PRIORITY_META[t.priority].color }}
                      />
                      <span className="admin-workload-task-title">{t.title}</span>
                      <ChevronRight size={11} className="opacity-40" />
                    </div>
                  ))}
                  {memberTasks.filter((t) => t.status !== "completed").length === 0 && (
                    <span className="admin-workload-all-clear">
                      Toate sarcinile sunt finalizate!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TASK INSPECTOR & CREATE/EDIT MODAL ───────────────────────────── */}
      {modalOpen && (
        <div className="doc-report-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="doc-report-modal"
            style={{ maxWidth: "620px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="doc-report-glow" />

            <div className="doc-report-header">
              <div className="doc-report-header-title-box">
                <div className="doc-report-header-icon-wrap" style={{ color: "#ff6b00", borderColor: "hsl(26 100% 52% / 0.3)" }}>
                  <ListTodo size={18} />
                </div>
                <div>
                  <h3 className="doc-report-title">
                    {editingTask ? "Inspector & Editare Sarcină" : "Creează Sarcină Nouă"}
                  </h3>
                  <p className="doc-report-sub">
                    {editingTask ? `ID: ${editingTask.id} · Creat de @${editingTask.assignedBy}` : "Asignează obiective și ghiduri echipei de documentație"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="doc-report-close-btn"
                onClick={() => setModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="doc-report-form">
              {/* Title Field */}
              <div className="doc-report-field">
                <label className="doc-report-label">Titlul Sarcinii *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Actualizare ghid Anti-Rush cu noile penalizări"
                  className="doc-report-input"
                  maxLength={120}
                />
              </div>

              {/* Priority & Category Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="doc-report-field">
                  <label className="doc-report-label">Prioritate</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="admin-tasks-select"
                    style={{ width: "100%", padding: "9px 12px" }}
                  >
                    <option value="urgent">Urgent (Critic)</option>
                    <option value="high">Ridicată</option>
                    <option value="medium">Medie</option>
                    <option value="low">Scăzută</option>
                  </select>
                </div>

                <div className="doc-report-field">
                  <label className="doc-report-label">Categorie</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
                    className="admin-tasks-select"
                    style={{ width: "100%", padding: "9px 12px" }}
                  >
                    <option value="docs_creation">Ghid Nou</option>
                    <option value="docs_update">Actualizare Ghid</option>
                    <option value="review">Audit &amp; Review</option>
                    <option value="media">Asset-uri Media</option>
                    <option value="system">Mentenanță Sistem</option>
                    <option value="bug_fix">Rezolvare Eroare</option>
                  </select>
                </div>
              </div>

              {/* Assignee Multi-Picker */}
              <div className="doc-report-field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label className="doc-report-label" style={{ margin: 0 }}>
                    <Users size={12} className="text-blue-400" />
                    Membri Asignați
                  </label>
                  <span className="admin-micro-pill" style={{ color: "#38bdf8", background: "hsl(190 90% 50% / 0.12)", borderColor: "hsl(190 90% 50% / 0.35)" }}>
                    <Bell size={10} /> Ping Direct Discord
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {members.map((m) => {
                    const isSelected = formAssignees.includes(m.username);
                    const hasDiscord = Boolean(m.discord && /^\d+$/.test(m.discord.trim()));
                    return (
                      <button
                        key={m.username}
                        type="button"
                        onClick={() => toggleAssignee(m.username)}
                        className={`doc-report-pill-choice ${isSelected ? "doc-report-pill-choice--active" : ""}`}
                        style={isSelected ? { borderColor: "#3b82f6", color: "#60a5fa", background: "hsl(215 90% 60% / 0.15)" } : undefined}
                      >
                        <img
                          src={m.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${m.username}`}
                          alt={m.displayName}
                          style={{ width: "16px", height: "16px", borderRadius: "50%" }}
                        />
                        <span>@{m.displayName || m.username}</span>
                        {hasDiscord && (
                          <span style={{ fontSize: "0.6rem", opacity: 0.75, fontFamily: "var(--font-mono)", color: isSelected ? "#93c5fd" : "#a1a1aa" }}>
                            • #{m.discord?.slice(0, 4)}
                          </span>
                        )}
                        {isSelected && <Check size={11} />}
                      </button>
                    );
                  })}
                </div>

                <p className="admin-form-help" style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "5px", color: "var(--color-text-tertiary)" }}>
                  <Radio size={10} className="text-cyan-400" />
                  <span>Membrii selectați primesc automat notificare și ping direct pe Discord (<code style={{ color: "#fb923c" }}>&lt;@Discord_ID&gt;</code>) prin Webhook.</span>
                </p>
              </div>

              {/* Target Doc & Due Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "12px" }}>
                <div className="doc-report-field">
                  <label className="doc-report-label">
                    <BookOpen size={12} className="text-cyan-400" />
                    Ghid Asociat (Opțional)
                  </label>
                  <input
                    type="text"
                    list="docs-slugs-list"
                    value={formTargetDoc}
                    onChange={(e) => setFormTargetDoc(e.target.value)}
                    placeholder="Ex: systems/other/anti-rush"
                    className="doc-report-input"
                  />
                  <datalist id="docs-slugs-list">
                    {docSlugs.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.title}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div className="doc-report-field">
                  <label className="doc-report-label">
                    <Calendar size={12} className="text-amber-400" />
                    Termen Limită (Due Date)
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="doc-report-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="doc-report-field">
                <label className="doc-report-label">Descriere &amp; Cerințe Detaliate</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Instrucțiuni specifice pentru membrii desemnați..."
                  className="doc-report-textarea"
                />
              </div>

              {/* Subtasks Checklist Builder */}
              <div className="doc-report-field">
                <label className="doc-report-label">
                  <CheckSquare size={12} className="text-emerald-400" />
                  Checklist Subtask-uri ({formSubtasks.filter((s) => s.completed).length}/{formSubtasks.length})
                </label>

                {formSubtasks.length > 0 && (
                  <div className="admin-modal-subtasks-list">
                    {formSubtasks.map((st) => (
                      <div key={st.id} className="admin-modal-subtask-row">
                        <button
                          type="button"
                          onClick={() => handleToggleSubtaskInModal(st.id)}
                          className="admin-modal-subtask-toggle"
                        >
                          {st.completed ? (
                            <CheckSquare size={14} className="text-emerald-400" />
                          ) : (
                            <Square size={14} className="text-zinc-500" />
                          )}
                          <span style={{ textDecoration: st.completed ? "line-through" : "none", color: st.completed ? "#94a3b8" : "#f1f5f9" }}>
                            {st.title}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtaskInModal(st.id)}
                          className="admin-modal-subtask-del"
                          title="Elimină subtask"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSubtask(); } }}
                    placeholder="Adaugă un pas în checklist..."
                    className="doc-report-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="admin-btn admin-btn--secondary"
                    style={{ padding: "0 14px", flexShrink: 0 }}
                  >
                    <Plus size={13} />
                    <span>Adaugă</span>
                  </button>
                </div>
              </div>

              {/* Comments / Discussion Thread (Chat Style) */}
              {editingTask && (
                <div className="admin-chat-section">
                  <div className="admin-chat-header">
                    <div className="admin-chat-title-row">
                      <MessageSquare size={13} className="text-purple-400" />
                      <span className="admin-chat-title">Note &amp; Discuție</span>
                      <span className="admin-chat-badge">{editingTask.comments?.length || 0}</span>
                    </div>
                    <div className="admin-chat-db-tag">
                      <Database size={10} />
                      <span>Persistent DB</span>
                    </div>
                  </div>

                  <div className="admin-chat-timeline">
                    {(!editingTask.comments || editingTask.comments.length === 0) ? (
                      <div className="admin-chat-empty">
                        <div className="admin-chat-empty-icon">
                          <MessageSquare size={20} />
                        </div>
                        <p className="admin-chat-empty-title">Nicio notă adăugată încă</p>
                        <span className="admin-chat-empty-sub">
                          Fii primul care lasă un update, o cerință tehnică sau o notă de progres. Toate mesajele se salvează automat în baza de date.
                        </span>
                      </div>
                    ) : (
                      editingTask.comments.map((c) => {
                        const isMe = c.author.toLowerCase() === (currentUser || "").toLowerCase();
                        const memberInfo = members.find((m) => m.username.toLowerCase() === c.author.toLowerCase());
                        const isRoot = memberInfo?.isRoot || c.author.toLowerCase() === "iannc69" || c.author.toLowerCase() === "iannc";
                        return (
                          <div
                            key={c.id}
                            className={`admin-chat-message-row ${isMe ? "admin-chat-message-row--me" : "admin-chat-message-row--other"}`}
                          >
                            {!isMe && (
                              <div className="admin-chat-avatar-wrap">
                                {c.avatarUrl || memberInfo?.avatarUrl ? (
                                  <img
                                    src={c.avatarUrl || memberInfo?.avatarUrl}
                                    alt={c.author}
                                    className="admin-chat-avatar"
                                  />
                                ) : (
                                  <div
                                    className="admin-chat-avatar admin-chat-avatar--initials"
                                    style={{ background: memberInfo?.avatarColor || "hsl(280 100% 65%)" }}
                                  >
                                    {c.author[0].toUpperCase()}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="admin-chat-bubble-wrap">
                              <div className="admin-chat-bubble-header">
                                <span className="admin-chat-bubble-author">
                                  {memberInfo?.displayName || `@${c.author}`}
                                </span>
                                {isRoot && <span className="adx-badge adx-badge--orange" style={{ fontSize: "0.55rem", padding: "1px 5px" }}>ROOT</span>}
                                <span className="admin-chat-bubble-time">
                                  {new Date(c.createdAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })} · {new Date(c.createdAt).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}
                                </span>
                              </div>
                              <div className={`admin-chat-bubble ${isMe ? "admin-chat-bubble--me" : "admin-chat-bubble--other"}`}>
                                <p className="admin-chat-text">{renderChatTextWithMentions(c.text)}</p>
                              </div>
                              <div className="admin-chat-bubble-footer">
                                <span className="admin-chat-synced-pill">
                                  <CheckCheck size={10} className="text-emerald-400" />
                                  <span>Salvat în DB</span>
                                </span>
                              </div>
                            </div>

                            {isMe && (
                              <div className="admin-chat-avatar-wrap">
                                {memberInfo?.avatarUrl ? (
                                  <img
                                    src={memberInfo?.avatarUrl}
                                    alt={c.author}
                                    className="admin-chat-avatar"
                                  />
                                ) : (
                                  <div
                                    className="admin-chat-avatar admin-chat-avatar--initials"
                                    style={{ background: memberInfo?.avatarColor || "hsl(26 100% 52%)" }}
                                  >
                                    {c.author[0].toUpperCase()}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Quick Mention Picker */}
                  <div className="admin-chat-mention-bar">
                    <span className="admin-chat-mention-bar-label">
                      <AtSign size={11} className="text-purple-400" />
                      <span>Tag responsabil:</span>
                    </span>
                    <div className="admin-chat-mention-pills">
                      {members.map((m) => {
                        const isAssigned = editingTask.assignees?.includes(m.username);
                        return (
                          <button
                            key={m.username}
                            type="button"
                            onClick={() => handleInsertMention(m.username)}
                            className={`admin-chat-mention-pill ${isAssigned ? "admin-chat-mention-pill--assigned" : ""}`}
                            title={`Dă tag lui @${m.displayName || m.username} pentru ping direct Discord pe #notificari`}
                          >
                            <AtSign size={9} />
                            <span>{m.displayName || m.username}</span>
                            {isAssigned && <span className="admin-chat-mention-assigned-dot" title="Responsabil asignat pe sarcină" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chat Input Box */}
                  <div className="admin-chat-input-box">
                    <div className="admin-chat-input-inner">
                      <input
                        type="text"
                        value={newCommentInput}
                        onChange={(e) => setNewCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddComment(editingTask.id);
                          }
                        }}
                        placeholder="Scrie o notă sau un update... (Enter pentru trimitere)"
                        className="admin-chat-input"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(editingTask.id)}
                        disabled={!newCommentInput.trim()}
                        className="admin-chat-send-btn"
                        title="Trimite și salvează în DB"
                      >
                        <Send size={13} />
                        <span>Trimite</span>
                      </button>
                    </div>
                    <div className="admin-chat-input-hint">
                      <CornerDownLeft size={10} />
                      <span>Apasă <strong>Enter</strong> pentru a salva nota în timp real pe sarcină.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="doc-report-actions">
                {editingTask && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(editingTask.id)}
                    className="admin-btn admin-btn--danger"
                    style={{ marginRight: "auto" }}
                  >
                    <Trash2 size={13} />
                    <span>Șterge</span>
                  </button>
                )}

                <button
                  type="button"
                  className="doc-report-cancel-btn"
                  onClick={() => setModalOpen(false)}
                >
                  Anulează
                </button>

                <button
                  type="submit"
                  disabled={savingTask || !formTitle.trim()}
                  className="doc-report-submit-action"
                >
                  {savingTask ? "Se salvează..." : editingTask ? "Salvează Modificările" : "Creează Sarcină"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
