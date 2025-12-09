import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat, Message } from "@/hooks/useAIChat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Save, 
  Trash2, 
  MessageSquare,
  Crown,
  Loader2,
  ChevronRight
} from "lucide-react";

interface SavedStrategy {
  id: string;
  title: string;
  parameters: Record<string, unknown>;
  ai_response: string | null;
  created_at: string;
}

// Dynamic quick prompts based on user context
const getQuickPrompts = (profile: { budget_range?: string; investment_goal?: string; membership_tier?: string } | null, savedCount: number) => {
  const base = [
    "What's the best area in Dubai for rental income?",
    "How do off-plan payment plans work?",
    "What are the Golden Visa property requirements?",
  ];
  
  if (!profile) return base;
  
  const personalized: string[] = [];
  
  // Budget-based prompts
  if (profile.budget_range) {
    personalized.push(`What properties match my ${profile.budget_range} budget?`);
  }
  
  // Goal-based prompts
  if (profile.investment_goal === "Rental Income") {
    personalized.push("What areas have the highest rental yields?");
  } else if (profile.investment_goal === "Capital Growth") {
    personalized.push("Which areas are expected to appreciate the most?");
  } else if (profile.investment_goal === "Golden Visa") {
    personalized.push("What's the best Golden Visa strategy for my budget?");
  }
  
  // Saved properties prompts
  if (savedCount > 0) {
    personalized.push("Analyze my saved properties for investment potential");
  }
  
  // Elite-specific prompts
  if (profile.membership_tier === "elite") {
    personalized.push("Create a diversified portfolio strategy for me");
  }
  
  return [...personalized, ...base].slice(0, 5);
};

export default function AIAssistant() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useAIChat();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([]);
  const [savedPropertiesCount, setSavedPropertiesCount] = useState(0);
  const [showSaved, setShowSaved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isElite = profile?.membership_tier === "elite";
  
  const quickPrompts = getQuickPrompts(profile, savedPropertiesCount);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (user) {
      // Fetch saved properties count
      supabase
        .from("saved_properties")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .then(({ count }) => {
          if (count !== null) setSavedPropertiesCount(count);
        });
      
      if (isElite) {
        fetchSavedStrategies();
      }
    }
  }, [user, isElite]);

  const fetchSavedStrategies = async () => {
    const { data, error } = await supabase
      .from("ai_strategies")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setSavedStrategies(data as SavedStrategy[]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return;
    sendMessage(prompt);
  };

  const handleSaveStrategy = async () => {
    if (!user || !isElite || messages.length === 0) return;

    const title = messages[0]?.content.slice(0, 50) + "...";
    const aiResponse = messages
      .filter(m => m.role === "assistant")
      .map(m => m.content)
      .join("\n\n");

    const { error } = await supabase.from("ai_strategies").insert({
      user_id: user.id,
      title,
      parameters: { conversation: messages },
      ai_response: aiResponse,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save strategy",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Strategy Saved",
        description: "Your investment strategy has been saved",
      });
      fetchSavedStrategies();
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    const { error } = await supabase.from("ai_strategies").delete().eq("id", id);
    
    if (!error) {
      setSavedStrategies(prev => prev.filter(s => s.id !== id));
      toast({ title: "Strategy deleted" });
    }
  };

  const handleLoadStrategy = (strategy: SavedStrategy) => {
    clearMessages();
    const conversation = (strategy.parameters as { conversation?: Message[] })?.conversation || [];
    conversation.forEach((msg, i) => {
      setTimeout(() => {
        if (msg.role === "user") {
          sendMessage(msg.content);
        }
      }, i * 100);
    });
    setShowSaved(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container-luxury">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-secondary-foreground">
                AI Investment Assistant
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get personalized Dubai real estate investment advice powered by AI. 
              Ask about properties, yields, Golden Visa, and more.
            </p>
            {isElite && (
              <Badge variant="secondary" className="mt-4">
                <Crown className="w-3 h-3 mr-1" />
                Elite Member - Save Unlimited Strategies
              </Badge>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar - Elite Saved Strategies */}
            {isElite && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Saved Strategies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {savedStrategies.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No saved strategies yet
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {savedStrategies.map((strategy) => (
                            <div
                              key={strategy.id}
                              className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group cursor-pointer"
                              onClick={() => handleLoadStrategy(strategy)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-medium line-clamp-2">
                                  {strategy.title}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteStrategy(strategy.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {new Date(strategy.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Main Chat Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={isElite ? "lg:col-span-3" : "lg:col-span-4"}
            >
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Chat
                    </CardTitle>
                    <div className="flex gap-2">
                      {isElite && messages.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveStrategy}
                          className="text-xs"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save Strategy
                        </Button>
                      )}
                      {messages.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearMessages}
                          className="text-xs"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12">
                        <Bot className="w-16 h-16 text-primary/20 mb-4" />
                        <h3 className="font-serif text-xl mb-2">
                          How can I help with your Dubai investment?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md">
                          Ask me about property areas, rental yields, Golden Visa requirements, 
                          off-plan investments, or any Dubai real estate questions.
                        </p>
                        
                        {/* Quick Prompts */}
                        <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                          {quickPrompts.map((prompt) => (
                            <Button
                              key={prompt}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleQuickPrompt(prompt)}
                            >
                              {prompt}
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <AnimatePresence>
                          {messages.map((msg, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] p-4 rounded-2xl ${
                                  msg.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-br-md"
                                    : "bg-secondary rounded-bl-md"
                                }`}
                              >
                                {msg.role === "assistant" && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <Bot className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-medium text-primary">
                                      AI Assistant
                                    </span>
                                  </div>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                          >
                            <div className="bg-secondary p-4 rounded-2xl rounded-bl-md">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">
                                  Thinking...
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Error Display */}
                  {error && (
                    <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
                      <p className="text-xs text-destructive">{error}</p>
                    </div>
                  )}

                  {/* Input Area */}
                  <form
                    onSubmit={handleSubmit}
                    className="p-4 border-t bg-background/50"
                  >
                    <div className="flex gap-2">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about Dubai real estate investments..."
                        className="min-h-[50px] max-h-[120px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                      />
                      <Button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="px-4"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                      AI responses are for informational purposes only. Always consult with 
                      licensed professionals before making investment decisions.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
