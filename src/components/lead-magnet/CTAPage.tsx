import { ArrowRight, CheckCircle, GraduationCap, Users, TrendingUp, Shield } from 'lucide-react';

export function CTAPage() {
  return (
    <div className="w-[816px] h-[1056px] bg-secondary relative overflow-hidden flex flex-col">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-navy-light" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      
      {/* Gold accent line top */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary to-primary/50" />
      
      {/* Content */}
      <div className="flex-1 px-16 py-16 relative z-10">
        {/* Header badge */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-px bg-primary" />
          <span className="text-primary font-medium text-sm tracking-wider uppercase">Next Steps</span>
        </div>
        
        <h2 className="font-serif text-5xl text-pearl mb-6">
          Ready to Take <span className="text-primary">Action?</span>
        </h2>
        
        <p className="text-xl text-pearl/80 max-w-lg mb-12">
          You now have the foundational knowledge to invest in Dubai with confidence. 
          Here's how to continue your journey.
        </p>
        
        {/* What you've learned recap */}
        <div className="bg-pearl/5 rounded-xl p-6 mb-10">
          <h3 className="font-serif text-lg text-pearl mb-4">What You've Learned</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Freehold ownership advantages",
              "Developer due diligence framework",
              "True cost of ownership analysis",
              "Golden Visa requirements",
              "Rental yield optimization",
              "Off-plan vs ready strategies",
              "Exit planning essentials"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-pearl/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Box */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl p-8 border border-primary/30">
          <h3 className="font-serif text-2xl text-pearl mb-4">
            Join Dubai Real Estate Investors
          </h3>
          <p className="text-pearl/70 mb-6">
            Get access to in-depth courses, live market data, expert analysis, and a community 
            of serious investors navigating the Dubai market together.
          </p>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span className="text-pearl/80 text-sm">Premium Courses</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-pearl/80 text-sm">Private Community</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-pearl/80 text-sm">Market Data</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-primary text-secondary px-6 py-3 rounded-lg w-fit">
            <span className="font-medium">Start Your Free Account</span>
            <ArrowRight className="w-5 h-5" />
          </div>
          
          <p className="text-pearl/50 text-xs mt-4">
            www.dubairealstateinvestors.com
          </p>
        </div>
        
        {/* Contact info */}
        <div className="mt-10 flex items-center justify-between">
          <div>
            <p className="text-pearl/60 text-sm mb-1">Have questions?</p>
            <p className="text-primary">hello@dubairealstateinvestors.com</p>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary/60" />
            <div className="text-right">
              <p className="text-pearl/60 text-xs">Your data is secure</p>
              <p className="text-pearl/40 text-xs">We never share your information</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-16 py-6 border-t border-pearl/10 text-center">
        <p className="text-pearl/40 text-xs mb-1">© 2025 Dubai Real Estate Investors. All rights reserved.</p>
        <p className="text-pearl/30 text-xs">
          This guide is for informational purposes only and does not constitute financial advice.
        </p>
      </div>
    </div>
  );
}
