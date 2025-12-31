import { PitchDeckSlide } from "../PitchDeckSlide";
import { Code, Megaphone, Users, Server } from "lucide-react";

const allocations = [
  { icon: Code, category: "Product & Engineering", percent: 40, amount: "$400K", description: "AI features, mobile app, platform scaling" },
  { icon: Megaphone, category: "Sales & Marketing", percent: 35, amount: "$350K", description: "Paid acquisition, content, partnerships" },
  { icon: Users, category: "Team & Operations", percent: 15, amount: "$150K", description: "Key hires, legal, admin" },
  { icon: Server, category: "Infrastructure", percent: 10, amount: "$100K", description: "Cloud, security, compliance" }
];

export const UseOfFundsSlide = () => (
  <PitchDeckSlide className="p-12">
    <div className="space-y-8">
      <div>
        <p className="text-primary font-semibold mb-2">USE OF FUNDS</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          18-Month Runway to Series A
        </h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {allocations.map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{item.category}</span>
                    <span className="text-primary font-bold">{item.amount}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8 text-center">
            <p className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              $1M
            </p>
            <p className="text-xl font-semibold mt-2">Seed Round Target</p>
            <p className="text-muted-foreground">Pre-money: $4M valuation</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold mb-4">Key Milestones (18mo)</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">$100K MRR achieved</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">2,000+ paying subscribers</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Mobile app launched</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Series A readiness</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </PitchDeckSlide>
);
