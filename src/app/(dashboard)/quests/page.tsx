"use client";

import { api } from "@/utils/trpc";
import { Target, Zap, Award, Flame, CheckCircle2, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function QuestsPage() {
  const { data: quests, isLoading, refetch } = api.quest.getDailyQuests.useQuery();
  const claimMutation = api.quest.claimReward.useMutation({
    onSuccess: (data) => {
      toast.success(`Reward claimed! +${data.xpEarned} XP`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col gap-2 mb-8 md:mb-12 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black text-[#4B4B4B] tracking-tight">Daily Quests</h1>
        <p className="text-[#AFAFAF] font-bold text-base md:text-lg">Complete challenges to earn extra XP and rewards!</p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="duo-card p-6 md:p-8 animate-pulse bg-gray-50 flex items-center gap-6 h-32 w-full rounded-2xl" />
          ))
        ) : quests?.length ? (
          quests.map((uq: any) => (
            <QuestRow 
              key={uq.id} 
              uq={uq} 
              isClaiming={claimMutation.isPending && claimMutation.variables?.userQuestId === uq.id}
              onClaim={() => claimMutation.mutate({ userQuestId: uq.id })}
            />
          ))
        ) : (
          <div className="duo-card p-12 text-center flex flex-col items-center gap-4 border-dashed bg-gray-50/50">
            <Gift className="w-12 h-12 text-[#AFAFAF] opacity-30" />
            <p className="text-[#AFAFAF] font-black uppercase tracking-widest text-sm">No Quests Available Today</p>
          </div>
        )}
      </div>

      {/* Persistence Note */}
      <p className="mt-8 text-center text-[#AFAFAF] text-xs font-bold uppercase tracking-widest leading-relaxed">
        Quests reset daily at UTC midnight. <br className="md:hidden" /> Complete them early to maximize your rewards!
      </p>
    </div>
  );
}

function QuestRow({ uq, isClaiming, onClaim }: { uq: any, isClaiming: boolean, onClaim: () => void }) {
  const quest = uq.quest;
  const progress = Math.min((uq.currentValue / quest.targetValue) * 100, 100);
  const isCompleted = uq.isCompleted;
  const isClaimed = uq.isClaimed;

  const getIcon = (type: string) => {
    switch (type) {
      case "XP_GAIN": return <Zap className="w-6 h-6 md:w-8 md:h-8 text-[#3CC7F5] fill-[#3CC7F5]" />;
      case "LESSON_COMPLETE": return <Target className="w-6 h-6 md:w-8 md:h-8 text-[#FF4B4B]" />;
      case "UNIT_COMPLETE": return <Award className="w-6 h-6 md:w-8 md:h-8 text-[#FFC800]" />;
      default: return <Flame className="w-6 h-6 md:w-8 md:h-8 text-primary" />;
    }
  };

  return (
    <div className={cn(
      "duo-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 transition-all relative overflow-hidden",
      isClaimed && "opacity-60 bg-gray-50 grayscale-[0.5]"
    )}>
      <div className={cn(
        "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_4px_0_0_rgba(0,0,0,0.1)]",
        isClaimed ? "bg-gray-200" : "bg-white border-2 border-[#E5E5E5]"
      )}>
        {getIcon(quest.type)}
      </div>

      <div className="flex-1 text-center md:text-left w-full">
        <h3 className="text-xl md:text-2xl font-black text-[#4B4B4B] mb-1 leading-tight">{quest.title}</h3>
        <p className="text-[#AFAFAF] font-bold text-sm md:text-base mb-4 leading-relaxed">{quest.description}</p>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 md:h-4 bg-[#E5E5E5] rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                isCompleted ? "bg-[#58CC02]" : "bg-[#FFC800]"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm md:text-base font-black text-[#4B4B4B] tabular-nums whitespace-nowrap">
            {uq.currentValue} / {quest.targetValue}
          </span>
        </div>
      </div>

      <div className="shrink-0 w-full md:w-auto">
        {isClaimed ? (
          <div className="flex items-center justify-center md:justify-start gap-2 px-6 py-3 text-[#58CC02] font-black uppercase tracking-widest text-sm italic">
            <CheckCircle2 className="w-5 h-5" />
            Claimed
          </div>
        ) : isCompleted ? (
          <button
            onClick={onClaim}
            disabled={isClaiming}
            className="w-full md:w-auto px-10 py-4 bg-[#58CC02] text-white font-black rounded-2xl shadow-[0_4px_0_0_#46A302] transition-all hover:scale-[1.02] active:scale-95 text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {isClaiming ? "Claiming..." : "Claim Reward"}
          </button>
        ) : (
          <div className="flex items-center justify-center md:justify-start gap-2 px-6 py-3 bg-[#F7F7F7] text-[#AFAFAF] font-black rounded-2xl border-2 border-[#E5E5E5] text-xs uppercase tracking-widest min-w-[160px]">
            +{quest.xpReward} XP Reward
          </div>
        )}
      </div>
    </div>
  );
}
