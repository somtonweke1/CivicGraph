-- CivicGraph Database Schema
-- Created: 2025-10-05
-- Description: Initial database setup for CivicGraph platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CIVIC ACTIONS TABLES
-- =====================================================

-- Civic Actions Table
-- Stores community actions logged by users
CREATE TABLE IF NOT EXISTS civic_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  impact_points NUMERIC DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  verification_method TEXT, -- 'photo', 'peer', 'admin', etc.
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Civic Action Categories
CREATE TABLE IF NOT EXISTS civic_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  impact_multiplier NUMERIC DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Civic Action Verifications (photos, peer confirmations)
CREATE TABLE IF NOT EXISTS civic_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID REFERENCES civic_actions(id) ON DELETE CASCADE NOT NULL,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verification_type TEXT NOT NULL, -- 'photo', 'peer', 'admin'
  verification_data JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NETWORK ANALYSIS TABLES
-- =====================================================

-- Network Nodes Table
CREATE TABLE IF NOT EXISTS network_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  type TEXT, -- 'person', 'organization', 'location', 'action', etc.
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Network Edges Table
CREATE TABLE IF NOT EXISTS network_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES network_nodes(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES network_nodes(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC DEFAULT 1.0,
  type TEXT, -- 'collaboration', 'attendance', 'support', etc.
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source_id, target_id, type)
);

-- Network Analysis Results Cache
CREATE TABLE IF NOT EXISTS network_analysis_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_type TEXT NOT NULL, -- 'centrality', 'community', 'paths', etc.
  algorithm TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  results JSONB NOT NULL,
  node_count INTEGER,
  edge_count INTEGER,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- USER PROFILES & COMMUNITY
-- =====================================================

-- User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  total_impact_points NUMERIC DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  verifications_given INTEGER DEFAULT 0,
  reputation_score NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communities/Organizations
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT, -- 'neighborhood', 'organization', 'initiative', etc.
  location TEXT,
  avatar_url TEXT,
  website TEXT,
  total_impact_points NUMERIC DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Members
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Civic Actions indexes
CREATE INDEX IF NOT EXISTS idx_civic_actions_user_id ON civic_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_civic_actions_category ON civic_actions(category);
CREATE INDEX IF NOT EXISTS idx_civic_actions_created_at ON civic_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_civic_actions_verified ON civic_actions(verified);

-- Network indexes
CREATE INDEX IF NOT EXISTS idx_network_nodes_type ON network_nodes(type);
CREATE INDEX IF NOT EXISTS idx_network_nodes_user_id ON network_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_network_edges_source ON network_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_network_edges_target ON network_edges(target_id);
CREATE INDEX IF NOT EXISTS idx_network_edges_type ON network_edges(type);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_reputation ON user_profiles(reputation_score DESC);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_communities_type ON communities(type);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE civic_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Civic Actions Policies
CREATE POLICY "Users can view all civic actions"
  ON civic_actions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own civic actions"
  ON civic_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own civic actions"
  ON civic_actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own civic actions"
  ON civic_actions FOR DELETE
  USING (auth.uid() = user_id);

-- Civic Categories Policies (public read, admin write)
CREATE POLICY "Anyone can view categories"
  ON civic_categories FOR SELECT
  USING (true);

-- Civic Verifications Policies
CREATE POLICY "Users can view all verifications"
  ON civic_verifications FOR SELECT
  USING (true);

CREATE POLICY "Users can create verifications"
  ON civic_verifications FOR INSERT
  WITH CHECK (auth.uid() = verified_by);

-- Network Nodes Policies
CREATE POLICY "Users can view all network nodes"
  ON network_nodes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own nodes"
  ON network_nodes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own nodes"
  ON network_nodes FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Network Edges Policies
CREATE POLICY "Users can view all network edges"
  ON network_edges FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create edges"
  ON network_edges FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Network Analysis Cache Policies
CREATE POLICY "Users can view analysis cache"
  ON network_analysis_cache FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can write to cache"
  ON network_analysis_cache FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- User Profiles Policies
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Communities Policies
CREATE POLICY "Anyone can view communities"
  ON communities FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create communities"
  ON communities FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Community Members Policies
CREATE POLICY "Anyone can view community members"
  ON community_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join communities"
  ON community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON community_members FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_civic_actions_updated_at
  BEFORE UPDATE ON civic_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_nodes_updated_at
  BEFORE UPDATE ON network_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_edges_updated_at
  BEFORE UPDATE ON network_edges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user impact points when action is verified
CREATE OR REPLACE FUNCTION update_user_impact_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verified = true AND (OLD.verified IS NULL OR OLD.verified = false) THEN
    UPDATE user_profiles
    SET total_impact_points = total_impact_points + NEW.impact_points,
        actions_count = actions_count + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_civic_action_verified
  AFTER UPDATE ON civic_actions
  FOR EACH ROW EXECUTE FUNCTION update_user_impact_points();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default civic categories
INSERT INTO civic_categories (name, description, icon, impact_multiplier) VALUES
  ('Mutual Aid', 'Community support and sharing resources', 'heart', 1.2),
  ('Sustainability', 'Environmental and ecological initiatives', 'leaf', 1.5),
  ('Housing', 'Housing innovations and advocacy', 'home', 1.3),
  ('Education', 'Community learning and skill sharing', 'book', 1.0),
  ('Arts & Culture', 'Creative community building', 'palette', 1.0),
  ('Food Security', 'Community gardens and food sharing', 'utensils', 1.2),
  ('Health & Wellness', 'Community health initiatives', 'heart-pulse', 1.1),
  ('Infrastructure', 'Community infrastructure projects', 'building', 1.4),
  ('Advocacy', 'Policy and systems change work', 'megaphone', 1.3),
  ('Emergency Response', 'Crisis support and disaster relief', 'alert-circle', 1.5)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for user leaderboard
CREATE OR REPLACE VIEW user_leaderboard AS
SELECT
  up.id,
  up.username,
  up.full_name,
  up.avatar_url,
  up.total_impact_points,
  up.actions_count,
  up.reputation_score,
  RANK() OVER (ORDER BY up.total_impact_points DESC) as rank
FROM user_profiles up
ORDER BY up.total_impact_points DESC;

-- View for recent civic actions with user info
CREATE OR REPLACE VIEW recent_civic_actions AS
SELECT
  ca.id,
  ca.title,
  ca.description,
  ca.category,
  ca.impact_points,
  ca.verified,
  ca.created_at,
  up.username,
  up.full_name,
  up.avatar_url
FROM civic_actions ca
LEFT JOIN user_profiles up ON ca.user_id = up.id
ORDER BY ca.created_at DESC;

-- View for community impact stats
CREATE OR REPLACE VIEW community_impact_stats AS
SELECT
  c.id,
  c.name,
  c.type,
  c.total_impact_points,
  c.member_count,
  COUNT(DISTINCT ca.id) as total_actions,
  SUM(ca.impact_points) as calculated_impact
FROM communities c
LEFT JOIN community_members cm ON c.id = cm.community_id
LEFT JOIN civic_actions ca ON cm.user_id = ca.user_id
GROUP BY c.id, c.name, c.type, c.total_impact_points, c.member_count;

-- Grant access to views
GRANT SELECT ON user_leaderboard TO authenticated, anon;
GRANT SELECT ON recent_civic_actions TO authenticated, anon;
GRANT SELECT ON community_impact_stats TO authenticated, anon;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'CivicGraph database schema created successfully!';
  RAISE NOTICE 'Tables: civic_actions, network_nodes, network_edges, user_profiles, communities';
  RAISE NOTICE 'Default categories seeded. RLS policies enabled.';
END $$;
