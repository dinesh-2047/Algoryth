import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    comparison: {
      type: String,
      enum: ["trimmed", "tokens", "exact"],
      default: "trimmed",
    },
    isHidden: { type: Boolean, default: true },
    maxTimeMs: { type: Number, default: 3000 },
    maxMemoryKb: { type: Number, default: 262144 },
    weight: { type: Number, default: 1 },
  },
  { _id: false }
);

const starterCodeSchema = new mongoose.Schema(
  {
    javascript: { type: String, default: "" },
    python: { type: String, default: "" },
    java: { type: String, default: "" },
    cpp: { type: String, default: "" },
    go: { type: String, default: "" },
  },
  { _id: false }
);

const editorialSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedAt: { type: Date, default: null },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    index: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
    index: true,
  },
  tags: {
    type: [String],
    default: [],
    index: true,
  },
  statement: {
    type: String,
    required: true,
  },
  inputFormat: {
    type: String,
    default: "",
  },
  outputFormat: {
    type: String,
    default: "",
  },
  constraints: {
    type: [String],
    default: [],
  },
  examples: {
    type: [exampleSchema],
    default: [],
  },
  hints: {
    type: [String],
    default: [],
  },
  starterCode: {
    type: starterCodeSchema,
    default: () => ({}),
  },
  isPublic: {
    type: Boolean,
    default: true,
    index: true,
  },
  editorial: {
    type: editorialSchema,
    default: () => ({}),
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  testCases: {
    type: [testCaseSchema],
    default: [],
    validate: {
      validator: (cases) => Array.isArray(cases) && cases.length >= 10,
      message: "Each problem must include at least 10 test cases.",
    },
  },
  submissionsCount: {
    type: Number,
    default: 0,
  },
  acceptedCount: {
    type: Number,
    default: 0,
  },
  acceptanceRate: {
    type: Number,
    default: 0,
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

problemSchema.index({ tags: 1, rating: 1 });
problemSchema.index({ difficulty: 1, rating: 1 });
problemSchema.index({ isPublic: 1, rating: 1 });

problemSchema.pre("save", function updateTimestamp(next) {
  this.updatedAt = Date.now();
  next();
});

const Problem = mongoose.models.Problem || mongoose.model("Problem", problemSchema);

export default Problem;
