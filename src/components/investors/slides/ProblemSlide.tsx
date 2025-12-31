import { PitchDeckSlide } from "../PitchDeckSlide";
import { AlertTriangle, Globe, FileQuestion, Clock } from "lucide-react";

const problems = [
  {
    icon: Globe,
    title: "Market Access Barriers",
    description: "International investors struggle to navigate Dubai's complex real estate ecosystem"
  },
  {
    icon: FileQuestion,
    title: "Information Asymmetry",
    description: "Fragmented data across portals, agencies, and government sources"
  },
  {
    icon: Clock,
    title: "Time-Intensive Research",
    description: "Weeks of research required to evaluate a single investment opportunity"
  },
  {
    icon: AlertTriangle,
    title: "Trust Deficit",
    description: "Lack of transparent, unbiased investment analysis and agent verification"
  }
];

export const ProblemSlide = () => (
  <PitchDeckSlide className="p-12">
    <div className="space-y-8">
      <div>
        <p className="text-primary font-semibold mb-2">THE PROBLEM</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          $30B+ Market, Fragmented Experience
        </h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {problems.map((problem, index) => (
          <div 
            key={index}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
          >
            <problem.icon className="h-10 w-10 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
            <p className="text-muted-foreground">{problem.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 mt-4">
        <p className="text-lg">
          <span className="font-bold text-destructive">Result:</span>{" "}
          <span className="text-foreground">
            30% of foreign investors abandon Dubai purchases due to complexity
          </span>
        </p>
      </div>
    </div>
  </PitchDeckSlide>
);
