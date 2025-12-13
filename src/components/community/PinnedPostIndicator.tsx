import { Pin } from 'lucide-react';
import { motion } from 'framer-motion';

export function PinnedPostIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs font-medium"
    >
      <Pin className="h-3 w-3" />
      Pinned
    </motion.div>
  );
}
