"use client";

import { cn } from "@/lib/utils";
import { Check, Star, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface LessonNodeProps {
  id: string;
  title: string;
  type: 'READING' | 'EXERCISE' | 'QUIZ' | 'FINAL_ASSESSMENT';
  status: 'COMPLETED' | 'ACTIVE' | 'LOCKED';
  position: number;
  index: number; // For zigzag calculation
  onClick?: () => void;
}

export function LessonNode({
  title,
  type,
  status,
  index,
  onClick,
}: LessonNodeProps) {
  // Zigzag pattern: offset from center
  const xOffset = Math.sin(index * 0.8) * 60; // Adjust for wider/narrower curve

  const getStatusStyles = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          button: "bg-primary border-primary-dark hover:brightness-110 shadow-[0_6px_0_0_#E6722D]",
          icon: <Check className="w-8 h-8 text-white fill-current" />,
        };
      case 'ACTIVE':
        return {
          button: "bg-[#1CB0F6] border-[#1899D6] hover:bg-[#20C0FF] shadow-[0_6px_0_0_#1899D6]",
          icon: <Star className="w-8 h-8 text-white fill-current" />,
          isBouncing: true,
        };
      case 'LOCKED':
        return {
          button: "bg-[#E5E5E5] border-[#AFB3B8] cursor-not-allowed shadow-[0_6px_0_0_#AFB3B8]",
          icon: <Lock className="w-8 h-8 text-[#AFB3B8] fill-current" />,
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div 
      className="flex flex-col items-center py-6"
      style={{ transform: `translateX(${xOffset}px)` }}
    >
      <div className="relative group">
        {/* Tooltip on hover */}
        {status !== 'LOCKED' && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#4B4B4B] text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {title}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#4B4B4B]" />
          </div>
        )}

        <motion.button
          onClick={status !== 'LOCKED' ? onClick : undefined}
          whileHover={status !== 'LOCKED' ? { scale: 1.05 } : {}}
          whileTap={status !== 'LOCKED' ? { scale: 0.95, translateY: 4 } : {}}
          animate={styles.isBouncing ? {
            y: [0, -6, 0],
          } : {}}
          transition={styles.isBouncing ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
          className={cn(
            "w-20 h-20 rounded-full border-b-[6px] flex items-center justify-center transition-all duration-200",
            styles.button
          )}
        >
          {styles.icon}
        </motion.button>

        {/* Lesson Badge (Type indicator) */}
        {status === 'ACTIVE' && (
          <div className="absolute -right-2 -top-2 bg-[#FFC800] text-white p-1 rounded-full border-2 border-white shadow-sm">
            <span className="text-[10px] font-black uppercase px-1">NEW</span>
          </div>
        )}
      </div>
    </div>
  );
}
