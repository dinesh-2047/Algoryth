import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema(
  {
    problemSlug: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      enum: ["javascript", "python", "java", "cpp", "go"],
      default: "javascript",
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    summary: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    code: {
      type: String,
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    runtimeMs: {
      type: Number,
      default: null,
    },
    memoryKb: {
      type: Number,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { minimize: false }
);

solutionSchema.index({ problemSlug: 1, createdAt: -1 });
solutionSchema.index({ userId: 1, problemSlug: 1, createdAt: -1 });

solutionSchema.pre("save", function updateTimestamp(next) {
  this.updatedAt = Date.now();
  next();
});

const Solution = mongoose.models.Solution || mongoose.model("Solution", solutionSchema);

export default Solution;
