import { LucideIcon, CheckCircle2 } from 'lucide-react';

interface SecretPageProps {
  secretNumber: number;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  content: string[];
  keyInsight?: string;
  actionItems?: string[];
  pageNumber: number;
  variant?: 'light' | 'dark';
}

export function SecretPage({
  secretNumber,
  title,
  subtitle,
  icon: Icon,
  content,
  keyInsight,
  actionItems,
  pageNumber,
  variant = 'light'
}: SecretPageProps) {
  const isDark = variant === 'dark';
  
  return (
    <div className={`w-[816px] h-[1056px] relative overflow-hidden flex flex-col ${
      isDark ? 'bg-secondary' : 'bg-pearl'
    }`}>
      {/* Gold accent line top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/50" />
      
      {/* Decorative elements for dark variant */}
      {isDark && (
        <>
          <div className="absolute top-20 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        </>
      )}
      
      {/* Content */}
      <div className="flex-1 px-16 py-12 relative z-10">
        {/* Secret number badge */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-primary/20' : 'bg-secondary'
          }`}>
            <span className={`font-serif text-3xl font-bold ${
              isDark ? 'text-primary' : 'text-pearl'
            }`}>{secretNumber}</span>
          </div>
          <div>
            <p className="text-primary font-medium text-sm tracking-wider uppercase">Secret #{secretNumber}</p>
            {subtitle && (
              <p className={`text-xs ${isDark ? 'text-pearl/60' : 'text-secondary/60'}`}>{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Title with icon */}
        <div className="flex items-start gap-4 mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDark ? 'bg-primary/20' : 'bg-primary/10'
          }`}>
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <h2 className={`font-serif text-3xl leading-tight ${
            isDark ? 'text-pearl' : 'text-secondary'
          }`}>
            {title}
          </h2>
        </div>
        
        {/* Main content */}
        <div className={`space-y-4 mb-8 ${isDark ? 'text-pearl/80' : 'text-secondary/80'}`}>
          {content.map((paragraph, index) => (
            <p key={index} className="text-base leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Key Insight callout */}
        {keyInsight && (
          <div className={`rounded-xl p-6 mb-8 ${
            isDark ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/5 border border-secondary/10'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-secondary text-sm font-bold">!</span>
              </div>
              <div>
                <p className={`font-medium text-sm mb-2 ${isDark ? 'text-primary' : 'text-secondary'}`}>
                  Key Insight
                </p>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-pearl/80' : 'text-secondary/70'}`}>
                  {keyInsight}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Items */}
        {actionItems && actionItems.length > 0 && (
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-pearl/5' : 'bg-primary/5'
          }`}>
            <h4 className={`font-medium text-sm mb-4 ${isDark ? 'text-pearl' : 'text-secondary'}`}>
              ✓ Action Items
            </h4>
            <div className="space-y-3">
              {actionItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    isDark ? 'text-primary' : 'text-primary'
                  }`} />
                  <p className={`text-sm ${isDark ? 'text-pearl/70' : 'text-secondary/70'}`}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className={`px-16 py-4 flex justify-between items-center ${
        isDark ? 'border-t border-pearl/10' : 'border-t border-secondary/10'
      }`}>
        <span className={`text-xs ${isDark ? 'text-pearl/40' : 'text-secondary/40'}`}>
          Dubai Real Estate Investors
        </span>
        <span className={`text-xs ${isDark ? 'text-pearl/40' : 'text-secondary/40'}`}>
          Page {pageNumber}
        </span>
      </div>
    </div>
  );
}
