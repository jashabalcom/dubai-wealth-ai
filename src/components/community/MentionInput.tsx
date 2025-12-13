import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Member {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  membership_tier: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange?: (mentionedUserIds: string[]) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export interface MentionInputRef {
  focus: () => void;
  insertText: (text: string) => void;
}

export const MentionInput = forwardRef<MentionInputRef, MentionInputProps>(
  ({ value, onChange, onMentionsChange, placeholder, className, rows = 4 }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState('');
    const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      insertText: (text: string) => {
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newValue = value.slice(0, start) + text + value.slice(end);
          onChange(newValue);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + text.length;
            textarea.focus();
          }, 0);
        } else {
          onChange(value + text);
        }
      },
    }));

    // Extract mentioned user IDs from content
    const extractMentions = useCallback((content: string): string[] => {
      const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
      const mentions: string[] = [];
      let match;
      while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[2]); // User ID is in capture group 2
      }
      return mentions;
    }, []);

    // Notify parent of mention changes
    useEffect(() => {
      if (onMentionsChange) {
        const mentions = extractMentions(value);
        onMentionsChange(mentions);
      }
    }, [value, onMentionsChange, extractMentions]);

    // Search for members
    const searchMembers = useCallback(async (query: string) => {
      if (!query) {
        setMembers([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, membership_tier')
          .ilike('full_name', `%${query}%`)
          .limit(5);

        setMembers(data || []);
      } catch (error) {
        console.error('Failed to search members:', error);
      } finally {
        setLoading(false);
      }
    }, []);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      const cursorPos = e.target.selectionStart;
      const textBeforeCursor = newValue.slice(0, cursorPos);
      
      // Check if we're in a mention context
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
      
      if (mentionMatch) {
        setMentionSearch(mentionMatch[1]);
        setShowMentions(true);
        setSelectedIndex(0);
        
        // Calculate position for dropdown
        const textarea = textareaRef.current;
        if (textarea) {
          const rect = textarea.getBoundingClientRect();
          setMentionPosition({
            top: rect.bottom + 4,
            left: rect.left,
          });
        }
      } else {
        setShowMentions(false);
      }
    };

    // Search debounce
    useEffect(() => {
      if (!showMentions) return;
      
      const timer = setTimeout(() => {
        searchMembers(mentionSearch);
      }, 150);

      return () => clearTimeout(timer);
    }, [mentionSearch, showMentions, searchMembers]);

    // Insert mention
    const insertMention = (member: Member) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = value.slice(0, cursorPos);
      const textAfterCursor = value.slice(cursorPos);
      
      // Find the @ symbol position
      const atIndex = textBeforeCursor.lastIndexOf('@');
      
      if (atIndex !== -1) {
        const beforeMention = value.slice(0, atIndex);
        const mentionText = `@[${member.full_name}](${member.id}) `;
        const newValue = beforeMention + mentionText + textAfterCursor;
        onChange(newValue);
        
        // Reset cursor position
        setTimeout(() => {
          const newCursorPos = atIndex + mentionText.length;
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
          textarea.focus();
        }, 0);
      }

      setShowMentions(false);
      setMentionSearch('');
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!showMentions || members.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % members.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + members.length) % members.length);
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          insertMention(members[selectedIndex]);
          break;
        case 'Escape':
          setShowMentions(false);
          break;
      }
    };

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = () => setShowMentions(false);
      if (showMentions) {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
      }
    }, [showMentions]);

    // Render content with highlighted mentions
    const renderDisplayValue = (text: string) => {
      return text.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1');
    };

    return (
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={renderDisplayValue(value)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            "bg-muted/30 border-border/50 focus:border-gold/50 focus:ring-gold/20 resize-none",
            className
          )}
        />

        <AnimatePresence>
          {showMentions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <div className="py-3 px-4 text-sm text-muted-foreground text-center">
                  {mentionSearch ? 'No members found' : 'Type to search members...'}
                </div>
              ) : (
                <div className="py-1">
                  {members.map((member, index) => (
                    <button
                      key={member.id}
                      onClick={() => insertMention(member)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors text-left",
                        index === selectedIndex && "bg-muted/50"
                      )}
                    >
                      <Avatar className={cn(
                        "h-8 w-8 ring-1 ring-offset-1 ring-offset-card",
                        member.membership_tier === 'elite' ? "ring-gold/30" : "ring-border/30"
                      )}>
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted text-xs">
                          {member.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{member.full_name}</span>
                        {member.membership_tier === 'elite' && (
                          <Crown className="h-3 w-3 text-gold" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

MentionInput.displayName = 'MentionInput';