"use client";

import { RoleGuard } from "@/components/guards/role-guard";
import { api } from "@/utils/trpc";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Plus, Trash2, ChevronDown, ChevronUp, BookOpen, 
  FileText, Brain, Award, Send, ArrowLeft, GripVertical
} from "lucide-react";
import Link from "next/link";

const LESSON_TYPE_ICONS: Record<string, typeof BookOpen> = {
  READING: FileText,
  EXERCISE: Brain,
  QUIZ: Brain,
  FINAL_ASSESSMENT: Award,
};

const LESSON_TYPE_COLORS: Record<string, string> = {
  READING: "#3CC7F5",
  EXERCISE: "#FFC800",
  QUIZ: "#FF9600",
  FINAL_ASSESSMENT: "#FF4B4B",
};

function CourseEditorContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { data: course, isLoading, refetch } = api.creator.getCourseDetail.useQuery({ courseId });
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null);

  const createUnit = api.creator.createUnit.useMutation({
    onSuccess: () => { toast.success("Unit created."); setShowAddUnit(false); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteUnit = api.creator.deleteUnit.useMutation({
    onSuccess: () => { toast.success("Unit deleted."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const createLesson = api.creator.createLesson.useMutation({
    onSuccess: () => { toast.success("Lesson created."); setShowAddLesson(null); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteLesson = api.creator.deleteLesson.useMutation({
    onSuccess: () => { toast.success("Lesson deleted."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const submitForReview = api.creator.submitForReview.useMutation({
    onSuccess: () => { toast.success("Course submitted for review!"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="duo-card p-6 animate-pulse bg-gray-50 h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = course.units.reduce((sum: number, u: any) => sum + u.lessons.length, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/creator" className="p-2 rounded-xl border-2 border-[#E5E5E5] hover:bg-[#F7F7F7] transition-colors">
          <ArrowLeft className="w-4 h-4 text-[#AFAFAF]" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-black text-[#4B4B4B] tracking-tight flex-1 truncate">{course.title}</h1>
        {course.status === "DRAFT" && (
          <button
            onClick={() => submitForReview.mutate({ courseId })}
            disabled={submitForReview.isPending}
            className="duo-button-primary flex items-center gap-2 text-xs px-5 py-2.5"
          >
            <Send className="w-4 h-4" />
            Submit for Review
          </button>
        )}
      </div>
      <p className="text-[#AFAFAF] font-bold text-sm mb-8">
        {course.units.length} units • {totalLessons} lessons • {course.status}
      </p>

      {/* Units */}
      <div className="space-y-4">
        {course.units.map((unit: any) => {
          const isExpanded = expandedUnits.has(unit.id);
          return (
            <div key={unit.id} className="duo-card overflow-hidden">
              <button
                onClick={() => toggleUnit(unit.id)}
                className="w-full flex items-center gap-3 p-5 hover:bg-[#FAFAFA] transition-colors text-left"
              >
                <GripVertical className="w-4 h-4 text-[#E5E5E5]" />
                <div className="flex-1">
                  <p className="font-black text-[#4B4B4B]">Unit {unit.position}: {unit.title}</p>
                  <p className="text-xs font-bold text-[#AFAFAF]">{unit.lessons.length} lessons</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this unit and all its lessons?")) {
                      deleteUnit.mutate({ unitId: unit.id });
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-[#FF4B4B]/10 text-[#AFAFAF] hover:text-[#FF4B4B] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-[#AFAFAF]" /> : <ChevronDown className="w-5 h-5 text-[#AFAFAF]" />}
              </button>

              {isExpanded && (
                <div className="border-t-2 border-[#F7F7F7]">
                  {unit.lessons.length === 0 ? (
                    <p className="px-5 py-4 text-sm font-bold text-[#AFAFAF] italic">No lessons yet.</p>
                  ) : (
                    unit.lessons.map((lesson: any) => {
                      const Icon = LESSON_TYPE_ICONS[lesson.type] || FileText;
                      const color = LESSON_TYPE_COLORS[lesson.type] || "#AFAFAF";
                      return (
                        <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 border-b border-[#F7F7F7] last:border-b-0 hover:bg-[#FAFAFA] transition-colors">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-sm text-[#4B4B4B]">{lesson.title}</p>
                            <p className="text-[10px] font-bold text-[#AFAFAF] uppercase tracking-wider">
                              {lesson.type.replace("_", " ")} • {lesson.estimatedMinutes}min • {lesson.status}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm("Delete this lesson?")) {
                                deleteLesson.mutate({ lessonId: lesson.id });
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-[#FF4B4B]/10 text-[#AFAFAF] hover:text-[#FF4B4B] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}

                  {/* Add Lesson */}
                  {showAddLesson === unit.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        createLesson.mutate({
                          unitId: unit.id,
                          courseId,
                          title: fd.get("title") as string,
                          type: fd.get("type") as "READING" | "EXERCISE" | "QUIZ" | "FINAL_ASSESSMENT",
                          estimatedMinutes: parseInt(fd.get("minutes") as string) || 5,
                        });
                      }}
                      className="p-4 bg-[#F7F7F7] flex flex-col md:flex-row gap-3"
                    >
                      <input name="title" required placeholder="Lesson title" className="flex-1 bg-white border-2 border-[#E5E5E5] rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary outline-none" />
                      <select name="type" className="bg-white border-2 border-[#E5E5E5] rounded-xl py-2.5 px-3 text-sm font-bold focus:border-primary outline-none">
                        <option value="READING">Reading</option>
                        <option value="EXERCISE">Exercise</option>
                        <option value="QUIZ">Quiz</option>
                        <option value="FINAL_ASSESSMENT">Assessment</option>
                      </select>
                      <input name="minutes" type="number" min={1} defaultValue={5} className="w-20 bg-white border-2 border-[#E5E5E5] rounded-xl py-2.5 px-3 text-sm font-bold focus:border-primary outline-none" placeholder="Min" />
                      <div className="flex gap-2">
                        <button type="submit" disabled={createLesson.isPending} className="duo-button-primary text-xs px-4 py-2.5">Add</button>
                        <button type="button" onClick={() => setShowAddLesson(null)} className="px-4 py-2.5 text-xs font-black text-[#AFAFAF] border-2 border-[#E5E5E5] rounded-xl hover:bg-white transition-all">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowAddLesson(unit.id)}
                      className="w-full flex items-center gap-2 px-5 py-3 text-sm font-black text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Lesson
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Unit */}
      {showAddUnit ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createUnit.mutate({ courseId, title: fd.get("title") as string });
          }}
          className="mt-4 duo-card p-5 flex flex-col md:flex-row gap-3"
        >
          <input name="title" required placeholder="Unit title" className="flex-1 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={createUnit.isPending} className="duo-button-primary text-sm px-6 py-3">Create Unit</button>
            <button type="button" onClick={() => setShowAddUnit(false)} className="px-6 py-3 text-sm font-black text-[#AFAFAF] border-2 border-[#E5E5E5] rounded-xl hover:bg-[#F7F7F7] transition-all">Cancel</button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddUnit(true)}
          className="mt-4 w-full duo-card p-5 flex items-center justify-center gap-2 text-sm font-black text-primary hover:bg-primary/5 transition-colors border-dashed"
        >
          <Plus className="w-5 h-5" />
          Add Unit
        </button>
      )}
    </div>
  );
}

export default function CourseEditorPage() {
  return (
    <RoleGuard allowed={["COURSE_CREATOR", "ADMIN", "DEVELOPER"]}>
      <CourseEditorContent />
    </RoleGuard>
  );
}
