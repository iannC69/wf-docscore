import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";
import { getPublicTeamMembers } from "@/lib/security/teamStore";
import {
  createAdminTask,
  getAllAdminTasks,
  updateAdminTask,
  deleteAdminTask,
  toggleAdminTaskSubtask,
  addAdminTaskComment,
  localCreateNotification,
  AdminTask,
  TaskStats,
} from "@/lib/db";

import { getNavigation } from "@/lib/navigation";

export const dynamic = "force-dynamic";

// Discord Webhook Dispatcher for Team Task Management
async function sendDiscordTaskNotification(task: AdminTask, action: "created" | "completed" | "assigned") {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const color =
    action === "completed"
      ? 0x10b981 // Emerald
      : task.priority === "urgent"
      ? 0xf43f5e // Rose / Red
      : task.priority === "high"
      ? 0xff6b00 // Orange
      : task.priority === "medium"
      ? 0xf59e0b // Amber
      : 0x3b82f6; // Blue

  const titlePrefix =
    action === "completed"
      ? "[SARCINĂ FINALIZATĂ]"
      : action === "created"
      ? "[SARCINĂ NOUĂ ASIGNATĂ]"
      : "[SARCINĂ ACTUALIZATĂ]";

  const assigneesFormatted =
    task.assignees.length > 0 ? task.assignees.map((a) => `@${a}`).join(", ") : "Neasignat";

  const fields = [
    {
      name: "Membru Asignat",
      value: assigneesFormatted,
      inline: true,
    },
    {
      name: "Prioritate",
      value: `\`${task.priority.toUpperCase()}\``,
      inline: true,
    },
    {
      name: "Categorie",
      value: `\`${task.category.toUpperCase()}\``,
      inline: true,
    },
  ];

  if (task.dueDate) {
    fields.push({
      name: "Termen Limită",
      value: `\`${task.dueDate}\``,
      inline: true,
    });
  }

  if (task.targetDoc) {
    fields.push({
      name: "Ghid Asociat",
      value: `[Deschide Ghidul](${siteUrl}/docs/${task.targetDoc})`,
      inline: true,
    });
  }

  if (task.subtasks && task.subtasks.length > 0) {
    const doneCount = task.subtasks.filter((s) => s.completed).length;
    fields.push({
      name: "Checklist Subtask-uri",
      value: `${doneCount} din ${task.subtasks.length} finalizate (${Math.round((doneCount / task.subtasks.length) * 100)}%)`,
      inline: true,
    });
  }

  const embed = {
    title: `${titlePrefix} ${task.title}`,
    description: task.description || "Nicio descriere suplimentară furnizată.",
    color,
    fields,
    footer: {
      text: `WildFire Docs Team Task Hub · Asignat de ${task.assignedBy}`,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });
  } catch (err) {
    console.error("[Discord Webhook] Failed to send task embed:", err);
  }
}

export async function GET(req: NextRequest) {
  const session = await getAuthenticatedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tasks = await getAllAdminTasks();
    const members = getPublicTeamMembers();

    // Extract available docs list for autocomplete
    const nav = await getNavigation().catch(() => []);
    const docSlugs: { slug: string; title: string }[] = [];

    function extractSlugs(items: any[]) {
      for (const item of items) {
        if (item.slug) {
          docSlugs.push({ slug: item.slug, title: item.title || item.slug });
        }
        if (item.items) extractSlugs(item.items);
        if (item.children) extractSlugs(item.children);
      }
    }
    extractSlugs(nav);

    // Compute task stats
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const inReview = tasks.filter((t) => t.status === "in_review").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const urgentCount = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;

    const nowStr = new Date().toISOString().slice(0, 10);
    const dueSoonCount = tasks.filter(
      (t) => t.dueDate && t.dueDate <= nowStr && t.status !== "completed"
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const stats: TaskStats = {
      total,
      todo,
      inProgress,
      inReview,
      completed,
      urgentCount,
      dueSoonCount,
      completionRate,
    };

    return NextResponse.json({
      tasks,
      members,
      docSlugs,
      stats,
      currentUser: session.username,
    });
  } catch (err: any) {
    console.error("[API Admin Tasks GET] Error:", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthenticatedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, priority, category, assignees, targetDoc, dueDate, subtasks } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Titlul sarcinii este obligatoriu" }, { status: 400 });
    }

    const task = await createAdminTask({
      title: title.trim(),
      description: (description || "").trim(),
      status: "todo",
      priority: priority || "medium",
      category: category || "docs_update",
      assignees: Array.isArray(assignees) ? assignees : assignees ? [assignees] : [],
      assignedBy: session.username || "Admin",
      targetDoc: targetDoc ? targetDoc.trim().replace(/^\/+|\/+$/g, "") : undefined,
      dueDate: dueDate || undefined,
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      comments: [],
    });

    // Notify Discord asynchronously
    sendDiscordTaskNotification(task, "created").catch(() => {});

    // Create targeted personal notifications for all assignees
    if (task.assignees && task.assignees.length > 0) {
      for (const assignee of task.assignees) {
        localCreateNotification({
          targetUser: assignee,
          isGlobal: false,
          title: `Sarcină Nouă Asignată: ${task.title}`,
          message: `Ai fost asignat de @${session.username} la sarcina din categoria ${task.category.toUpperCase()}.`,
          category: "task",
          severity: task.priority === "urgent" ? "urgent" : "info",
          link: "/admin/tasks",
          metadata: { taskId: task.id, priority: task.priority },
        });
      }
    }

    // If urgent, emit a global alert for the entire team
    if (task.priority === "urgent") {
      localCreateNotification({
        isGlobal: true,
        title: `[ALERTA SARCINĂ URGENTĂ] ${task.title}`,
        message: `Creată de @${session.username} · Necesită atenție prioritară imediată.`,
        category: "task",
        severity: "urgent",
        link: "/admin/tasks",
        metadata: { taskId: task.id },
      });
    }

    return NextResponse.json({ success: true, task });
  } catch (err: any) {
    console.error("[API Admin Tasks POST] Error:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthenticatedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, action, updates, subtaskId, comment } = body;

    if (!id) {
      return NextResponse.json({ error: "ID-ul sarcinii este obligatoriu" }, { status: 400 });
    }

    // Subtask Toggle
    if (action === "toggle_subtask" && subtaskId) {
      const updated = await toggleAdminTaskSubtask(id, subtaskId);
      return NextResponse.json({ success: Boolean(updated), task: updated });
    }

    // Add Comment
    if (action === "add_comment" && comment) {
      const updated = await addAdminTaskComment(id, {
        author: session.username || "Admin",
        text: comment,
      });

      // Notify assignees about new comment
      if (updated && updated.assignees) {
        for (const assignee of updated.assignees) {
          if (assignee.toLowerCase() !== session.username.toLowerCase()) {
            localCreateNotification({
              targetUser: assignee,
              isGlobal: false,
              title: `Comentariu Nou pe Sarcină: ${updated.title}`,
              message: `@${session.username}: "${comment.slice(0, 120)}${comment.length > 120 ? "..." : ""}"`,
              category: "task",
              severity: "info",
              link: "/admin/tasks",
              metadata: { taskId: updated.id },
            });
          }
        }
      }

      return NextResponse.json({ success: Boolean(updated), task: updated });
    }

    // General update (status, priority, assignees, subtasks, etc.)
    const updated = await updateAdminTask(id, updates || {});
    if (!updated) {
      return NextResponse.json({ error: "Sarcina nu a fost găsită" }, { status: 404 });
    }

    // Notify Discord & Team if status became completed
    if (updates?.status === "completed") {
      sendDiscordTaskNotification(updated, "completed").catch(() => {});
      localCreateNotification({
        isGlobal: true,
        title: `Sarcină Finalizată: ${updated.title}`,
        message: `Sarcina a fost marcată cu succes ca finalizată de @${session.username}.`,
        category: "task",
        severity: "success",
        link: "/admin/tasks",
        metadata: { taskId: updated.id },
      });
    }

    return NextResponse.json({ success: true, task: updated });

  } catch (err: any) {
    console.error("[API Admin Tasks PATCH] Error:", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthenticatedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    const deleted = await deleteAdminTask(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    console.error("[API Admin Tasks DELETE] Error:", err);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
