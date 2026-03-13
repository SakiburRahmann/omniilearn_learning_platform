"use client";

import { api } from "@/utils/trpc";
import { BookOpen, Trophy, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function CoursesPage() {
  const router = useRouter();
  const { data: courses, isLoading } = api.course.getAll.useQuery();
  const enrollMutation = api.course.enroll.useMutation({
    onSuccess: (data) => {
      // Redirect to dashboard to start learning the newly enrolled course
      router.push("/dashboard");
    }
  });

  const handleEnroll = (courseId: string) => {
    enrollMutation.mutate({ courseId });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <header>
        <h1 className="text-4xl font-black text-[#4B4B4B] mb-2 tracking-tight">Level Up Your Skills</h1>
        <p className="text-xl font-bold text-[#AFAFAF]">Choose a course and begin your mastery journey.</p>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="font-bold text-[#AFAFAF]">Finding top-tier courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses?.map((course) => (
            <div 
              key={course.id}
              className="duo-card group flex flex-col h-full bg-white border-2 border-[#E5E5E5] rounded-[2rem] p-8 shadow-[0_8px_0_0_#F0F0F0] hover:translate-y-[-4px] transition-all"
            >
              <div className="flex-1 space-y-4">
                <div className="w-14 h-14 bg-[#FFF2E5] rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#4B4B4B] group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="font-bold text-[#AFAFAF] mt-1">{course.subtitle}</p>
                </div>
                <p className="text-[#777] font-medium leading-relaxed">
                  {course.description}
                </p>
                
                <div className="flex items-center gap-3">
                   <div className="px-3 py-1 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-full text-xs font-black text-[#AFAFAF] uppercase tracking-wider">
                      {course.difficulty}
                   </div>
                   <div className="px-3 py-1 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-full text-xs font-black text-[#AFAFAF] uppercase tracking-wider">
                      {course.category}
                   </div>
                </div>
              </div>

              <button 
                onClick={() => handleEnroll(course.id)}
                disabled={enrollMutation.isPending}
                className={cn(
                  "w-full mt-8 flex items-center justify-center gap-3 duo-button-primary py-4",
                  enrollMutation.isPending && "opacity-70 cursor-not-allowed"
                )}
              >
                {enrollMutation.isPending ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-widest">Enroll Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Featured/Upcoming */}
      {!isLoading && courses?.length === 0 && (
         <div className="text-center py-20 bg-[#F7F7F7] rounded-[3rem] border-2 border-dashed border-[#E5E5E5]">
            <Trophy className="w-16 h-16 text-[#AFAFAF] mx-auto mb-4" />
            <h2 className="text-2xl font-black text-[#4B4B4B]">Creating New Paths...</h2>
            <p className="font-bold text-[#AFAFAF]">Check back soon for new premium courses.</p>
         </div>
      )}
    </div>
  );
}
