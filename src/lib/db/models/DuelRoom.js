import mongoose from "mongoose";

const duelProblemSchema = new mongoose.Schema(
  {
    problemSlug: { type: String, required: true },
    points: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const duelRoomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    default: "",
    trim: true,
  },
  hostUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  guestUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true,
  },
  problems: {
    type: [duelProblemSchema],
    validate: {
      validator: (items) => Array.isArray(items) && items.length > 0,
      message: "A duel room must include at least one problem.",
    },
  },
  durationMinutes: {
    type: Number,
    default: 60,
    min: 10,
    max: 180,
  },
  isPrivate: {
    type: Boolean,
    default: false,
    index: true,
  },
  passwordHash: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["waiting", "live", "ended", "canceled"],
    default: "waiting",
    index: true,
  },
  endReason: {
    type: String,
    default: "",
  },
  winnerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true,
  },
  endedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  endedAt: {
    type: Date,
    default: null,
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

duelRoomSchema.index({ status: 1, createdAt: -1 });

duelRoomSchema.pre("save", function updateTimestamp(next) {
  this.updatedAt = Date.now();
  next();
});

const DuelRoom = mongoose.models.DuelRoom || mongoose.model("DuelRoom", duelRoomSchema);

export default DuelRoom;
