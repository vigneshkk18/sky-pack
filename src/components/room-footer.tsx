import { Plus } from "@/assets/plus";

function RoomFooter() {
  return (
    <footer className="bg-background-2 p-6 border-t border-border flex justify-between rounded-b-md">
      <div className="flex flex-col justify-stretch gap-4">
        <p className="font-bold">
          7 GB / 15 GB <span className="text-sm font-normal">transferred</span>
        </p>
        <progress value={0.6} max={1} className="w-full" />
      </div>
      <button className="flex items-center gap-2 border-none outline-0 focus-visible:ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary/80 bg-primary text-primary-foreground p-2 px-4 rounded-md hover:bg-primary/90">
        <Plus className="text-white" /> Add new file
      </button>
    </footer>
  );
}

export default RoomFooter;
