import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  problemId: {
    type: String,
    required: true,
    index: true,
  },
  problemTitle: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'go', 'typescript', 'rust'],
  },
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', 'Compilation Error', 'Memory Limit Exceeded'],
    index: true,
  },
  testCasesPassed: {
    type: Number,
    default: 0,
  },
  totalTestCases: {
    type: Number,
    default: 0,
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0,
  },
  memoryUsed: {
    type: Number, // in KB
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  errorMessage: {
    type: String,
    default: null,
  },
});

// Index for efficient queries
submissionSchema.index({ userId: 1, submittedAt: -1 });
submissionSchema.index({ problemId: 1, status: 1 });

const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

export default Submission;
