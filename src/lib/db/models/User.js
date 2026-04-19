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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    index: true,
  },
  rating: {
    type: Number,
    default: 1200,
    index: true,
  },
  contestsPlayed: {
    type: Number,
    default: 0,
  },
  contestRatingHistory: {
    type: [
      {
        contestSlug: { type: String, required: true },
        contestTitle: { type: String, default: '' },
        rank: { type: Number, default: null },
        oldRating: { type: Number, required: true },
        newRating: { type: Number, required: true },
        delta: { type: Number, required: true },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  // Badge and streak tracking fields
  streakCount: {
    type: Number,
    default: 0,
    index: true,
  },
  lastSolvedDate: {
    type: Date,
    default: null,
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