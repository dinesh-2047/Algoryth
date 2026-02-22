import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  problemSlug: {
    type: String,
    required: true,
    index: true,
  },
  problemId: {
    type: String,
    required: false,
  },
  problemTitle: {
    type: String,
    required: false,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'go'],
    default: 'javascript',
  },
  verdict: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', 'Compilation Error', 'Error'],
    default: 'Error',
    index: true,
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0,
  },
  memoryUsage: {
    type: Number, // in KB
    default: 0,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: null,
  },
  testsPassed: {
    type: Number,
    default: 0,
  },
  totalTests: {
    type: Number,
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient queries
submissionSchema.index({ userId: 1, submittedAt: -1 });
submissionSchema.index({ userId: 1, verdict: 1 });
submissionSchema.index({ problemSlug: 1, verdict: 1 });

// Pre-save middleware to update timestamp
submissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add method to get formatted submission data
submissionSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Add static method to get user statistics
submissionSchema.statics.getUserStats = async function(userId) {
  const submissions = await this.find({ userId });
  const acceptedSubmissions = submissions.filter(s => s.verdict === 'Accepted');
  
  // Calculate unique problems solved
  const uniqueProblems = new Set(acceptedSubmissions.map(s => s.problemSlug));
  
  // Calculate difficulty breakdown
  const difficultyBreakdown = {
    easy: 0,
    medium: 0,
    hard: 0,
  };
  
  acceptedSubmissions.forEach(s => {
    const diff = s.difficulty?.toLowerCase();
    if (['easy', 'medium', 'hard'].includes(diff)) {
      difficultyBreakdown[diff]++;
    }
  });
  
  // Calculate language usage
  const languageUsage = {};
  submissions.forEach(s => {
    languageUsage[s.language] = (languageUsage[s.language] || 0) + 1;
  });

  return {
    totalSubmissions: submissions.length,
    acceptedSubmissions: acceptedSubmissions.length,
    uniqueProblems: uniqueProblems.size,
    successRate: submissions.length > 0 ? ((acceptedSubmissions.length / submissions.length) * 100).toFixed(2) : 0,
    difficultyBreakdown,
    languageUsage,
    lastSubmittedAt: submissions.length > 0 ? submissions[0].submittedAt : null,
  };
};

const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

export default Submission;
