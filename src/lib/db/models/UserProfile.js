import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow null values
    trim: true,
  },
  bio: {
    type: String,
    maxlength: 500,
    default: '',
  },
  avatar: {
    type: String,
    default: null,
  },
  rating: {
    type: Number,
    default: 1500,
  },
  rank: {
    type: String,
    default: 'Newbie',
  },
  solvedProblems: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  submissions: {
    total: { type: Number, default: 0 },
    accepted: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
  },
  solvedProblemIds: [{
    type: String,
  }],
  bookmarkedProblems: [{
    type: String,
  }],
  preferences: {
    defaultLanguage: {
      type: String,
      default: 'javascript',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    editorFontSize: {
      type: Number,
      default: 14,
    },
  },
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    website: String,
  },
  lastActive: {
    type: Date,
    default: Date.now,
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
userProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate rank based on rating
userProfileSchema.methods.updateRank = function() {
  const rating = this.rating;
  if (rating < 1200) this.rank = 'Newbie';
  else if (rating < 1400) this.rank = 'Pupil';
  else if (rating < 1600) this.rank = 'Specialist';
  else if (rating < 1900) this.rank = 'Expert';
  else if (rating < 2100) this.rank = 'Candidate Master';
  else if (rating < 2400) this.rank = 'Master';
  else if (rating < 2700) this.rank = 'International Master';
  else this.rank = 'Grandmaster';
};

// Method to update acceptance rate
userProfileSchema.methods.updateAcceptanceRate = function() {
  if (this.submissions.total > 0) {
    this.submissions.acceptanceRate = Math.round(
      (this.submissions.accepted / this.submissions.total) * 100
    );
  }
};

const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema);

export default UserProfile;
