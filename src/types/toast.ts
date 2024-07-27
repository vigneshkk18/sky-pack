export interface Toast {
  id: string;
  text: string;
  duration: number;
  variant: "success" | "destructive" | "info";
}
