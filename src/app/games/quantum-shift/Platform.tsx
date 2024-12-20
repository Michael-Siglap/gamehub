interface PlatformProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function Platform({ x, y, width, height }: PlatformProps) {
  return (
    <div
      className="absolute bg-slate-400 border-t-2 border-slate-300 shadow-lg"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage:
          "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)",
      }}
    />
  );
}
