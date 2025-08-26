/**
 * Type definitions for Social Raids Plugin
 */

export interface RaidConfig {
  targetUrl: string;
  duration: number; // in minutes
  strategy: 'wave' | 'burst' | 'stealth';
  pointsPerAction: EngagementPoints;
  maxParticipants: number;
  minParticipants: number;
  chatIds?: string[];
  autoEngageAgent?: boolean;
}

export interface EngagementPoints {
  like: number;
  retweet: number;
  quote: number;
  comment: number;
  share: number;
}

export interface RaidParticipant {
  id: string;
  userId: string;
  username: string;
  telegramId?: number;
  joinedAt: Date;
  isActive: boolean;
  role: 'participant' | 'leader' | 'moderator';
  actionsCount: number;
  pointsEarned: number;
  lastActionAt?: Date;
  engagementTypes: string[];
}

export interface RaidStatus {
  id: string;
  sessionId: string;
  platform: string;
  targetUrl: string;
  targetPlatform: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  participantCount: number;
  totalEngagements: number;
  pointsDistributed: number;
  createdAt: Date;
  endedAt?: Date;
  participants: RaidParticipant[];
  config: RaidConfig;
}

export interface CommunityInteraction {
  id: string;
  userId: string;
  username: string;
  interactionType: string;
  content: string;
  context: any;
  weight: number;
  sentimentScore: number;
  relatedRaidId?: string;
  timestamp: Date;
  // Cross-platform identity support
  platform?: string;
  originalUserId?: string;
  roomId?: string;
}

export interface UserStats {
  userId: string;
  username: string;
  totalPoints: number;
  raidsParticipated: number;
  successfulEngagements: number;
  streak: number;
  rank: number;
  badges: string[];
  lastActivity: Date;
  personalityProfile: any;
}

export interface TweetData {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  metrics: {
    likes: number;
    retweets: number;
    quotes: number;
    comments: number;
  };
}

export interface TwitterAuthConfig {
  username: string;
  password: string;
  email?: string;
  cookies?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// Coordinator API response shapes
export interface StartRaidResponse {
  success: boolean;
  raidId?: string;
  error?: string;
}

export interface JoinRaidResponse {
  success: boolean;
  raidId?: string;
  participantNumber?: number;
  targetUrl?: string;
  error?: string;
}

export interface SubmitEngagementResponse {
  success: boolean;
  raidId?: string;
  totalPoints?: number;
  rank?: number;
  rankChange?: number;
  streak?: number;
  bonusPoints?: number;
  error?: string;
}

export interface LeaderboardEntry {
  username: string;
  total_points: number;
  raids_participated?: number;
  streak?: number;
}

export interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
  userRank?: number;
  totalUsers?: number;
  error?: string;
}

export interface RaidDetails {
  created_at: string;
  target_url: string;
  status: string;
  participant_count: number;
  total_engagements: number;
  points_distributed: number;
}

export interface RaidStatusResponse {
  success: boolean;
  raid?: RaidDetails;
  error?: string;
}

export interface TelegramCallbackData {
  action: string;
  raidId?: string;
  userId?: string;
  engagementType?: string;
}

export const DEFAULT_ENGAGEMENT_POINTS: EngagementPoints = {
  like: 1,
  retweet: 2,
  quote: 3,
  comment: 5,
  share: 2,
};

export const RAID_STRATEGIES = {
  WAVE: 'wave', // Gradual engagement over time
  BURST: 'burst', // Immediate mass engagement
  STEALTH: 'stealth', // Slow, organic-looking engagement
} as const;

export const RAID_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const USER_ROLES = {
  PARTICIPANT: 'participant',
  LEADER: 'leader',
  MODERATOR: 'moderator',
} as const;
