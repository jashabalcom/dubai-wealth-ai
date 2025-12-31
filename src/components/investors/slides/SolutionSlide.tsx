import { PitchDeckSlide } from "../PitchDeckSlide";
import { Building2, GraduationCap, Calculator, Brain, Users, Briefcase } from "lucide-react";

const solutions = [
  { icon: Building2, title: "Property Intelligence", desc: "905+ curated listings with AI analysis" },
  { icon: GraduationCap, title: "Investment Academy", desc: "50+ lessons from Dubai experts" },
  { icon: Calculator, title: "Advanced Tools", desc: "11 calculators for ROI, mortgages, yields" },
  { icon: Brain, title: "AI Advisor", desc: "Personalized investment recommendations" },
  { icon: Users, title: "Investor Community", desc: "Network with verified investors" },
  { icon: Briefcase, title: "Portfolio Tracker", desc: "Track wealth growth in real-time" }
];

export const SolutionSlide = () => (
  <PitchDeckSlide className="p-12">
    <div className="space-y-8">
      <div>
        <p className="text-primary font-semibold mb-2">THE SOLUTION</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          One Platform. Complete Intelligence.
        </h2>
        <p className="text-xl text-muted-foreground mt-4">
          Dubai Wealth Hub consolidates research, education, and tools into a single decision-support platform
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {solutions.map((item, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-xl p-5 text-center hover:scale-105 transition-transform"
          >
            <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
              <item.icon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
        <p className="text-2xl font-bold text-primary">
          "From research to purchase in days, not months"
        </p>
      </div>
    </div>
  </PitchDeckSlide>
);
