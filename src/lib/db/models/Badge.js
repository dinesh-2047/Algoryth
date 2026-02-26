import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true, // Lucide icon name or emoji
  },
  emoji: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['achievement', 'difficulty', 'streak', 'performance', 'accuracy', 'language', 'time', 'community', 'special'],
    required: true,
    index: true,
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'legendary'],
    default: 'common',
    index: true,
  },
  color: {
    type: String,
    default: '#9CA3AF', // Gray by default
  },
  criteria: {
    type: {
      type: String,
      enum: ['milestone', 'streak', 'performance', 'accuracy', 'first-try', 'hidden'],
      required: true,
    },
    condition: {
      type: String,
      required: true, // Description of the condition (e.g., "totalAcceptedCount >= 1")
    },
    value: {
      type: Number, // Target value (e.g., 1 for first solve, 7 for 7-day streak)
      required: true,
    },
  },
  requirements: {
    minProblems: {
      type: Number,
      default: 0,
    },
    minAcceptanceRate: {
      type: Number,
      default: 0,
    },
    minDifficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: null,
    },
  },
  awardedCount: {
    type: Number,
    default: 0,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
badgeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Badge = mongoose.models.Badge || mongoose.model('Badge', badgeSchema);

export default Badge;
