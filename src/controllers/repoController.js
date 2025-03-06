import mongoose from "mongoose";
import OrganizationRepo from "../models/OrganizationRepo.js";

export const getRepositoryData = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { search_query = '', per_page = 10, page = 1 } = req.query;

    const skip = (page - 1) * per_page;

    const searchFilter = search_query
      ? {
        $or: [
          { name: { $regex: search_query, $options: "i" } },
          { description: { $regex: search_query, $options: "i" } },
          { full_name: { $regex: search_query, $options: "i" } },
          { htmlUrl: { $regex: search_query, $options: "i" } },
          { homepage: { $regex: search_query, $options: "i" } },
        ],
      }
      : {};

    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(repoId),
          ...searchFilter,
        },
      },
      {
        $lookup: {
          from: "organizationrepocommits",
          localField: "_id",
          foreignField: "repoId",
          as: "commits",
        },
      },
      {
        $lookup: {
          from: "organizationrepoissues",
          localField: "_id",
          foreignField: "repoId",
          as: "issues",
        },
      },
      {
        $lookup: {
          from: "organizationrepopullrequests",
          localField: "_id",
          foreignField: "repoId",
          as: "pullRequests",
        },
      },
      {
        $project: {
          name: 1,
          full_name: 1,
          description: 1,
          htmlUrl: 1,
          homepage: 1,
          mergedData: {
            $concatArrays: ["$commits", "$issues", "$pullRequests"],
          },
        },
      },
      { $unwind: "$mergedData" },
      {
        $replaceRoot: {
          newRoot: "$mergedData",
        },
      },
      {
        $match: {
          $or: [
            { message: { $regex: search_query, $options: "i" } },
            { state: { $regex: search_query, $options: "i" } },
            { body: { $regex: search_query, $options: "i" } },
          ],
        },
      },
      { $skip: skip },
      { $limit: parseInt(per_page) },
    ];

    const data = await OrganizationRepo.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        currentPage: parseInt(page),
        pageSize: parseInt(per_page),
        totalCount: data.length,
      },
    });
  } catch (error) {
    console.error("Error fetching repository data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch repository data.",
    });
  }
};
