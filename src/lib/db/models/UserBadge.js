import mongoose from 'mongoose';

const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  badgeId: {
    type: String,
    required: true,
    index: true,
  },
  awardedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  progressValue: {
    type: Number,
    default: 0, // Current progress towards badge (e.g., day count for streak, problem count for milestones)
  },
  isNotified: {
    type: Boolean,
    default: false, // Whether user has been notified about this badge
  },
  notifiedAt: {
    type: Date,
    default: null,
  },
  metadata: {
    type: Object,
    default: {}, // Additional data for the badge (e.g., problemSlug for "Speed Demon")
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

// Create compound index for userId and badgeId to prevent duplicates
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Update the updatedAt field before saving
userBadgeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserBadge = mongoose.models.UserBadge || mongoose.model('UserBadge', userBadgeSchema);

export default UserBadge;
