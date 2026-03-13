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
      {/* Unit Header */}
      <div className="bg-primary rounded-2xl p-6 mb-8 shadow-[0_4px_0_0_#E6722D] text-white">
        <h2 className="text-xl font-black uppercase tracking-wide opacity-80 mb-1">
          Unit 1
        </h2>
        <h3 className="text-2xl font-black leading-tight">
          {title}
        </h3>
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
