"use client";

import { use, useState, useEffect } from "react";
import { api } from "@/utils/trpc";
import { createClient } from "@/lib/supabase-client";
import { LessonFooter } from "@/components/lesson/lesson-footer";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ReadingLessonPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [supabase.auth]);

  const { data: lesson, isLoading } = api.learning.getLessonContent.useQuery({ 
    lessonId: params.id 
  });

  const completeMutation = api.learning.completeLesson.useMutation({
    onSuccess: () => {
      setStatus('CORRECT');
    }
  });

  const handleContinue = () => {
    if (status === 'CORRECT') {
      router.push("/dashboard");
      return;
    }

    if (userId && lesson) {
      completeMutation.mutate({
        userId,
        lessonId: lesson.id,
        courseId: lesson.courseId,
        xpEarned: 10
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
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
          status={status}
          isLoading={completeMutation.isPending}
          onContinue={handleContinue}
          message="+10 XP earned!"
        />
      </div>
    </div>
  );
}
