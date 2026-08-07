/**
 * App-level configuration constants
 */

export const APP_CONFIG = {
  /** Application display name */
  APP_NAME: "KCST Document Delivery",

  /** Slip number prefix */
  SLIP_PREFIX: "KCST",

  /** Max attachments per delivery item */
  MAX_ATTACHMENTS_PER_ITEM: 3,

  /** Max file size for attachments in bytes (10MB) */
  MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024,

  /** Max file size for signature in bytes (500KB) */
  MAX_SIGNATURE_SIZE: 500 * 1024,

  /** Allowed attachment MIME types (Images, PDF, Word, Excel, CSV) */
  ALLOWED_ATTACHMENT_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/csv",
  ],

  /** Supabase Storage bucket names */
  STORAGE_BUCKETS: {
    ATTACHMENTS: "attachments",
    SIGNATURES: "signatures",
  },

  /** Signed URL expiry time in seconds (1 hour) */
  SIGNED_URL_EXPIRY: 3600,

  /** Pagination defaults */
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },
} as const;
