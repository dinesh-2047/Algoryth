'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

/**
 * BadgeNotification Component
 * Shows a toast notification when a new badge is earned
 * Displays badge details and confetti-like animation
 */
export default function BadgeNotification({ badges = [], onDismiss }) {
  const [visibleBadges, setVisibleBadges] = useState([]);

  useEffect(() => {
    if (badges && badges.length > 0) {
      const newBadges = badges.map((badge, idx) => ({
        ...badge,
        id: `${badge.badgeId}-${Date.now()}-${idx}`,
        displayTime: idx * 1500, // Stagger notifications
      }));

      setVisibleBadges(prev => [...prev, ...newBadges]);

      // Auto-dismiss notifications after 6 seconds each
      const timers = newBadges.map(badge =>
        setTimeout(() => {
          setVisibleBadges(prev => prev.filter(b => b.id !== badge.id));
          onDismiss?.(badge);
        }, badge.displayTime + 6000)
      );

      // Cleanup timers on unmount or deps change
      return () => timers.forEach(clearTimeout);
    }
  }, [badges, onDismiss]);

  return (
    <AnimatePresence mode="popLayout">
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm pointer-events-none">
        {visibleBadges.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: -20, scale: 0.95, x: 100 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: 0,
              transition: {
                delay: badge.displayTime / 1000,
                type: 'spring',
                stiffness: 300,
                damping: 30,
              },
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.95,
              x: 100,
              transition: { duration: 0.3 },
            }}
            layout
            className="pointer-events-auto"
          >
            <div className="relative bg-linear-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-2xl overflow-hidden border-2 border-white/20">
              {/* Animated background gradient */}
              <motion.div
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 opacity-20"
              ></motion.div>

              {/* Content */}
              <div className="relative z-10 p-4 pr-12">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: badge.displayTime / 1000 + 0.1, type: 'spring' }}
                  className="flex items-start gap-4"
                >
                  {/* Badge emoji with confetti */}
                  <motion.div
                    animate={{
                      y: [-10, 10, -10],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'mirror',
                    }}
                    className="text-5xl shrink-0 filter drop-shadow-lg"
                  >
                    {badge.emoji}
                  </motion.div>

                  {/* Text content */}
                  <div className="flex-1 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles size={16} className="text-yellow-200" />
                      </motion.div>
                      <h4 className="font-bold text-white">
                        Badge Unlocked!
                      </h4>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {badge.name}
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      Rarity: <span className="font-semibold capitalize">{badge.rarity}</span>
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setVisibleBadges(prev => prev.filter(b => b.id !== badge.id));
                  onDismiss?.(badge);
                }}
                className="absolute top-3 right-3 z-20 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X size={18} className="text-white" strokeWidth={3} />
              </motion.button>

              {/* Progress line animation */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{
                  duration: 6,
                  delay: badge.displayTime / 1000,
                  ease: 'linear',
                }}
                className="absolute bottom-0 left-0 h-1 bg-white/40 origin-left"
              ></motion.div>
            </div>

            {/* Confetti particles */}
            {!badge.confettiShown && (
              <Confetti badgeId={badge.id} emit={badges.some(b => b.badgeId === badge.badgeId)} />
            )}
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}

/**
 * Confetti Component
 * Shows celebration confetti when badge is earned
 */
function Confetti({ emit }) {
  const particles = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 2 + Math.random() * 1,
    xOffset: (Math.random() - 0.5) * 100,
  })), []);

  if (!emit) return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          initial={{
            left: `${particle.left}%`,
            top: -20,
            opacity: 1,
          }}
          animate={{
            left: `calc(${particle.left}% + ${particle.xOffset}px)`,
            top: '100vh',
            opacity: 0,
            rotate: 360,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeIn',
          }}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-lg"
        ></motion.div>
      ))}
    </div>
  );
}
