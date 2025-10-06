
export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  trust_score?: number;
  role?: string;
};

export type CivicAction = {
  id: string;
  title: string;
  details: string;
  location: string;
  action_type: string;
  user_id: string;
  created_at: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_method?: string;
  verification_url?: string;
  impact_tags?: string[];
  category_id?: number;
};

export type Category = {
  id: number;
  name: string;
  description?: string;
};

export type Verification = {
  id: string;
  action_id: string;
  user_id: string;
  method: 'photo' | 'receipt' | 'peer' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  evidence_url?: string;
  created_at: string;
};

export type ActionImpact = {
  id: string;
  action_id: string;
  impact_type: 'sustainability' | 'mutual_aid' | 'urban_density' | 'community_building';
  impact_score: number;
};
