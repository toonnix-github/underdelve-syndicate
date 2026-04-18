import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
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
