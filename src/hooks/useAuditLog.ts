import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AuditLogEntry {
  activity_type: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export function useAuditLog() {
  const { user } = useAuth();

  const logActivity = async (entry: AuditLogEntry) => {
    if (!user?.id) return;

    try {
      await supabase.from("admin_activity_log").insert({
        activity_type: entry.activity_type,
        title: entry.title,
        description: entry.description || null,
        metadata: {
          ...(entry.metadata || {}),
          user_id: user.id,
          user_email: user.email,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  // Pre-defined logging functions
  const logPropertyAction = (
    action: "create" | "update" | "delete" | "publish" | "unpublish",
    propertyId: string,
    propertyTitle: string
  ) => {
    logActivity({
      activity_type: `property_${action}`,
      title: `Property ${action}d: ${propertyTitle}`,
      metadata: { property_id: propertyId },
    });
  };

  const logUserAction = (
    action: "role_change" | "suspend" | "unsuspend" | "delete",
    targetUserId: string,
    details: string
  ) => {
    logActivity({
      activity_type: `user_${action}`,
      title: `User ${action}: ${details}`,
      metadata: { target_user_id: targetUserId },
    });
  };

  const logSettingsChange = (setting: string, oldValue: unknown, newValue: unknown) => {
    logActivity({
      activity_type: "settings_change",
      title: `Settings changed: ${setting}`,
      metadata: { setting, old_value: oldValue, new_value: newValue },
    });
  };

  const logFeatureFlagChange = (
    flagName: string,
    action: "enable" | "disable" | "update"
  ) => {
    logActivity({
      activity_type: `feature_flag_${action}`,
      title: `Feature flag ${action}d: ${flagName}`,
      metadata: { flag_name: flagName },
    });
  };

  const logBulkOperation = (
    operationType: string,
    affectedCount: number,
    details?: string
  ) => {
    logActivity({
      activity_type: "bulk_operation",
      title: `Bulk ${operationType}: ${affectedCount} items`,
      description: details,
      metadata: { operation_type: operationType, affected_count: affectedCount },
    });
  };

  const logDataExport = (exportType: string, format: string) => {
    logActivity({
      activity_type: "data_export",
      title: `Data exported: ${exportType}`,
      metadata: { export_type: exportType, format },
    });
  };

  return {
    logActivity,
    logPropertyAction,
    logUserAction,
    logSettingsChange,
    logFeatureFlagChange,
    logBulkOperation,
    logDataExport,
  };
}
