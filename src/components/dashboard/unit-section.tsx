"use client";

import { cn } from "@/lib/utils";
import { LessonNode } from "./lesson-node";

interface Lesson {
  id: string;
  title: string;
  type: 'READING' | 'EXERCISE' | 'QUIZ' | 'FINAL_ASSESSMENT';
  status: 'COMPLETED' | 'ACTIVE' | 'LOCKED';
  position: number;
}

interface UnitSectionProps {
  title: string;
  lessons: Lesson[];
  onLessonClick?: (lessonId: string) => void;
}

export function UnitSection({ title, lessons, onLessonClick }: UnitSectionProps) {
  return (
    <section className="w-full max-w-2xl mx-auto mb-12">
    <div className="bg-primary rounded-[2rem] p-8 pb-10 text-white shadow-[0_8px_0_0_#E6722D] mb-12 relative overflow-hidden">
      {/* Dynamic light streak for depth */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
      
      <p className="text-sm font-black uppercase tracking-widest opacity-80 mb-2">Unit 1</p>
      <h2 className="text-3xl font-black leading-tight">{title}</h2>
    </div>

      {/* Path Container */}
      <div className="flex flex-col items-center">
        {lessons.sort((a,b) => a.position - b.position).map((lesson, index) => (
          <LessonNode
            key={lesson.id}
            id={lesson.id}
            title={lesson.title}
            type={lesson.type}
            status={lesson.status}
            position={lesson.position}
            index={index}
            onClick={() => onLessonClick?.(lesson.id)}
          />
        ))}
      </div>
    </section>
  );
}
