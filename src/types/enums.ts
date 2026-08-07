/**
 * Application-level enums
 * ใช้ร่วมกันทั้ง frontend logic และ display
 */

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  EMPLOYEE = "employee",
}

export enum SlipStatus {
  DRAFT = "draft",
  SENT = "sent",
  PARTIALLY_RECEIVED = "partially_received",
  FULLY_RECEIVED = "fully_received",
  VOIDED = "voided",
}

export enum DepartmentType {
  BRANCH = "branch",
  DEPARTMENT = "department",
}

export enum AuditAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  SIGN = "sign",
  VOID = "void",
}

/** Status display configuration */
export const SLIP_STATUS_CONFIG: Record<
  SlipStatus,
  { label: string; color: string; icon: string }
> = {
  [SlipStatus.DRAFT]: {
    label: "แบบร่าง",
    color: "grey",
    icon: "edit_note",
  },
  [SlipStatus.SENT]: {
    label: "ส่งแล้ว",
    color: "blue",
    icon: "send",
  },
  [SlipStatus.PARTIALLY_RECEIVED]: {
    label: "รับบางส่วน",
    color: "orange",
    icon: "hourglass_top",
  },
  [SlipStatus.FULLY_RECEIVED]: {
    label: "รับครบแล้ว",
    color: "green",
    icon: "check_circle",
  },
  [SlipStatus.VOIDED]: {
    label: "ยกเลิก",
    color: "red",
    icon: "cancel",
  },
};

export const USER_ROLE_CONFIG: Record<
  UserRole,
  { label: string; color: string }
> = {
  [UserRole.ADMIN]: { label: "ผู้ดูแลระบบ (Admin)", color: "purple" },
  [UserRole.MANAGER]: { label: "ผู้จัดการ (Manager)", color: "orange" },
  [UserRole.EMPLOYEE]: { label: "พนักงาน (Employee)", color: "blue" },
};
