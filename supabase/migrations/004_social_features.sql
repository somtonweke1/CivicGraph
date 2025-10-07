-- ========================================
-- SOCIAL FEATURES: Comments, Likes, Follows, Notifications
-- ========================================

-- ========================================
-- NOTIFICATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'achievement', 'milestone', 'system', 'mention')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT,
  actor_avatar TEXT,
  related_action_id UUID REFERENCES civic_actions(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ========================================
-- COMMENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID NOT NULL REFERENCES civic_actions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 1000),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_action_id_created_at ON comments(action_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- LIKES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id UUID REFERENCES civic_actions(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT likes_target_check CHECK (
    (action_id IS NOT NULL AND comment_id IS NULL) OR
    (action_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, action_id),
  UNIQUE(user_id, comment_id)
);

-- Indexes for likes
CREATE INDEX IF NOT EXISTS idx_likes_action_id ON likes(action_id) WHERE action_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_likes_comment_id ON likes(comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view likes"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- FOLLOWS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes for follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create follows"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ========================================
-- UPDATE CIVIC ACTIONS TABLE
-- ========================================

-- Add likes and comments count to civic_actions
ALTER TABLE civic_actions
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Create index for sorting by popularity
CREATE INDEX IF NOT EXISTS idx_civic_actions_likes_count ON civic_actions(likes_count DESC);

-- ========================================
-- UPDATE USER PROFILES TABLE
-- ========================================

-- Add social stats to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ========================================
-- TRIGGER FUNCTIONS
-- ========================================

-- Update likes count when like is added/removed
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.action_id IS NOT NULL THEN
      UPDATE civic_actions SET likes_count = likes_count + 1 WHERE id = NEW.action_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.action_id IS NOT NULL THEN
      UPDATE civic_actions SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.action_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_likes_count_trigger ON likes;
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_likes_count();

-- Update comments count
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE civic_actions SET comments_count = comments_count + 1 WHERE id = NEW.action_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE civic_actions SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.action_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_comments_count_trigger ON comments;
CREATE TRIGGER update_comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_count();

-- Update followers/following count
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE user_profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    UPDATE user_profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_follow_counts_trigger ON follows;
CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- Create notification when someone likes an action
CREATE OR REPLACE FUNCTION notify_action_liked()
RETURNS TRIGGER AS $$
DECLARE
  action_owner UUID;
  action_title TEXT;
  liker_name TEXT;
BEGIN
  -- Get action owner and title
  SELECT user_id, title INTO action_owner, action_title
  FROM civic_actions WHERE id = NEW.action_id;

  -- Don't notify if user liked their own action
  IF action_owner = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get liker's name
  SELECT username INTO liker_name
  FROM user_profiles WHERE id = NEW.user_id;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, actor_id, actor_name, related_action_id, action_url)
  VALUES (
    action_owner,
    'like',
    'Someone liked your action',
    liker_name || ' liked your "' || action_title || '" action',
    NEW.user_id,
    liker_name,
    NEW.action_id,
    '/dashboard?action=' || NEW.action_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_action_liked_trigger ON likes;
CREATE TRIGGER notify_action_liked_trigger
  AFTER INSERT ON likes
  FOR EACH ROW
  WHEN (NEW.action_id IS NOT NULL)
  EXECUTE FUNCTION notify_action_liked();

-- Create notification when someone comments
CREATE OR REPLACE FUNCTION notify_action_commented()
RETURNS TRIGGER AS $$
DECLARE
  action_owner UUID;
  action_title TEXT;
  commenter_name TEXT;
BEGIN
  -- Get action owner and title
  SELECT user_id, title INTO action_owner, action_title
  FROM civic_actions WHERE id = NEW.action_id;

  -- Don't notify if user commented on their own action
  IF action_owner = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter's name
  SELECT username INTO commenter_name
  FROM user_profiles WHERE id = NEW.user_id;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, actor_id, actor_name, related_action_id, action_url)
  VALUES (
    action_owner,
    'comment',
    'New comment on your action',
    commenter_name || ' commented on your "' || action_title || '" action',
    NEW.user_id,
    commenter_name,
    NEW.action_id,
    '/dashboard?action=' || NEW.action_id || '&comment=' || NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_action_commented_trigger ON comments;
CREATE TRIGGER notify_action_commented_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_action_commented();

-- Create notification when someone follows you
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
BEGIN
  -- Get follower's name
  SELECT username INTO follower_name
  FROM user_profiles WHERE id = NEW.follower_id;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, actor_id, actor_name, action_url)
  VALUES (
    NEW.following_id,
    'follow',
    'New Follower',
    follower_name || ' started following you',
    NEW.follower_id,
    follower_name,
    '/profile/' || NEW.follower_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_new_follower_trigger ON follows;
CREATE TRIGGER notify_new_follower_trigger
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_follower();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = p_user_id AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE user_id = p_user_id AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE notifications IS 'User notifications for likes, comments, follows, achievements, etc.';
COMMENT ON TABLE comments IS 'Comments on civic actions with threaded replies support';
COMMENT ON TABLE likes IS 'Likes on civic actions and comments';
COMMENT ON TABLE follows IS 'User follow relationships';
