import { motion } from "framer-motion";
import { GraduationCap, Building, BarChart3, Users, Bot, Heart, MessageCircle, Play, TrendingUp } from "lucide-react";

const navItems = [
  { icon: GraduationCap, label: "Academy", active: false },
  { icon: Building, label: "Properties", active: true },
  { icon: BarChart3, label: "Tools", active: false },
  { icon: Users, label: "Community", active: false },
  { icon: Bot, label: "AI", active: false },
];

const stats = [
  { value: "12", label: "Saved" },
  { value: "28", label: "ROI Calc" },
  { value: "3", label: "Courses" },
];

const properties = [
  { name: "Dubai Marina", price: "2.5M", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&h=120&fit=crop" },
  { name: "Palm Jumeirah", price: "4.8M", image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=200&h=120&fit=crop" },
];

export function DashboardMockup() {
  return (
    <div className="aspect-[16/9] bg-gradient-to-br from-[#0A0F1D] via-[#0D1425] to-[#0A0F1D] flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-14 md:w-16 border-r border-white/5 py-4 flex flex-col items-center gap-3">
        {navItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-colors ${
              item.active 
                ? "bg-primary/20 text-primary" 
                : "text-white/30 hover:text-white/50"
            }`}
          >
            <item.icon className="w-4 h-4 md:w-5 md:h-5" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 md:p-5 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-3 md:mb-4"
        >
          <h3 className="text-sm md:text-base text-white font-medium">Welcome back, Investor 👋</h3>
          <p className="text-[10px] md:text-xs text-white/40">Your portfolio is up 12% this month</p>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="bg-white/5 rounded-lg p-2 md:p-3 border border-white/5">
              <div className="text-primary text-base md:text-xl font-semibold">{stat.value}</div>
              <div className="text-[8px] md:text-[10px] text-white/40">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Properties Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-3 md:mb-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs text-white/60 font-medium">Featured Properties</span>
            <span className="text-[8px] md:text-[10px] text-primary">View All →</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {properties.map((prop, i) => (
              <motion.div
                key={prop.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="relative rounded-lg overflow-hidden group cursor-pointer"
              >
                <img 
                  src={prop.image} 
                  alt={prop.name}
                  className="w-full h-14 md:h-20 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-1 md:bottom-2 left-1 md:left-2 right-1 md:right-2">
                  <div className="text-[8px] md:text-[10px] text-white font-medium truncate">{prop.name}</div>
                  <div className="text-[8px] md:text-xs text-primary font-semibold">AED {prop.price}</div>
                </div>
                <div className="absolute top-1 right-1">
                  <Heart className="w-3 h-3 text-white/60" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-3 md:mb-4"
        >
          <div className="flex items-center gap-1 mb-2">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-[10px] md:text-xs text-white/60 font-medium">Wealth Projection</span>
          </div>
          <div className="h-12 md:h-16 bg-white/5 rounded-lg p-2 border border-white/5">
            <svg viewBox="0 0 200 40" className="w-full h-full">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#CBB89E" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#CBB89E" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                d="M0,35 Q30,30 50,28 T100,20 T150,12 T200,5"
                fill="none"
                stroke="#CBB89E"
                strokeWidth="2"
              />
              <path
                d="M0,35 Q30,30 50,28 T100,20 T150,12 T200,5 L200,40 L0,40 Z"
                fill="url(#chartGradient)"
              />
            </svg>
          </div>
        </motion.div>

        {/* Community Post */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 rounded-lg p-2 md:p-3 border border-white/5"
        >
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[8px] md:text-xs text-primary font-medium">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] md:text-xs text-white/80 line-clamp-1">"Just closed my first Dubai investment! 🎉"</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[8px] md:text-[10px] text-white/40">
                  <Heart className="w-2.5 h-2.5 text-red-400" fill="currentColor" /> 24
                </span>
                <span className="flex items-center gap-1 text-[8px] md:text-[10px] text-white/40">
                  <MessageCircle className="w-2.5 h-2.5" /> 8
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Sidebar - AI Assistant */}
      <div className="hidden md:flex w-40 lg:w-48 border-l border-white/5 flex-col">
        <div className="p-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-[10px] text-white/60 font-medium">AI Assistant</span>
          </div>
        </div>
        <div className="flex-1 p-3 flex flex-col justify-end gap-2">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white/5 rounded-lg p-2 text-[9px] text-white/60"
          >
            What areas in Dubai offer the best rental yields?
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-primary/10 rounded-lg p-2 text-[9px] text-white/80 border border-primary/20"
          >
            Based on current data, JVC and Dubai Sports City offer yields of 7-9%...
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="flex items-center gap-1 text-[8px] text-white/30"
          >
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >●</motion.span>
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
            >●</motion.span>
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
            >●</motion.span>
            <span className="ml-1">AI is typing...</span>
          </motion.div>
        </div>

        {/* Academy Progress */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Play className="w-3 h-3 text-primary" />
            <span className="text-[9px] text-white/60">Continue Learning</span>
          </div>
          <div className="text-[8px] text-white/80 mb-1 line-clamp-1">Dubai Off-Plan Mastery</div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "65%" }}
              transition={{ delay: 1, duration: 0.8 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <div className="text-[7px] text-white/40 mt-1">65% complete</div>
        </div>
      </div>
    </div>
  );
}
