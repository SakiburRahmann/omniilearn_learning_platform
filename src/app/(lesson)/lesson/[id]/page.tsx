"use client";

import { use, useState, useEffect } from "react";
import { api } from "@/utils/trpc";
import { createClient } from "@/lib/supabase-client";
import { LessonFooter } from "@/components/lesson/lesson-footer";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Zap, Flame } from "lucide-react";

export default function ReadingLessonPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG' | 'FINISHED'>('IDLE');
  const [result, setResult] = useState<{ newStreak: number; xpGained: number } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [supabase.auth]);

  const { data: lesson, isLoading } = api.learning.getLessonContent.useQuery({ 
    lessonId: params.id 
  });

  const completeMutation = api.learning.completeLesson.useMutation({
    onSuccess: (data: any) => {
      setResult({
        newStreak: data.newStreak,
        xpGained: data.xpGained
      });
      setStatus('FINISHED');
      
      // Industrial-grade celebration
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#58CC02", "#1CB0F6", "#FF4B4B", "#FF9600"],
        });
      });
    },
    onError: (error: any) => {
      console.error("Mutation failed:", error);
      setStatus('IDLE');
      const message = error.data?.zodError 
        ? "Invalid data submitted" 
        : (error.message || "Unknown error");
      alert(`Failed to save progress: ${message}`);
    }
  });

  const handleContinue = () => {
    if (status === 'FINISHED') {
      router.push("/dashboard");
      return;
    }

    if (status === 'CORRECT') {
      // This is reached if we use multiple stages, but for reading it's direct to finished
      return;
    }

    if (status === 'IDLE' && lesson && !completeMutation.isPending) {
      completeMutation.mutate({
        lessonId: lesson.id,
        courseId: lesson.courseId,
        xpEarned: 10
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-[#AFAFAF]">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-[#4B4B4B]">Lesson not found</h2>
        <button onClick={() => router.push("/dashboard")} className="text-[#1CB0F6] font-bold mt-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // @ts-ignore
  const lessonData = lesson.content?.content as any;

  if (status === 'FINISHED' && result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="space-y-4"
        >
          <div className="w-32 h-32 bg-[#FFD700] rounded-full mx-auto flex items-center justify-center shadow-[0_8px_0_0_#CCAC00] mb-8">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-black text-[#4B4B4B]">Lesson Complete!</h1>
          <p className="text-xl text-[#AFAFAF] font-bold">You're making great progress.</p>
        </motion.div>

        <div className="flex gap-4 w-full max-w-md">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 bg-white border-2 border-[#E5E5E5] rounded-2xl p-6 shadow-[0_4px_0_0_#E5E5E5]"
          >
            <div className="text-[#1CB0F6] font-black uppercase text-sm mb-2">Total XP</div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-[#1CB0F6] fill-[#1CB0F6]" />
              <span className="text-3xl font-black text-[#4B4B4B]">+{result.xpGained}</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex-1 bg-white border-2 border-[#FF9600] rounded-2xl p-6 shadow-[0_4px_0_0_#FF9600]"
          >
            <div className="text-[#FF9600] font-black uppercase text-sm mb-2">Streak</div>
            <div className="flex items-center justify-center gap-2">
              <Flame className="w-6 h-6 text-[#FF9600] fill-[#FF9600]" />
              <span className="text-3xl font-black text-[#4B4B4B]">{result.newStreak}</span>
            </div>
          </motion.div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-white border-t-2 border-[#E5E5E5]">
          <div className="max-w-5xl mx-auto flex justify-center">
            <button
              onClick={handleContinue}
              className="w-full max-w-sm py-4 bg-primary text-white font-black text-lg uppercase tracking-wider rounded-2xl shadow-[0_4px_0_0_#E6722D] hover:translate-y-[-2px] hover:shadow-[0_6px_0_0_#E6722D] active:translate-y-[2px] active:shadow-none transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)]">
      <div className="flex-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {lessonData?.blocks?.map((block: any, i: number) => {
            if (block.type === 'heading') {
              return (
                <h1 key={i} className="text-3xl font-black text-[#4B4B4B]">
                  {block.value}
                </h1>
              );
            }
            if (block.type === 'text') {
              return (
                <p key={i} className="text-xl font-medium text-[#4B4B4B] leading-relaxed">
                  {block.value}
                </p>
              );
            }
            return null;
          })}
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0">
        <LessonFooter 
          status={status as 'IDLE' | 'CORRECT' | 'WRONG'}
          isLoading={completeMutation.isPending}
          onContinue={handleContinue}
          message="+10 XP earned!"
        />
      </div>
    </div>
  );
}
