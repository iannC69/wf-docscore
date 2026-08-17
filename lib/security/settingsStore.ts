import fs from "fs";
import path from "path";
import { recordAuditEvent } from "./audit";

export interface PlatformSettings {
  maintenance: {
    enabled: boolean;
    message: string;
    estimatedEndTime: string;
  };
  announcement: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  updatedAt: string;
  updatedBy: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  maintenance: {
    enabled: false,
    message:
      "Wildfire Docs is currently undergoing scheduled platform upgrades and engine optimizations. We'll be back online shortly.",
    estimatedEndTime: "30 minutes",
  },
  announcement: {
    enabled: false,
    text: "Wildfire Docs v1.4.0 is live with Fortress Cryptographic Proof and DeepSearch!",
    link: "/changelog",
  },
  updatedAt: new Date().toISOString(),
  updatedBy: "system",
};

const SETTINGS_FILE_PATH = path.join(process.cwd(), "content", "settings.json");

/**
 * Reads platform settings from persistent disk store.
 */
export function getPlatformSettings(): PlatformSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        maintenance: { ...DEFAULT_SETTINGS.maintenance, ...(parsed.maintenance || {}) },
        announcement: { ...DEFAULT_SETTINGS.announcement, ...(parsed.announcement || {}) },
      };
    }
  } catch (err) {
    console.error("Failed to read settings file, using defaults:", err);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Updates platform settings and commits to disk store.
 */
export function updatePlatformSettings(
  updates: {
    maintenance?: Partial<PlatformSettings["maintenance"]>;
    announcement?: Partial<PlatformSettings["announcement"]>;
  },
  actor = "admin"
): PlatformSettings {
  const current = getPlatformSettings();
  const next: PlatformSettings = {
    ...current,
    maintenance: {
      ...current.maintenance,
      ...(updates.maintenance || {}),
    },
    announcement: {
      ...current.announcement,
      ...(updates.announcement || {}),
    },
    updatedAt: new Date().toISOString(),
    updatedBy: actor,
  };

  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(next, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write settings file:", err);
  }

  recordAuditEvent({
    action: "SETTINGS_UPDATE",
    actor,
    details: {
      maintenanceEnabled: next.maintenance.enabled,
      announcementEnabled: next.announcement.enabled,
    },
  });

  return next;
}
