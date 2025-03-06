import mongoose from "mongoose";

const OrganizationRepoSchema = new mongoose.Schema({
  organizationId: {
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
  full_name: {
    type: String,
  },
  private: {
    type: Boolean,
  },
  description: {
    type: String,
  },
  htmlUrl: {
    type: String,
  },
  homepage: {
    type: String,
  },
  url: {
    type: String,
  },
  ownerLogin: {
    type: String,
  },
  ownerId: {
    type: String,
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

export default mongoose.model("OrganizationRepo", OrganizationRepoSchema);
