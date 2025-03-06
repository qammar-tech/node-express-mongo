import mongoose from "mongoose";

const OrganizationRepoCommitSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  repoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sha: {
    type: String,
    required: true,
    unique: true,
  },
  author_name: {
    type: String,
  },
  author_email: {
    type: String,
  },
  author_login: {
    type: String,
  },
  author_id: {
    type: String,
  },
  time: {
    type: Date,
  },
  message: {
    type: String,
  },
  url: {
    type: String,
  },
  verified: {
    type: Boolean,
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

export default mongoose.model("OrganizationRepoCommit", OrganizationRepoCommitSchema);
