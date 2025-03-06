import mongoose from "mongoose";

const OrganizationMemberSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  githubId: {
    type: String,
    required: true,
    unique: true,
  },
  login: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  bio: {
    type: String,
  },
  public_repos: {
    type: String,
  },
  followers: {
    type: String,
  },
  following: {
    type: String,
  },
  avatarUrl: {
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

export default mongoose.model("OrganizationMember", OrganizationMemberSchema);
