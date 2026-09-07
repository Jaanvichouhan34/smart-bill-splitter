export interface ColorTheme {
  id: number;
  name: string;
  avatarBg: string;
  avatarText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  activeChipBg: string;
  activeChipText: string;
  activeChipBorder: string;
  ring: string;
  glow: string;
}

export const PARTICIPANT_COLORS: ColorTheme[] = [
  {
    id: 0,
    name: 'Indigo',
    avatarBg: 'bg-indigo-500',
    avatarText: 'text-white',
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-indigo-500/40',
    activeChipBg: 'bg-indigo-600',
    activeChipText: 'text-white',
    activeChipBorder: 'border-indigo-400',
    ring: 'ring-indigo-500',
    glow: 'shadow-indigo-500/30',
  },
  {
    id: 1,
    name: 'Emerald',
    avatarBg: 'bg-emerald-500',
    avatarText: 'text-white',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/40',
    activeChipBg: 'bg-emerald-600',
    activeChipText: 'text-white',
    activeChipBorder: 'border-emerald-400',
    ring: 'ring-emerald-500',
    glow: 'shadow-emerald-500/30',
  },
  {
    id: 2,
    name: 'Amber',
    avatarBg: 'bg-amber-500',
    avatarText: 'text-white',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/40',
    activeChipBg: 'bg-amber-600',
    activeChipText: 'text-white',
    activeChipBorder: 'border-amber-400',
    ring: 'ring-amber-500',
    glow: 'shadow-amber-500/30',
  },
  {
    id: 3,
    name: 'Rose',
    avatarBg: 'bg-rose-500',
    avatarText: 'text-white',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-500/40',
    activeChipBg: 'bg-rose-600',
    activeChipText: 'text-white',
    activeChipBorder: 'border-rose-400',
    ring: 'ring-rose-500',
    glow: 'shadow-rose-500/30',
  },
  {
    id: 4,
    name: 'Cyan',
    avatarBg: 'bg-cyan-500',
    avatarText: 'text-slate-900',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/40',
    activeChipBg: 'bg-cyan-600',
    activeChipText: 'text-white',
    activeChipBorder: 'border-cyan-400',
    ring: 'ring-cyan-500',
    glow: 'shadow-cyan-500/30',
  },
  {
    id: 5,
    name: 'Purple',
    avatarBg: 'bg-purple-500',
    avatarText: 'text-white',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-500/40',
    activeChipBg: 'bg-purple-600',
    activeChipText: 'text-white',
    activeChipBorder: 'border-purple-400',
    ring: 'ring-purple-500',
    glow: 'shadow-purple-500/30',
  },
  {
    id: 6,
    name: 'Orange',
    avatarBg: 'bg-orange-500',
    avatarText: 'text-white',
    badgeBg: 'bg-orange-500/15',
    badgeText: 'text-orange-300',
    badgeBorder: 'border-orange-500/40',
    activeChipBg: 'bg-orange-600',
    activeChipText: 'text-white',
    activeChipBorder: 'border-orange-400',
    ring: 'ring-orange-500',
    glow: 'shadow-orange-500/30',
  },
  {
    id: 7,
    name: 'Pink',
    avatarBg: 'bg-pink-500',
    avatarText: 'text-white',
    badgeBg: 'bg-pink-500/15',
    badgeText: 'text-pink-300',
    badgeBorder: 'border-pink-500/40',
    activeChipBg: 'bg-pink-600',
    activeChipText: 'text-white',
    activeChipBorder: 'border-pink-400',
    ring: 'ring-pink-500',
    glow: 'shadow-pink-500/30',
  },
  {
    id: 8,
    name: 'Teal',
    avatarBg: 'bg-teal-500',
    avatarText: 'text-white',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-300',
    badgeBorder: 'border-teal-500/40',
    activeChipBg: 'bg-teal-600',
    activeChipText: 'text-white',
    activeChipBorder: 'border-teal-400',
    ring: 'ring-teal-500',
    glow: 'shadow-teal-500/30',
  },
  {
    id: 9,
    name: 'Violet',
    avatarBg: 'bg-violet-500',
    avatarText: 'text-white',
    badgeBg: 'bg-violet-500/15',
    badgeText: 'text-violet-300',
    badgeBorder: 'border-violet-500/40',
    activeChipBg: 'bg-violet-600',
    activeChipText: 'text-white',
    activeChipBorder: 'border-violet-400',
    ring: 'ring-violet-500',
    glow: 'shadow-violet-500/30',
  },
  {
    id: 10,
    name: 'Lime',
    avatarBg: 'bg-lime-500',
    avatarText: 'text-slate-950',
    badgeBg: 'bg-lime-500/15',
    badgeText: 'text-lime-300',
    badgeBorder: 'border-lime-500/40',
    activeChipBg: 'bg-lime-600',
    activeChipText: 'text-white',
    activeChipBorder: 'border-lime-400',
    ring: 'ring-lime-500',
    glow: 'shadow-lime-500/30',
  },
  {
    id: 11,
    name: 'Sky',
    avatarBg: 'bg-sky-500',
    avatarText: 'text-white',
    badgeBg: 'bg-sky-500/15',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-500/40',
    activeChipBg: 'bg-sky-600',
    activeChipText: 'text-white',
    activeChipBorder: 'border-sky-400',
    ring: 'ring-sky-500',
    glow: 'shadow-sky-500/30',
  },
];

export function getParticipantColorTheme(colorIndex: number): ColorTheme {
  const safeIndex = Math.abs(Math.floor(colorIndex || 0)) % PARTICIPANT_COLORS.length;
  return PARTICIPANT_COLORS[safeIndex];
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
