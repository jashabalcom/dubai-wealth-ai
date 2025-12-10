import { ReactNode } from "react";

interface BrowserFrameProps {
  children: ReactNode;
  url?: string;
}

export function BrowserFrame({ children, url = "dubaiwealthhub.com/dashboard" }: BrowserFrameProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-secondary-foreground/10 bg-secondary-foreground/5 shadow-2xl">
      {/* Browser Chrome */}
      <div className="flex items-center gap-3 px-4 py-3 bg-secondary-foreground/10 border-b border-secondary-foreground/10">
        {/* Traffic Lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        
        {/* URL Bar */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-secondary-foreground/5 border border-secondary-foreground/10">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-secondary-foreground/60 font-mono">{url}</span>
          </div>
        </div>
        
        {/* Window Controls Placeholder */}
        <div className="w-16" />
      </div>
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
