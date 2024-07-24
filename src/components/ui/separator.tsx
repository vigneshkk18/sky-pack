interface Separator {
  orientation?: "horizontal" | "vertical";
}

export default function Separator({ orientation = "horizontal" }: Separator) {
  const border = orientation === "horizontal" ? "border-b" : "border-r";
  return <div className={`${border} border-border`}></div>;
}
