import mongoose from 'mongoose';

const userProblemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problemId: {
    type: String,
    required: true,
  },
  problemSlug: {
    type: String,
    required: true,
  },
  problemTitle: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Unsolved', 'Attempted', 'Solved'],
    default: 'Unsolved',
  },
  submissions: [
    {
      code: String,
      language: String,
      verdict: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  lastSubmissionAt: {
    type: Date,
  },
  solvedAt: {
    type: Date,
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

// Index for quick lookups
userProblemSchema.index({ userId: 1, problemId: 1 }, { unique: true });
userProblemSchema.index({ userId: 1, status: 1 });

// Update the updatedAt field before saving
userProblemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserProblem = mongoose.models.UserProblem || mongoose.model('UserProblem', userProblemSchema);

export default UserProblem;
