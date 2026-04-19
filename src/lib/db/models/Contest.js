import mongoose from "mongoose";

const contestProblemSchema = new mongoose.Schema(
  {
    problemSlug: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const ratingChangeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rank: { type: Number, required: true },
    solved: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 },
    oldRating: { type: Number, required: true },
    newRating: { type: Number, required: true },
    delta: { type: Number, required: true },
  },
  { _id: false }
);

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    default: "",
  },
  startTime: {
    type: Date,
    required: true,
    index: true,
  },
  endTime: {
    type: Date,
    required: true,
    index: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 10,
  },
  problems: {
    type: [contestProblemSchema],
    validate: {
      validator: (items) => Array.isArray(items) && items.length > 0,
      message: "Contest must include at least one problem.",
    },
  },
  isPublic: {
    type: Boolean,
    default: true,
    index: true,
  },
  isRated: {
    type: Boolean,
    default: true,
  },
  ratingProcessedAt: {
    type: Date,
    default: null,
  },
  ratingChanges: {
    type: [ratingChangeSchema],
    default: [],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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

contestSchema.index({ isPublic: 1, startTime: -1 });

contestSchema.pre("save", function updateTimestamp(next) {
  this.updatedAt = Date.now();
  next();
});

const Contest = mongoose.models.Contest || mongoose.model("Contest", contestSchema);

export default Contest;
