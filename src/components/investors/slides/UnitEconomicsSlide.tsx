import { PitchDeckSlide } from "../PitchDeckSlide";

export const UnitEconomicsSlide = () => (
  <PitchDeckSlide className="p-12">
    <div className="space-y-8">
      <div>
        <p className="text-primary font-semibold mb-2">UNIT ECONOMICS</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          Path to Profitability
        </h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Target Metrics (Year 2)</h3>
          
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Customer Acquisition Cost (CAC)</span>
                <span className="text-2xl font-bold text-primary">$50</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Lifetime Value (LTV)</span>
                <span className="text-2xl font-bold text-accent">$600</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-5">
              <div className="flex justify-between items-center">
                <span className="font-semibold">LTV:CAC Ratio</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">12:1</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Target: 3:1 minimum for healthy SaaS</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold">Revenue Assumptions</h3>
          
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex justify-between">
              <span>Average Revenue Per User</span>
              <span className="font-bold">$55/mo</span>
            </div>
            <div className="flex justify-between">
              <span>Target Monthly Churn</span>
              <span className="font-bold text-primary">&lt;5%</span>
            </div>
            <div className="flex justify-between">
              <span>Average Customer Lifetime</span>
              <span className="font-bold">12 months</span>
            </div>
            <div className="flex justify-between">
              <span>Gross Margin</span>
              <span className="font-bold text-accent">85%+</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-6">
            <h4 className="font-semibold mb-3">CAC Channels</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Content Marketing / SEO</span>
                <span className="text-primary">40%</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Ads (Google, Meta)</span>
                <span className="text-primary">30%</span>
              </div>
              <div className="flex justify-between">
                <span>Partnerships / Referrals</span>
                <span className="text-primary">20%</span>
              </div>
              <div className="flex justify-between">
                <span>Events / PR</span>
                <span className="text-primary">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PitchDeckSlide>
);
