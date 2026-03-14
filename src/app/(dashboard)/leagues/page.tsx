"use client";

import { api } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import { Trophy, Shield, Timer, Flame, Medal, Award, Globe, Users, Calendar } from "lucide-react";
import { ModularAvatar, DEFAULT_AVATAR } from "@/components/avatar/modular-avatar";
import { getLeagueTierName, LEAGUE_TIERS } from "@/lib/gamification";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

export default function LeaderboardsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"league" | "week" | "all">("league");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [supabase]);

  // Queries for the three views
  const { data: leagueData, isLoading: isLeagueLoading } = api.league.getCurrentLeague.useQuery(undefined, {
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  const { data: weekData, isLoading: isWeekLoading } = api.league.getThisWeekLeaderboard.useQuery(undefined, {
    enabled: activeTab === "week",
    staleTime: 300000,
  });

  const { data: allTimeData, isLoading: isAllTimeLoading } = api.league.getAllTimeLeaderboard.useQuery(undefined, {
    enabled: activeTab === "all",
    staleTime: 600000,
  });

  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextMonday = new Date();
      nextMonday.setUTCDate(now.getUTCDate() + (7 - (now.getUTCDay() || 7)) + 1);
      nextMonday.setUTCHours(0, 0, 0, 0);
      const diff = nextMonday.getTime() - now.getTime();
      setTimeLeft(`${Math.floor(diff / (1000 * 60 * 60 * 24))}d ${Math.floor((diff / (1000 * 60 * 60)) % 24)}h ${Math.floor((diff / 1000 / 60) % 60)}m`);
    };
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, []);

  const isLoading = (activeTab === "league" && isLeagueLoading) || (activeTab === "week" && isWeekLoading) || (activeTab === "all" && isAllTimeLoading);

  const currentTier = leagueData?.userLeague?.leagueGroup?.tier || 1;
  const tierInfo = LEAGUE_TIERS.find(t => t.id === currentTier);

  // Determine if user is in the visible top list
  const getPersonalRankInfo = () => {
    if (activeTab === "league") return { rank: leagueData?.personalRank || 0, xp: leagueData?.userLeague?.xpEarned || 0, inList: (leagueData?.personalRank || 0) <= 30 };
    if (activeTab === "week") return { rank: weekData?.personalRank || 0, xp: weekData?.personalXp || 0, inList: (weekData?.personalRank || 0) <= 50 };
    return { rank: allTimeData?.personalRank || 0, xp: allTimeData?.personalXp || 0, inList: (allTimeData?.personalRank || 0) <= 50 };
  };

  const personalInfo = getPersonalRankInfo();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pb-32">
      {/* Centered Header */}
      <div className="flex flex-col items-center text-center gap-6 mb-12 pt-8">
        <h1 className="text-4xl md:text-5xl font-black text-[#4B4B4B] tracking-tight">Leaderboards</h1>
        
        {/* Responsive Tab Switcher */}
        <div className="flex flex-wrap justify-center bg-[#F7F7F7] p-1.5 rounded-2xl w-full max-w-lg border-2 border-[#E5E5E5] gap-1">
          <TabButton active={activeTab === "league"} onClick={() => setActiveTab("league")} icon={Users} label="League" />
          <TabButton active={activeTab === "week"} onClick={() => setActiveTab("week")} icon={Calendar} label="This Week" />
          <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")} icon={Globe} label="All Time" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Leaderboard Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="duo-card p-0 overflow-hidden relative min-h-[500px]">
            {/* Header of Content */}
            <div className="bg-[#F7F7F7] px-6 py-4 border-b-2 border-[#E5E5E5] flex items-center justify-between">
              <span className="text-xs font-black text-[#AFAFAF] uppercase tracking-widest">
                {activeTab === "league" ? `${getLeagueTierName(currentTier)} League` : activeTab === "week" ? "Global Weekly" : "All Time Legends"}
              </span>
              {activeTab !== "all" && (
                <div className="flex items-center gap-2 text-xs font-black text-[#AFAFAF] uppercase tracking-widest">
                  <Timer className="w-4 h-4" />
                  <span>{timeLeft} left</span>
                </div>
              )}
            </div>

            {/* List */}
            <div className="divide-y-2 divide-[#E5E5E5]">
              {isLoading ? (
                <LoadingSkeleton />
              ) : activeTab === "league" ? (
                leagueData?.leaderboard.map((entry, index) => (
                  <LeaderboardRow key={entry.id} rank={index + 1} entry={entry} isUser={entry.userId === userId} xp={entry.xpEarned} />
                ))
              ) : activeTab === "week" ? (
                weekData?.topUsers.map((user, index) => (
                  <LeaderboardRow key={user.userId} rank={index + 1} entry={user} isUser={user.userId === userId} xp={user.xp} />
                ))
              ) : (
                allTimeData?.topUsers.map((user, index) => (
                  <LeaderboardRow key={user.userId} rank={index + 1} entry={user} isUser={user.userId === userId} xp={user.xp} />
                ))
              )}

              {/* Empty State */}
              {!isLoading && ((activeTab === "league" && !leagueData?.leaderboard.length) || (activeTab === "week" && !weekData?.topUsers.length)) && (
                <EmptyState icon={activeTab === "league" ? Users : Calendar} />
              )}
            </div>

            {/* Pinned Personal Rank (Sticky Footer) */}
            {!isLoading && !personalInfo.inList && personalInfo.rank > 0 && (
              <div className="sticky bottom-0 bg-white border-t-4 border-primary/20 shadow-[0_-8px_16px_rgba(0,0,0,0.05)] px-6 py-4 flex items-center gap-4 animate-in slide-in-from-bottom-full duration-500">
                <div className="w-8 flex justify-center font-black text-primary text-lg">{personalInfo.rank}</div>
                <div className="flex-1 flex flex-col">
                  <span className="font-black text-primary">Your Progress (Outside Top 50)</span>
                  <span className="text-xs font-bold text-[#AFAFAF] uppercase tracking-widest">Keep going to reach the top!</span>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-xl">
                  <Flame className="w-4 h-4 text-primary fill-primary" />
                  <span className="font-black text-primary">{personalInfo.xp}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info - Hidden on mobile or moved */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="duo-card p-8 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-3xl mb-6 flex items-center justify-center shadow-[0_8px_0_0_rgba(0,0,0,0.1)] transition-transform hover:rotate-3" style={{ backgroundColor: tierInfo?.color || '#CD7F32' }}>
              <Shield className="text-white w-16 h-16 drop-shadow-lg" />
            </div>
            <h2 className="text-2xl font-black text-[#4B4B4B] mb-2">{getLeagueTierName(currentTier)} League</h2>
            <p className="text-[#AFAFAF] font-bold text-sm mb-6">Compete with real learners to climb the global ranks!</p>
            <TierMilestones />
          </div>

          <div className="duo-card p-6 bg-primary text-white border-primary shadow-[0_8px_0_0_#E6722D]">
             <div className="flex items-center gap-4 mb-4">
               <Award className="w-8 h-8 text-white p-1 bg-white/20 rounded-lg" />
               <h3 className="text-lg font-black leading-tight">Arena Statistics</h3>
             </div>
             <p className="text-sm font-bold opacity-90 leading-relaxed mb-4">The Global Leaderboards track the most dedicated learners across OmniiLearn.</p>
             <button className="w-full py-3 bg-white text-primary font-black rounded-2xl shadow-[0_4px_0_0_#E5E5E5] transition-all text-sm uppercase tracking-wider active:scale-95">View Rewards</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all uppercase tracking-wide",
        active ? "bg-white text-primary shadow-[0_4px_0_0_#E5E5E5] ring-2 ring-[#E5E5E5]" : "text-[#AFAFAF] hover:text-[#4B4B4B]"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.charAt(0)}</span>
    </button>
  );
}

function LeaderboardRow({ rank, entry, isUser, xp }: { rank: number, entry: any, isUser: boolean, xp: number }) {
  return (
    <div className={cn(
      "flex items-center gap-4 px-6 py-4 transition-all group border-l-4",
      isUser ? "bg-primary/5 border-l-primary" : "hover:bg-[#F7F7F7] border-l-transparent"
    )}>
      <div className="w-8 flex justify-center shrink-0">
        {rank === 1 ? <Medal className="w-7 h-7 text-[#FFD700] drop-shadow-sm" /> : 
         rank === 2 ? <Medal className="w-7 h-7 text-[#C0C0C0] drop-shadow-sm" /> : 
         rank === 3 ? <Medal className="w-7 h-7 text-[#CD7F32] drop-shadow-sm" /> : 
         <span className={cn("font-black text-lg", rank <= 10 ? "text-accent" : "text-[#AFAFAF]")}>{rank}</span>}
      </div>

      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E5E5E5] bg-white group-hover:border-primary transition-all shrink-0">
        <ModularAvatar 
          config={((entry.user?.studentProfile || entry).avatarConfig as any) || DEFAULT_AVATAR} 
          size={48} 
          showBackground={true}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("font-black text-lg truncate", isUser ? "text-primary" : "text-[#4B4B4B]")}>
            {(entry.user?.firstName || entry.firstName)} {(entry.user?.lastName || entry.lastName)}
          </span>
          {isUser && <span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">You</span>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-[#F7F7F7] px-3 py-1.5 rounded-xl group-hover:bg-white transition-colors shrink-0">
        <Flame className="w-4 h-4 text-[#FF9600] fill-[#FF9600]" />
        <span className="font-black text-[#4B4B4B]">{xp}</span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-[#AFAFAF] font-black uppercase tracking-widest text-xs">Summoning Legends...</p>
    </div>
  );
}

function EmptyState({ icon: Icon }: { icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
       <Icon className="w-16 h-16 text-[#E5E5E5] mb-4" />
       <h3 className="text-xl font-black text-[#4B4B4B] mb-2">The arena is quiet.</h3>
       <p className="text-sm font-bold text-[#AFAFAF] max-w-[240px]">Be the first to leave your mark in this week's history!</p>
    </div>
  );
}

function TierMilestones() {
  return (
    <div className="w-full space-y-4 pt-6 border-t-2 border-[#E5E5E5]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-[#AFAFAF] uppercase tracking-widest">Promotion Zone</span>
        <span className="flex items-center gap-1 text-xs font-black text-accent uppercase tracking-widest"><Award className="w-3 h-3" /> Top 10</span>
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
  );
}
