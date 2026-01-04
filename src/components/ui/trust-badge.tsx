"use client";

import { Shield, Award, Crown } from 'lucide-react';

type TrustLevel = 'bronze' | 'silver' | 'gold';

interface TrustBadgeProps {
  level: TrustLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const badgeConfig = {
  bronze: {
    icon: Shield,
    label: 'Bronze',
    bg: 'bg-orange-900/30',
    border: 'border-orange-700/50',
    text: 'text-orange-400',
    iconColor: 'text-orange-500',
  },
  silver: {
    icon: Award,
    label: 'Silver',
    bg: 'bg-slate-400/20',
    border: 'border-slate-400/50',
    text: 'text-slate-300',
    iconColor: 'text-slate-300',
  },
  gold: {
    icon: Crown,
    label: 'Gold',
    bg: 'bg-amber-500/20',
    border: 'border-amber-400/50',
    text: 'text-amber-400',
    iconColor: 'text-amber-400',
  },
};

const sizeConfig = {
  sm: { icon: 'w-3 h-3', text: 'text-[10px]', padding: 'px-1.5 py-0.5', gap: 'gap-0.5' },
  md: { icon: 'w-4 h-4', text: 'text-xs', padding: 'px-2 py-1', gap: 'gap-1' },
  lg: { icon: 'w-5 h-5', text: 'text-sm', padding: 'px-3 py-1.5', gap: 'gap-1.5' },
};

export function TrustBadge({ level, size = 'sm', showLabel = true }: TrustBadgeProps) {
  const config = badgeConfig[level] || badgeConfig.bronze;
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center ${sizes.gap} ${sizes.padding} rounded-full ${config.bg} border ${config.border} backdrop-blur-sm`}
    >
      <Icon className={`${sizes.icon} ${config.iconColor}`} />
      {showLabel && (
        <span className={`${sizes.text} font-semibold ${config.text} uppercase tracking-wider`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

export function TrustBadgeCompact({ level }: { level: TrustLevel }) {
  const config = badgeConfig[level] || badgeConfig.bronze;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${config.bg} border ${config.border}`}
      title={`${config.label} Trust Level`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
    </div>
  );
}
