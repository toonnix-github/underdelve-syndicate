import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]",
    secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
};

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  label?: string;
  className?: string;
  showValues?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max, 
  color = "bg-red-500", 
  label, 
  className,
  showValues = false
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
        <span>{label}</span>
        {showValues && <span>{Math.floor(value)} / {max}</span>}
      </div>
      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
        <div 
          className={cn("h-full transition-all duration-300 ease-out", color)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface StatLineProps {
    label: string;
    current: number;
    base: number;
    icon?: React.ReactNode;
    breakdown?: { source: string, value: string, isNegative: boolean }[];
}

export const StatLine: React.FC<StatLineProps> = ({ label, current, base, icon, breakdown }) => {
    const diff = current - base;
    const isModified = diff !== 0;

    const renderTooltip = () => {
        if (!breakdown || breakdown.length === 0) return null;
        return (
            <div className="absolute left-0 bottom-full mb-2 z-[100] w-52 p-2.5 bg-black/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none">
                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1.5 mb-1.5">
                    {label} Breakdown
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400">
                        <span>Original Base</span>
                        <span>{base}</span>
                    </div>
                    {breakdown.map((mod, i) => (
                        <div key={i} className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-zinc-500">{mod.source}</span>
                            <span className={mod.isNegative ? 'text-rose-500' : 'text-emerald-400'}>{mod.value}</span>
                        </div>
                    ))}
                    <div className="flex justify-between items-center pt-1.5 border-t border-zinc-800/50 text-[10px] font-black">
                        <span className="text-zinc-200">Final {label}</span>
                        <span className={isModified ? (current > base ? 'text-emerald-400' : 'text-rose-500') : 'text-white'}>{current}</span>
                    </div>
                </div>
                <div className="absolute top-full left-4 -translate-y-1 w-2 h-2 bg-black border-r border-b border-zinc-800 rotate-45" />
            </div>
        );
    };

    if (!isModified) {
        return (
            <div className="group relative flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-zinc-400 cursor-help">
                {icon && <span className="opacity-60">{icon}</span>}
                <span>{label}:</span>
                <span className="text-white font-bold">{current}</span>
                {renderTooltip()}
            </div>
        );
    }

    const currentTextColor = current > base ? 'text-emerald-400' : 'text-rose-500';
    const modTextColor = diff > 0 ? 'text-emerald-400' : 'text-rose-500';
    const sign = diff > 0 ? '+' : '';

    return (
        <div className="group relative flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-zinc-400 cursor-help">
            {icon && <span className="opacity-60">{icon}</span>}
            <span>{label}:</span>
            <span className={cn("text-lg leading-none font-black drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]", currentTextColor)}>
                {current}
            </span>
            <span className="text-[9px] font-bold opacity-90 flex items-center gap-0.5 whitespace-nowrap bg-black/40 px-1 rounded border border-white/5">
                {base} 
                <span className={cn("ml-0.5", modTextColor)}>
                   {sign}{diff}
                </span>
            </span>
            {renderTooltip()}
        </div>
    );
};
