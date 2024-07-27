import { Cancel } from "@/assets/cancel";
import { CheckCircle } from "@/assets/check-circle";
import { Info } from "@/assets/info";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/types/toast";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import { createPortal } from "react-dom";

const Icon: Record<Toast["variant"], ReactNode> = {
  success: <CheckCircle fill="#22c55e" width={20} height={20} />,
  destructive: (
    <Cancel
      className="bg-destructive rounded-full text-destructive-foreground p-1"
      width={20}
      height={20}
    />
  ),
  info: <Info color="#ffffff" fill="#3b82f6" width={24} height={24} />,
};

export function Toaster() {
  const { toastList } = useToast();

  return createPortal(
    <AnimatePresence>
      {toastList.map((toast) => (
        <motion.div
          key={toast.id}
          layout
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.5 }}
          className={`bg-card p-2 px-4 rounded-md flex gap-4 items-center mt-2 shadow-lg`}
        >
          {Icon[toast.variant]}
          <span className="min-w-36 text-sm">{toast.text}</span>
        </motion.div>
      ))}
    </AnimatePresence>,
    document.getElementById("sky-pack-toast-root")!
  );
}
