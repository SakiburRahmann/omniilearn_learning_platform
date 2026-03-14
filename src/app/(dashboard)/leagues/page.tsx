"use client";

import { api } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import { Trophy, Shield, Timer, Flame, Medal, Award } from "lucide-react";
import { ModularAvatar, DEFAULT_AVATAR } from "@/components/avatar/modular-avatar";
import { getLeagueTierName, LEAGUE_TIERS } from "@/lib/gamification";
import { useEffect, useState } from "react";

export default function LeaguesPage() {
  const { data: leagueData, isLoading } = api.league.getCurrentLeague.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Reset is at the end of the week (Sunday night UTC)
      const nextMonday = new Date();
      nextMonday.setUTCDate(now.getUTCDate() + (7 - (now.getUTCDay() || 7)) + 1);
      nextMonday.setUTCHours(0, 0, 0, 0);
      
      const diff = nextMonday.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[#AFAFAF] font-black uppercase tracking-widest">Entering the Arena...</p>
      </div>
    );
  }

  const userLeague = leagueData?.userLeague;
  const currentTier = userLeague?.leagueGroup?.tier || 1;
  const tierInfo = LEAGUE_TIERS.find(t => t.id === currentTier);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      {/* Left Section: Leaderboard */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-4xl font-black text-[#4B4B4B] tracking-tight">
            {getLeagueTierName(currentTier)} League
          </h1>
          <p className="text-[#AFAFAF] font-bold">
            Rank in the top 10 to advance to the next league!
          </p>
        </div>

        <div className="duo-card p-0 overflow-hidden">
          <div className="bg-[#F7F7F7] px-6 py-4 border-b-2 border-[#E5E5E5] flex items-center justify-between">
            <span className="text-xs font-black text-[#AFAFAF] uppercase tracking-widest">Current Standings</span>
            <div className="flex items-center gap-2 text-xs font-black text-[#AFAFAF] uppercase tracking-widest">
              <Timer className="w-4 h-4" />
              <span>{timeLeft} left</span>
            </div>
          </div>

          <div className="divide-y-2 divide-[#E5E5E5]">
            {leagueData?.leaderboard.map((entry, index) => {
              const isUser = entry.userId === userLeague?.userId;
              const rank = index + 1;
              const promotionZone = rank <= 10;
              const demotionZone = index >= 20 && leagueData.leaderboard.length > 25;

              return (
                <div 
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 transition-all group",
                    isUser ? "bg-primary/5 sticky bottom-0 border-t-2 border-b-2 border-primary z-10" : "hover:bg-[#F7F7F7]"
                  )}
                >
                  <div className="w-8 flex justify-center">
                    {rank === 1 ? (
                      <Medal className="w-6 h-6 text-[#FFD700]" />
                    ) : rank === 2 ? (
                      <Medal className="w-6 h-6 text-[#C0C0C0]" />
                    ) : rank === 3 ? (
                      <Medal className="w-6 h-6 text-[#CD7F32]" />
                    ) : (
                      <span className={cn(
                        "font-black text-lg",
                        promotionZone ? "text-accent" : demotionZone ? "text-destructive" : "text-[#AFAFAF]"
                      )}>
                        {rank}
                      </span>
                    )}
                  </div>

                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E5E5E5] bg-white group-hover:border-primary transition-all">
                    <ModularAvatar 
                      config={(entry.user.studentProfile?.avatarConfig as any) || DEFAULT_AVATAR} 
                      size={48} 
                      showBackground={true}
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <span className={cn(
                      "font-black text-lg",
                      isUser ? "text-primary" : "text-[#4B4B4B]"
                    )}>
                      {entry.user.firstName} {entry.user.lastName}
                    </span>
                    {promotionZone && rank > 3 && (
                      <span className="text-[10px] font-black text-accent uppercase tracking-tighter">Promotion Zone</span>
                    )}
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 bg-[#F7F7F7] px-3 py-1 rounded-xl group-hover:bg-white transition-colors">
                      <Flame className="w-4 h-4 text-[#FF9600] fill-[#FF9600]" />
                      <span className="font-black text-[#4B4B4B]">{entry.xpEarned}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Section: Perks & Overview */}
      <div className="space-y-6">
        <div className="duo-card p-8 flex flex-col items-center text-center">
          <div 
            className="w-32 h-32 rounded-3xl mb-6 flex items-center justify-center shadow-[0_8px_0_0_rgba(0,0,0,0.1)] transition-transform hover:scale-110 duration-500"
            style={{ backgroundColor: tierInfo?.color || '#CD7F32' }}
          >
            <Shield className="text-white w-16 h-16 drop-shadow-lg" />
          </div>
          <h2 className="text-2xl font-black text-[#4B4B4B] mb-2">You're in {getLeagueTierName(currentTier)} League!</h2>
          <p className="text-[#AFAFAF] font-bold text-sm mb-6 px-4">
            Compete with 30 others to reach the top. Stay disciplined to avoid demotion!
          </p>
          
          <div className="w-full space-y-3 pt-6 border-t-2 border-[#E5E5E5]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#AFAFAF] uppercase tracking-widest">Promotion Zone</span>
              <span className="text-xs font-black text-accent uppercase tracking-widest">Top 10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#AFAFAF] uppercase tracking-widest">Safe Zone</span>
              <span className="text-xs font-black text-[#4B4B4B] uppercase tracking-widest">Rank 11-20</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#AFAFAF] uppercase tracking-widest">Demotion Zone</span>
              <span className="text-xs font-black text-destructive uppercase tracking-widest">Bottom 10</span>
            </div>
          </div>
        </div>

        <div className="duo-card p-6 bg-primary text-white border-primary shadow-[0_8px_0_0_#E6722D]">
           <div className="flex items-center gap-4 mb-4">
             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
               <Award className="w-6 h-6 text-white" />
             </div>
             <h3 className="text-lg font-black leading-tight">Elite Scholar Rewards</h3>
           </div>
           <p className="text-sm font-bold opacity-90 leading-relaxed mb-4">
             Finish in the Top 3 to earn League Badges and a week of infinite hearts!
           </p>
           <button className="w-full py-3 bg-white text-primary font-black rounded-2xl shadow-[0_4px_0_0_#E5E5E5] active:translate-y-1 active:shadow-none transition-all text-sm uppercase tracking-wider">
             View All Leagues
           </button>
        </div>
      </div>
    </div>
  );
}
