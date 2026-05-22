import { createContext, useContext, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const api = useMemo(
    () => ({
      push(message, type = "success") {
        const id = crypto.randomUUID();
        setToasts((current) => [...current, { id, message, type }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3600);
      },
      remove(id) {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col gap-3">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 rounded-3xl bg-slate-950/92 px-4 py-3 text-white shadow-soft"
            >
              {toast.type === "error" ? (
                <CircleAlert className="mt-0.5 h-5 w-5 text-brand-red" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
              )}
              <p className="flex-1 text-sm">{toast.message}</p>
              <button type="button" onClick={() => api.remove(toast.id)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
