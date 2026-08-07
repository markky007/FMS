/**
 * Notification Composable
 * Wrapper around Quasar Notify plugin for consistent UI feedback
 */

import { useQuasar, type QNotifyCreateOptions } from "quasar";

export function useNotification() {
  const $q = useQuasar();

  function success(message: string, caption?: string): void {
    const opts: QNotifyCreateOptions = {
      type: "positive",
      message,
      position: "top",
      timeout: 3000,
      icon: "check_circle"
    };
    if (caption) opts.caption = caption;
    $q.notify(opts);
  }

  function error(message: string, caption?: string): void {
    const opts: QNotifyCreateOptions = {
      type: "negative",
      message,
      position: "top",
      timeout: 5000,
      icon: "error"
    };
    if (caption) opts.caption = caption;
    $q.notify(opts);
  }

  function warning(message: string, caption?: string): void {
    const opts: QNotifyCreateOptions = {
      type: "warning",
      message,
      position: "top",
      timeout: 4000,
      icon: "warning"
    };
    if (caption) opts.caption = caption;
    $q.notify(opts);
  }

  function info(message: string, caption?: string): void {
    const opts: QNotifyCreateOptions = {
      type: "info",
      message,
      position: "top",
      timeout: 3000,
      icon: "info"
    };
    if (caption) opts.caption = caption;
    $q.notify(opts);
  }

  return {
    success,
    error,
    warning,
    info
  };
}
