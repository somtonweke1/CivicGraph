"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { toast, Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
      }}
    />
  );
}

// Success toast with custom icon
export function showSuccess(message: string, description?: string) {
  toast.success(message, {
    description,
    icon: <CheckCircle2 className="h-5 w-5" />,
  });
}

// Error toast with custom icon
export function showError(message: string, description?: string) {
  toast.error(message, {
    description,
    icon: <XCircle className="h-5 w-5" />,
  });
}

// Info toast
export function showInfo(message: string, description?: string) {
  toast.info(message, {
    description,
    icon: <Info className="h-5 w-5" />,
  });
}

// Warning toast
export function showWarning(message: string, description?: string) {
  toast.warning(message, {
    description,
    icon: <AlertTriangle className="h-5 w-5" />,
  });
}

// Action toast with button
export function showActionToast(
  message: string,
  actionLabel: string,
  onAction: () => void,
  description?: string
) {
  toast(message, {
    description,
    action: {
      label: actionLabel,
      onClick: onAction,
    },
  });
}

// Loading toast (returns ID to dismiss later)
export function showLoading(message: string) {
  return toast.loading(message);
}

// Update existing toast
export function updateToast(id: string | number, message: string, type: "success" | "error" | "info") {
  if (type === "success") {
    toast.success(message, { id });
  } else if (type === "error") {
    toast.error(message, { id });
  } else {
    toast.info(message, { id });
  }
}

// Dismiss toast
export function dismissToast(id?: string | number) {
  if (id) {
    toast.dismiss(id);
  } else {
    toast.dismiss();
  }
}

// Promise toast (shows loading, then success/error)
export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) {
  return toast.promise(promise, messages);
}

// Example usage component
export function ToastExamples() {
  return (
    <div className="space-y-4 p-4">
      <button
        onClick={() => showSuccess("Action logged!", "You earned 50 impact points")}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Success Toast
      </button>

      <button
        onClick={() => showError("Failed to save", "Please try again")}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Error Toast
      </button>

      <button
        onClick={() => showInfo("New feature available", "Check out the new analytics dashboard")}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Info Toast
      </button>

      <button
        onClick={() => showWarning("Action limit reached", "Upgrade to Pro for unlimited actions")}
        className="px-4 py-2 bg-yellow-600 text-white rounded"
      >
        Warning Toast
      </button>

      <button
        onClick={() =>
          showActionToast("Action saved", "View", () => console.log("Navigate to action"), "Click to see details")
        }
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        Action Toast
      </button>

      <button
        onClick={async () => {
          const promise = new Promise((resolve) => setTimeout(() => resolve("Done!"), 2000));
          await showPromise(promise, {
            loading: "Saving action...",
            success: "Action saved successfully!",
            error: "Failed to save action",
          });
        }}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Promise Toast
      </button>
    </div>
  );
}
