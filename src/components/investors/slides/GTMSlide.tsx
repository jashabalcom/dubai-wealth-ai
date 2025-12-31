import { PitchDeckSlide } from "../PitchDeckSlide";
import { Target, Users, Megaphone, Handshake } from "lucide-react";

const channels = [
  {
    icon: Target,
    title: "Content & SEO",
    description: "Dubai investment guides, market reports, and educational content",
    metrics: "Target: 50K organic visits/month"
  },
  {
    icon: Megaphone,
    title: "Paid Acquisition",
    description: "Google Ads, Meta targeting HNWIs interested in Dubai property",
    metrics: "Target: $50 CAC"
  },
  {
    icon: Handshake,
    title: "Partnerships",
    description: "Dubai developers, wealth managers, immigration consultants",
    metrics: "Target: 10 strategic partners"
  },
  {
    icon: Users,
    title: "Community & Referrals",
    description: "Investor network, referral program, events",
    metrics: "Target: 30% viral coefficient"
  }
];

export const GTMSlide = () => (
  <PitchDeckSlide className="p-12">
    <div className="space-y-8">
      <div>
        <p className="text-primary font-semibold mb-2">GO-TO-MARKET</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          Multi-Channel Growth Strategy
        </h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {channels.map((channel, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <channel.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{channel.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{channel.description}</p>
                <p className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full inline-block">
                  {channel.metrics}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-xl p-8">
        <h3 className="text-xl font-bold mb-6">Launch Strategy</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3 font-bold">1</div>
            <h4 className="font-semibold mb-2">Phase 1: Foundation</h4>
            <p className="text-sm text-muted-foreground">SEO content engine, organic growth, product refinement</p>
          </div>
          <div className="text-center">
            <div className="bg-accent text-accent-foreground rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3 font-bold">2</div>
            <h4 className="font-semibold mb-2">Phase 2: Scale</h4>
            <p className="text-sm text-muted-foreground">Paid acquisition, partnership launches, community building</p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3 font-bold">3</div>
            <h4 className="font-semibold mb-2">Phase 3: Expand</h4>
            <p className="text-sm text-muted-foreground">Geographic expansion, enterprise B2B, transaction layer</p>
          </div>
        </div>
      </div>
    </div>
  </PitchDeckSlide>
);
