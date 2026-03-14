"use client";

import { api } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import { Trophy, Shield, Timer, Flame, Medal, Award, Globe, Users } from "lucide-react";
import { ModularAvatar, DEFAULT_AVATAR } from "@/components/avatar/modular-avatar";
import { getLeagueTierName, LEAGUE_TIERS } from "@/lib/gamification";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

export default function LeaderboardsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"league" | "global">("league");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [supabase]);

  const { data: leagueData, isLoading: isLeagueLoading } = api.league.getCurrentLeague.useQuery(undefined, {
    staleTime: 300000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  const { data: globalData, isLoading: isGlobalLoading } = api.league.getGlobalLeaderboard.useQuery(undefined, {
    enabled: activeTab === "global",
    staleTime: 600000, // 10 minutes cache
    refetchOnWindowFocus: false,
  });

  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
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

  const isLoading = (activeTab === "league" && isLeagueLoading) || (activeTab === "global" && isGlobalLoading);

  const userLeague = leagueData?.userLeague;
  const currentTier = userLeague?.leagueGroup?.tier || 1;
  const tierInfo = LEAGUE_TIERS.find(t => t.id === currentTier);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      {/* Left Section: Leaderboard */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-4xl font-black text-[#4B4B4B] tracking-tight">Leaderboards</h1>
          
          {/* Tab Switcher */}
          <div className="flex bg-[#F7F7F7] p-1.5 rounded-2xl w-fit border-2 border-[#E5E5E5]">
            <button 
              onClick={() => setActiveTab("league")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all uppercase tracking-wide",
                activeTab === "league" ? "bg-white text-primary shadow-[0_4px_0_0_#E5E5E5] border-2 border-[#E5E5E5]" : "text-[#AFAFAF] hover:text-[#4B4B4B]"
              )}
            >
              <Users className="w-4 h-4" />
              League
            </button>
            <button 
              onClick={() => setActiveTab("global")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all uppercase tracking-wide",
                activeTab === "global" ? "bg-white text-primary shadow-[0_4px_0_0_#E5E5E5] border-2 border-[#E5E5E5]" : "text-[#AFAFAF] hover:text-[#4B4B4B]"
              )}
            >
              <Globe className="w-4 h-4" />
              Global
            </button>
          </div>
        </div>

        <div className="duo-card p-0 overflow-hidden">
          <div className="bg-[#F7F7F7] px-6 py-4 border-b-2 border-[#E5E5E5] flex items-center justify-between">
            <span className="text-xs font-black text-[#AFAFAF] uppercase tracking-widest">
              {activeTab === "league" ? `${getLeagueTierName(currentTier)} League` : "Platform Top 50"}
            </span>
            {activeTab === "league" && (
              <div className="flex items-center gap-2 text-xs font-black text-[#AFAFAF] uppercase tracking-widest">
                <Timer className="w-4 h-4" />
                <span>{timeLeft} left</span>
              </div>
            )}
          </div>

          <div className="divide-y-2 divide-[#E5E5E5] min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[#AFAFAF] font-black uppercase tracking-widest text-xs">Syncing results...</p>
              </div>
            ) : activeTab === "league" ? (
              leagueData?.leaderboard && leagueData.leaderboard.length > 0 ? (
                leagueData.leaderboard.map((entry, index) => {
                  const isUser = entry.userId === userId;
                  const rank = index + 1;
                  const promotionZone = rank <= 10;
                  const demotionZone = index >= 20 && leagueData.leaderboard.length > 25;

                  return (
                    <div key={entry.id} className={cn("flex items-center gap-4 px-6 py-4 transition-all group", isUser ? "bg-primary/5 border-l-4 border-l-primary shadow-sm" : "hover:bg-[#F7F7F7]")}>
                      <div className="w-8 flex justify-center">
                        <RankBadge rank={rank} zone={promotionZone ? 'promo' : demotionZone ? 'demo' : 'none'} />
                      </div>
                      <UserRow entry={entry} isUser={isUser} xp={entry.xpEarned} />
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                   <Users className="w-12 h-12 text-[#E5E5E5] mb-4" />
                   <h3 className="text-lg font-black text-[#4B4B4B]">Arena is Quiet</h3>
                   <p className="text-sm font-bold text-[#AFAFAF] max-w-[200px]">Complete a lesson to join the race!</p>
                </div>
              )
            ) : (
              (globalData as any)?.topUsers && (globalData as any).topUsers.length > 0 ? (
                (globalData as any).topUsers.map((user: any, index: number) => {
                  const isUser = user.userId === userId;
                  const rank = index + 1;
                  return (
                    <div key={user.userId} className={cn("flex items-center gap-4 px-6 py-4 transition-all group", isUser ? "bg-primary/5 border-l-4 border-l-primary shadow-sm" : "hover:bg-[#F7F7F7]")}>
                      <div className="w-8 flex justify-center">
                        <RankBadge rank={rank} zone="none" />
                      </div>
                      <UserRow 
                        entry={{ 
                          user: { 
                            firstName: user.firstName, 
                            lastName: user.lastName, 
                            studentProfile: { avatarConfig: user.avatarConfig } 
                          } 
                        } as any} 
                        isUser={isUser} 
                        xp={user.xp} 
                      />
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                   <Globe className="w-12 h-12 text-[#E5E5E5] mb-4" />
                   <h3 className="text-lg font-black text-[#4B4B4B]">No Legends Yet</h3>
                </div>
              )
            )}
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
          <h2 className="text-2xl font-black text-[#4B4B4B] mb-2">{getLeagueTierName(currentTier)} League</h2>
          <p className="text-[#AFAFAF] font-bold text-sm mb-6 px-4">
            Compete with real learners to climb the global ranks!
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
             <h3 className="text-lg font-black leading-tight">Platform Legends</h3>
           </div>
           <p className="text-sm font-bold opacity-90 leading-relaxed mb-4">
             The Global Leaderboard tracks total lifetime XP across all courses.
           </p>
           <button className="w-full py-3 bg-white text-primary font-black rounded-2xl shadow-[0_4px_0_0_#E5E5E5] active:translate-y-1 active:shadow-none transition-all text-sm uppercase tracking-wider">
             View All Tiers
           </button>
        </div>
      </div>
    </div>
  );
}

function RankBadge({ rank, zone }: { rank: number, zone: 'promo' | 'demo' | 'none' }) {
  if (rank === 1) return <Medal className="w-6 h-6 text-[#FFD700]" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-[#C0C0C0]" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-[#CD7F32]" />;
  
  return (
    <span className={cn(
      "font-black text-lg",
      zone === 'promo' ? "text-accent" : zone === 'demo' ? "text-destructive" : "text-[#AFAFAF]"
    )}>
      {rank}
    </span>
  );
}

function UserRow({ entry, isUser, xp }: { entry: any, isUser: boolean, xp: number }) {
  return (
    <>
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
          {entry.user.firstName} {entry.user.lastName} {isUser && "(You)"}
        </span>
      </div>

      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1.5 bg-[#F7F7F7] px-3 py-1 rounded-xl group-hover:bg-white transition-colors">
          <Flame className="w-4 h-4 text-[#FF9600] fill-[#FF9600]" />
          <span className="font-black text-[#4B4B4B]">{xp}</span>
        </div>
      </div>
    </>
  );
}
