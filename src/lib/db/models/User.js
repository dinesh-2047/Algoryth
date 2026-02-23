import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Badge and streak tracking fields
  streakCount: {
    type: Number,
    default: 0,
    index: true,
  },
  lastSubmissionDate: {
    type: Date,
    default: null,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  totalSubmissions: {
    type: Number,
    default: 0,
    index: true,
  },
  totalAcceptedCount: {
    type: Number,
    default: 0,
    index: true,
  },
  acceptanceRate: {
    type: Number,
    default: 0, // Percentage (0-100)
  },
  perfectAcceptanceCount: {
    type: Number,
    default: 0, // Problems solved on first attempt
  },
  practiceLanguages: {
    type: [String],
    default: [],
  },
  totalBadges: {
    type: Number,
    default: 0,
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
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;