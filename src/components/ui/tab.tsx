import { forwardRef } from "react";

interface Tab
  extends React.DetailedHTMLProps<
    React.LiHTMLAttributes<HTMLLIElement>,
    HTMLLIElement
  > {
  active?: boolean;
  tab: number;
  onTabChange: (tab: number) => void;
}

export const Tab = forwardRef(
  (
    {
      className = "",
      active = false,
      tab,
      onTabChange,
      children,
      ...props
    }: Tab,
    ref: React.LegacyRef<HTMLLIElement> | undefined
  ) => {
    const color = active
      ? "text-card-foreground font-bold"
      : "text-card-foreground/80";
    return (
      <li
        className={`${className} flex-grow text-center cursor-pointer px-4`}
        ref={ref}
        {...props}
      >
        <button
          className={`w-max h-full py-2 outline-none ${color}`}
          onClick={() => onTabChange(tab)}
        >
          {children}
        </button>
      </li>
    );
  }
);
