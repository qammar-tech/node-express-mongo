import User from "../models/User.js";
import { getColumnReadableName } from "../helpers/database.js";
import OrganizationRepoCommit from "../models/OrganizationRepoCommit.js";
import OrganizationRepoIssue from "../models/OrganizationRepoIssue.js";
import OrganizationRepoPullRequest from "../models/OrganizationRepoPullRequest.js";
import OrganizationRepo from "../models/OrganizationRepo.js";
import OrganizationMember from "../models/OrganizationMember.js";
import Organization from "../models/Organization.js";
import mongoose from "mongoose";

export const protectedController = async (req, res) => {
  const user = req.user;

  res.send(
    JSON.stringify({
      user,
    })
  );
};

export const getPaginatedAndFilteredResults = (Model) => async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search_query,
      organization_id,
      repo_id,
      sort,
      filters,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const query = {};
    if (search_query) {
      const schemaPaths = Object.keys(Model.schema.paths);

      query.$or = schemaPaths
        .map((path) => {
          const pathType = Model.schema.paths[path].instance;

          if (pathType === "String") {
            return { [path]: { $regex: search_query, $options: "i" } };
          }

          if (pathType === "Number" && !isNaN(Number(search_query))) {
            return { [path]: Number(search_query) };
          }

          return null;
        })
        .filter(Boolean);
    }

    if (organization_id) {
      if (!mongoose.Types.ObjectId.isValid(organization_id)) {
        return res
          .status(400)
          .json({ error: "Invalid Organization ID provided" });
      }
      query.organizationId = organization_id;
    }

    if (repo_id) {
      if (!mongoose.Types.ObjectId.isValid(repo_id)) {
        return res.status(400).json({ error: "Invalid Repo ID provided" });
      }
      query.repoId = repo_id;
    }

    if (req.user) {
      query.userId = req.user._id;
    }

    if (filters) {
      const parsedFilter = JSON.parse(filters);

      Object.keys(parsedFilter).forEach((field) => {
        const filterConfig = parsedFilter[field];
        query.$and = query.$and || [];
        query.$or = query.$or || [];

        if (filterConfig.multiple) {
          filterConfig.conditions.forEach(({ type, value, operator }) => {
            const condition = generateCondition(field, type, value, operator);
            if (operator === "OR") {
              query.$or.push(condition);
            } else {
              query.$and.push(condition);
            }
          });
        } else {
          const condition = generateCondition(
            field,
            filterConfig.type,
            filterConfig.value
          );
          if (condition) {
            query.$and.push(condition);
          }
        }
      });
    }

    let sortObject = {};
    if (sort) {
      const sortArray = JSON.parse(sort);
      if (Array.isArray(sortArray)) {
        const sortedSortArray = sortArray.sort(
          (a, b) => a.sort_index - b.sort_index
        );

        sortedSortArray.forEach(({ field_name, sort_dir }) => {
          if (field_name && sort_dir) {
            sortObject[field_name] = sort_dir === "asc" ? 1 : -1;
          }
        });
      }
    }

    const results = await Model.find(query)
      .sort(sortObject)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Model.countDocuments(query);

    const columns = [];
    Object.keys(Model.schema.paths).forEach((column) => {
      if (column === "__v") {
        return;
      }
      columns.push({
        key: column,
        label: getColumnReadableName(column),
        type: Model.schema.paths[column].instance,
      });
    });

    res.json({
      page: pageNumber,
      limit: limitNumber,
      total,
      results,
      columns,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const generateCondition = (field, type, value, operator) => {
  switch (type) {
    case "contains":
      return { [field]: { $regex: value, $options: "i" } };
    case "notContains":
      return { [field]: { $not: { $regex: value, $options: "i" } } };
    case "equals":
      return { [field]: value };
    case "notEqual":
      return { [field]: { $ne: value } };
    case "startsWith":
      return { [field]: { $regex: `^${value}`, $options: "i" } };
    case "endsWith":
      return { [field]: { $regex: `${value}$`, $options: "i" } };
    case "blank":
      return { [field]: { $in: [null, ""] } };
    case "notBlank":
      return { [field]: { $nin: [null, ""] } };
    case "greaterThan":
      return { [field]: { $gt: value } };
    case "greaterThanOrEqual":
      return { [field]: { $gte: value } };
    case "lessThan":
      return { [field]: { $lt: value } };
    case "lessThanOrEqual":
      return { [field]: { $lte: value } };
    default:
      return null;
  }
};

export const deleteIntegration = async (req, res) => {
  const user = req.user;

  await OrganizationRepoCommit.deleteMany({ userId: user.id });
  await OrganizationRepoIssue.deleteMany({ userId: user.id });
  await OrganizationRepoPullRequest.deleteMany({ userId: user.id });
  await OrganizationRepo.deleteMany({ userId: user.id });
  await OrganizationMember.deleteMany({ userId: user.id });
  await Organization.deleteMany({ userId: user.id });
  await User.deleteMany({ userId: user.id });

  res.send(
    JSON.stringify({
      success: true,
    })
  );
};
