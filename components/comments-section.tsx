"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Heart, Reply, Trash2, Edit2, MoreVertical, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { showSuccess, showError } from "./toast-notifications";

interface Comment {
  id: string;
  action_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  likes_count: number;
  edited: boolean;
  created_at: string;
  updated_at: string;
  user_profiles: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  isLiked?: boolean;
  replies?: Comment[];
}

interface CommentsSectionProps {
  actionId: string;
}

export function CommentsSection({ actionId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadComments();
    getCurrentUser();
    subscribeToComments();
  }, [actionId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          user_profiles(username, full_name, avatar_url)
        `)
        .eq("action_id", actionId)
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Load replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from("comments")
            .select(`
              *,
              user_profiles(username, full_name, avatar_url)
            `)
            .eq("parent_id", comment.id)
            .order("created_at", { ascending: true });

          return { ...comment, replies: replies || [] };
        })
      );

      setComments(commentsWithReplies);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const subscribeToComments = () => {
    const channel = supabase
      .channel(`comments:${actionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `action_id=eq.${actionId}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUserId) {
      showError("You must be logged in to comment");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("comments").insert({
        action_id: actionId,
        user_id: currentUserId,
        content: newComment.trim(),
        parent_id: null,
      });

      if (error) throw error;

      setNewComment("");
      showSuccess("Comment posted!");
      loadComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      showError("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) return;
    if (!currentUserId) {
      showError("You must be logged in to reply");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("comments").insert({
        action_id: actionId,
        user_id: currentUserId,
        content: replyText.trim(),
        parent_id: parentId,
      });

      if (error) throw error;

      setReplyText("");
      setReplyingTo(null);
      showSuccess("Reply posted!");
      loadComments();
    } catch (error) {
      console.error("Error posting reply:", error);
      showError("Failed to post reply");
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("comments")
        .update({
          content: editText.trim(),
          edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId);

      if (error) throw error;

      setEditingId(null);
      setEditText("");
      showSuccess("Comment updated!");
      loadComments();
    } catch (error) {
      console.error("Error updating comment:", error);
      showError("Failed to update comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);

      if (error) throw error;

      showSuccess("Comment deleted");
      loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      showError("Failed to delete comment");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUserId) {
      showError("You must be logged in to like");
      return;
    }

    try {
      // Check if already liked
      const { data: existing } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("comment_id", commentId)
        .single();

      if (existing) {
        // Unlike
        await supabase.from("likes").delete().eq("id", existing.id);
      } else {
        // Like
        await supabase.from("likes").insert({
          user_id: currentUserId,
          comment_id: commentId,
        });
      }

      loadComments();
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = currentUserId === comment.user_id;
    const isEditing = editingId === comment.id;

    return (
      <div key={comment.id} className={`${isReply ? "ml-12" : ""}`}>
        <div className="flex items-start gap-3 p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.user_profiles.avatar_url} />
            <AvatarFallback>{comment.user_profiles.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">{comment.user_profiles.username}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
                {comment.edited && (
                  <span className="text-xs text-muted-foreground ml-2">(edited)</span>
                )}
              </div>

              {isOwner && !isEditing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditText(comment.content);
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[80px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditComment(comment.id)}
                    disabled={loading}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setEditText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            )}

            {!isEditing && (
              <div className="flex items-center gap-4 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2"
                  onClick={() => handleLikeComment(comment.id)}
                >
                  <Heart
                    className={`h-4 w-4 mr-1 ${comment.isLiked ? "fill-red-500 text-red-500" : ""}`}
                  />
                  {comment.likes_count || 0}
                </Button>

                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            )}

            {/* Reply input */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[80px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={loading || !replyText.trim()}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-12 border-l-2 border-muted">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5" />
        <h3 className="font-semibold text-lg">
          Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* New comment input */}
      {currentUserId ? (
        <div className="mb-6 space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[100px]"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={loading || !newComment.trim()}
            className="w-full md:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground">
            <a href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </a>{" "}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </Card>
  );
}
