import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export function AnimatedLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="relative flex items-center justify-center h-8 w-8 shrink-0">
      {/* Outer orbiting ring */}
      <motion.div
        className="absolute inset-0 rounded-xl border border-primary/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Pulsing glow */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-primary/10"
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.15, 0.4],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Inner gradient bg */}
      <motion.div
        className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-[0_2px_12px_hsla(211,100%,50%,0.35)]"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Shield className="h-4 w-4 text-primary-foreground drop-shadow-sm" />
        
        {/* Orbiting dot */}
        <motion.div
          className="absolute h-1.5 w-1.5 rounded-full bg-primary-foreground shadow-[0_0_6px_hsla(0,0%,100%,0.8)]"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50% -6px' }}
        />
      </motion.div>
    </div>
  );
}
