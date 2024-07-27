import { create } from "zustand";
import ShortUniqueId from "short-unique-id";

import { Toast } from "@/types/toast";

const uid = new ShortUniqueId();

export const useToast = create<{ toastList: Toast[] }>(() => ({ toastList: [] }));

export function show(toast: Omit<Toast, "id">) {
  const updatedToast = { ...toast, id: uid.rnd() };

  const newToastList = [...useToast.getState().toastList, updatedToast];

  setTimeout(() => {
    const newToastList = useToast.getState().toastList.filter(to => to.id !== updatedToast.id);
    useToast.setState({ toastList: newToastList })
  }, toast.duration);

  useToast.setState({ toastList: newToastList });
}

export function close(toastId: string) {
  const newToastList = useToast.getState().toastList.filter(toast => toast.id !== toastId);

  useToast.setState({ toastList: newToastList });
}

export function closeAll() {
  useToast.setState({ toastList: [] });
}
