import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className, id, onClick }: { children: React.ReactNode, className?: string, id?: string, onClick?: () => void }) {
  return (
    <div 
      id={id}
      onClick={onClick}
      className={cn(
        "backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-6 shadow-xl transition-all",
        onClick && "cursor-pointer hover:bg-white/30",
        className
      )}
    >
      {children}
    </div>
  );
}

export function GlassContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-[#E1D5E7] via-[#CAE1FF] to-[#E0F2F1] p-4 md:p-8", className)}>
      {children}
    </div>
  );
}
