// Shapes returned by the CheckTag /api used by the mini app.

export type Tone = "good" | "warn" | "bad";

export interface IngredientDetail {
  name: string;
  impact?: string;
  verdict?: string;
  tone?: Tone;
}

export interface Product {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  category?: string;
  aiStatus: "pending" | "ready" | "failed" | "none" | "stalled";
  aiOverview?: string;
  safetyWarning?: string;
  rating?: number; // overall: AI score blended with shopper reviews
  aiRating?: number;
  communityRating?: number;
  reviewCount?: number;
  ratingSummary?: string;
  verdict?: string;
  verdictTone?: Tone;
  ingredients?: string[];
  ingredientsDetailed?: IngredientDetail[];
  description?: string;
  nutrition?: Record<string, string | number>;
  certifications?: string[];
  productType?: string;
  consumable: boolean;
  allergens?: string[];
  netQuantity?: string;
  servingSize?: string;
  details?: Record<string, string>;
  verifiedFields?: string[];
  verifiedAt?: string;
}

export interface Region {
  country: string | null;
  name?: string | null;
  source?: "user" | "ip" | "hint" | string | null;
}

export interface Me {
  signedIn: boolean;
  via?: string;
  name?: string | null;
  region?: Region;
}

export interface ScanResult {
  product: Product;
  rewardEligible?: boolean;
  signedIn?: boolean;
  fromScan?: boolean;
}

export interface HistoryItem {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  rating?: number;
  verdict?: string;
  scannedAt: string;
}

export interface SimilarItem {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  rating?: number;
  verdict?: string;
  why?: string;
  availableInRegion?: boolean;
}

export interface Similar {
  category?: string | null;
  items: SimilarItem[];
}

export interface GlobalStats {
  scans?: { total?: number; last30Days?: number; uniqueScanners?: number };
  cashback?: { pointsEarned?: number; usdValue?: number };
  topRegions?: { country: string; name?: string; scans: number }[];
}

export interface FeedItem {
  barcode: string;
  name: string;
  imageUrl?: string;
  country?: string;
  countryName?: string;
  at: string;
  earnedCashback?: boolean;
}

export interface Feed {
  last24h?: { scans?: number; countries?: number; usdValue?: number; pointsEarned?: number };
  items: FeedItem[];
}

export interface Cashback {
  points?: { balance?: number; balanceUsd?: number; lifetimeEarned?: number };
  cash?: { redeemedUsd?: number; withdrawnUsd?: number; balanceUsd?: number };
  pointsPerUsd?: number;
  monthly?: { month: string; points: number }[];
  bySource?: Record<string, number>;
  topProducts?: { barcode: string; name: string; imageUrl?: string; scans: number; points: number; usdValue: number }[];
}

export type ReviewPending = "pending" | "hidden" | "removed";

export interface Review {
  id: string;
  rating: number;
  body?: string | null;
  author?: string;
  avatarUrl?: string | null;
  authorId: string;
  verifiedScan?: boolean;
  helpfulCount?: number;
  createdAt: string;
  edited?: boolean;
  mine?: boolean;
  pending?: ReviewPending | null;
  votedHelpful?: boolean;
}

export interface ReviewSummary {
  count: number;
  average: number | null;
  distribution: Record<string, number>;
}

export interface ReviewPage {
  summary: ReviewSummary;
  items: Review[];
  nextOffset: number | null;
  mine?: Review | null;
}

export interface Guidelines {
  version: string;
  title: string;
  points: string[];
  zeroTolerance?: string;
  contact?: string;
}

export interface LabelChange {
  field: string;
  label?: string;
  status: "new" | "changed" | "unchanged" | "not_found";
  current?: unknown;
  proposed?: unknown;
  wasVerified?: boolean;
  newFieldKeys?: string[];
}

export interface LabelScan {
  ok?: boolean;
  reason?: string;
  message?: string;
  token: string;
  changes: LabelChange[];
  product?: { name?: string };
  extraction?: { productName?: string; confidence?: string };
}

export interface BlockedUser {
  userId: string;
  name?: string;
}
