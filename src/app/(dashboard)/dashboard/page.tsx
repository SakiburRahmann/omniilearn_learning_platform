"use client";

import { motion } from "framer-motion";
import { Flame, Heart, Star, Target, Zap } from "lucide-react";
import { api } from "@/utils/trpc";
import { createClient } from "@/lib/supabase-client";
import { useState, useEffect } from "react";
import { UnitSection } from "@/components/dashboard/unit-section";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [supabase.auth]);

  const { data: pathData, isLoading } = api.learning.getLearningPath.useQuery({ 
    userId: userId || undefined 
  }, {
    enabled: !!userId,
  });

  const handleLessonClick = (lessonId: string) => {
    router.push(`/lesson/${lessonId}`);
  };

  return (
    <div className="space-y-0 pb-12">
      {/* Header Info Bar */}
      <section className="flex items-center justify-between gap-6 px-4 py-4 bg-white border-b-2 border-[#E5E5E5] sticky top-0 z-40">
        <div className="flex items-center gap-8 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Flame className="w-6 h-6 text-[#FF9600]" />
            <span className="font-black text-[#AFAFAF] group-hover:text-[#FF9600] transition-colors">0</span>
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <Star className="w-6 h-6 text-[#FFC800]" />
            <span className="font-black text-[#FFC800]">50</span>
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <Heart className="w-6 h-6 text-[#FF4B4B]" />
            <span className="font-black text-[#FF4B4B]">5</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto px-4 pt-8">
        {/* Main Learning Path */}
        <div className="lg:col-span-2 space-y-12">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
              <p className="font-bold text-[#AFAFAF]">Loading your path...</p>
            </div>
          ) : pathData?.units ? (
            pathData.units.map((unit) => (
              <UnitSection 
                key={unit.id}
                title={unit.title}
                lessons={unit.lessons as any}
                onLessonClick={handleLessonClick}
              />
            ))
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-black text-[#4B4B4B]">No courses found</h2>
              <p className="text-[#AFAFAF] font-bold">Try checking back later!</p>
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8 h-fit lg:sticky lg:top-24">
           {/* Level Widget */}
           <div className="duo-card flex flex-col items-center text-center p-8 bg-white border-2 border-[#E5E5E5] rounded-2xl shadow-[0_4px_0_0_#E5E5E5]">
              <div className="w-20 h-20 bg-[#FF9600] rounded-2xl flex items-center justify-center shadow-[0_6px_0_0_#E6722D] mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
                 <span className="text-3xl font-black text-white">1</span>
              </div>
              <h3 className="text-xl font-black text-[#4B4B4B] mb-2">Novice Learner</h3>
              <p className="text-sm font-bold text-[#AFAFAF] mb-6">Earn 50 more XP to reach Level 2!</p>
              <div className="w-full h-3 bg-[#E5E5E5] rounded-full overflow-hidden mb-6">
                 <div className="h-full bg-[#FF9600] w-1/4" />
              </div>
              <button className="w-full py-3 rounded-xl border-2 border-[#E5E5E5] text-[#1CB0F6] font-black uppercase tracking-wide hover:bg-[#F7F7F7] transition-colors">
                 View Badges
              </button>
           </div>
           
           {/* Daily Quests Mini */}
           <div className="duo-card p-6 bg-white border-2 border-[#E5E5E5] rounded-2xl shadow-[0_4px_0_0_#E5E5E5]">
              <h3 className="text-lg font-black text-[#4B4B4B] mb-4 uppercase tracking-wide">Daily Quests</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-[#FF4B4B]" />
                    <div className="flex-1">
                       <p className="text-sm font-black text-[#4B4B4B]">Earn 10 XP</p>
                       <div className="h-2 bg-[#E5E5E5] rounded-full mt-1">
                          <div className="h-full bg-[#FFC800] w-0" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

