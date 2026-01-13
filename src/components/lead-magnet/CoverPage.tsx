import { Building2, TrendingUp, Shield } from 'lucide-react';

export function CoverPage() {
  return (
    <div className="w-[816px] h-[1056px] bg-secondary relative overflow-hidden flex flex-col">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-navy-light opacity-90" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      
      {/* Gold accent line top */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary to-primary/50" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-16 py-20">
        {/* Header badge */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-primary font-serif text-lg">Dubai Real Estate Investors</p>
            <p className="text-pearl/60 text-sm">Free Investment Guide</p>
          </div>
        </div>
        
        {/* Main title area */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-primary/20 text-primary text-sm font-medium rounded-full mb-6">
              2025 EDITION
            </span>
          </div>
          
          <h1 className="font-serif text-6xl leading-tight text-pearl mb-6">
            The <span className="text-primary">7 Secrets</span> Every Dubai Property Investor Must Know
          </h1>
          
          <p className="text-xl text-pearl/80 max-w-lg leading-relaxed mb-12">
            Your essential guide to navigating the world's most dynamic real estate market with confidence and clarity.
          </p>
          
          {/* Key benefits */}
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-pearl/70 text-sm">High ROI<br />Strategies</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-pearl/70 text-sm">Risk<br />Mitigation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-pearl/70 text-sm">Expert<br />Insights</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="pt-8 border-t border-pearl/10 flex items-center justify-between">
          <div>
            <p className="text-pearl/60 text-sm">A Free Guide from</p>
            <p className="text-primary font-serif text-xl">Balcom Privé</p>
          </div>
          <div className="text-right">
            <p className="text-pearl/40 text-xs">www.dubairealstateinvestors.com</p>
          </div>
        </div>
      </div>
      
      {/* Gold accent line bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
    </div>
  );
}
