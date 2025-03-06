import mongoose from "mongoose";

const OrganizationRepoPullRequestSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  repoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  githubId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  number: {
    type: Number,
  },
  state: {
    type: String,
  },
  created_by_login: {
    type: String,
  },
  body: {
    type: String,
  },
  PRCreatedAt: {
    type: Date,
  },
  PRUpdatedAt: {
    type: Date,
  },
  PRClosedAt: {
    type: Date,
  },
  PRMergedAt: {
    type: Date,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("OrganizationRepoPullRequest", OrganizationRepoPullRequestSchema);
