import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  PlayCircle, 
  User, 
  BookOpen, 
  Calculator, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";

const quickStartSteps = [
  {
    id: "profile",
    title: "Complete Your Investor Profile",
    description: "Tell us about your investment goals so we can personalize your experience.",
    duration: "5 min",
    icon: User,
    action: "/settings",
    actionLabel: "Complete Profile",
  },
  {
    id: "lesson",
    title: "Watch 'Dubai Investing 101'",
    description: "Understand the fundamentals of Dubai real estate in one focused lesson.",
    duration: "15 min",
    icon: BookOpen,
    action: "/academy/getting-started",
    actionLabel: "Start Lesson",
  },
  {
    id: "calculator",
    title: "Run Your First ROI Analysis",
    description: "Use our calculator on any property to see real returns.",
    duration: "10 min",
    icon: Calculator,
    action: "/tools/roi",
    actionLabel: "Try Calculator",
  },
];

const StartHere = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const onboarding = useOnboarding();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const progressPercent = (completedSteps.length / quickStartSteps.length) * 100;

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
      onboarding.markActionComplete?.(stepId as any);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container-luxury">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Day 1 of Your Journey
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
              Welcome to Your
              <br />
              <span className="text-gradient-gold">Confidence Journey</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              You're early in your journey, and that's perfect. Most of our successful 
              investors started exactly where you are right now.
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Quick Start Progress
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {completedSteps.length} of {quickStartSteps.length} complete
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                {progressPercent === 100 && (
                  <p className="text-sm text-emerald-500 mt-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Congratulations! You've completed your quick start.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Reassurance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">
                      What to do in your first 7 days
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      This isn't about being an expert — it's about taking the next smart step. 
                      There's no rush. Go at your pace.
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Watch 2-min Welcome Video
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 3-Step Quick Start */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-serif text-foreground text-center mb-8">
              Your 3-Step Quick Start
            </h2>
            
            <div className="space-y-4">
              {quickStartSteps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const Icon = step.icon;
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Card className={`transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-emerald-500/5 border-emerald-500/30' 
                        : 'bg-card border-border hover:border-primary/30'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Step Number / Check */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <span className="font-serif text-lg">{index + 1}</span>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className={`font-medium mb-1 ${
                                  isCompleted ? 'text-emerald-600' : 'text-foreground'
                                }`}>
                                  {step.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {step.description}
                                </p>
                                <div className="flex items-center gap-3">
                                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {step.duration}
                                  </span>
                                  <Icon className="w-4 h-4 text-primary/50" />
                                </div>
                              </div>
                              
                              {/* Action Button */}
                              <Button
                                variant={isCompleted ? "outline" : "default"}
                                size="sm"
                                className="flex-shrink-0"
                                onClick={() => {
                                  handleStepComplete(step.id);
                                  navigate(step.action);
                                }}
                              >
                                {isCompleted ? 'Review' : step.actionLabel}
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Bottom Encouragement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-12 max-w-2xl mx-auto"
          >
            <p className="text-muted-foreground">
              Remember: every expert was once a beginner. You're exactly where you need to be.
            </p>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StartHere;