import {fetchAllPages, fetchGithubData} from '../helpers/githubHelper.js';
import {findOrCreate} from "../helpers/database.js";
import Organization from "../models/Organization.js";
import OrganizationMember from "../models/OrganizationMember.js";
import OrganizationRepo from "../models/OrganizationRepo.js";
import OrganizationRepoPullRequest from "../models/OrganizationRepoPullRequest.js";
import OrganizationRepoIssue from "../models/OrganizationRepoIssue.js";
import OrganizationRepoCommit from "../models/OrganizationRepoCommit.js";

export const fetchOrganizations = async (user, syncMore = true) => {
  const organizations = await fetchGithubData(user.accessToken, 'user/orgs');
  return organizations.map(async (organization) => {
    const data = {
      userId: user.id,
      githubId: organization.id,
      login: organization.login,
      url: organization.url,
      avatarUrl: organization.avatar_url,
      description: organization.description,
    }
    const org = await findOrCreate(Organization, {githubId: organization.id}, data);
    if (syncMore) {
      await fetchOrganizationMembers(user, org);
      await fetchOrganizationRepos(user, org, syncMore);
    }
  });
};

export const fetchOrganizationMembers = async (user, org) => {
  const allOrgMembers = []
  await fetchAllPages(user.accessToken, `orgs/${org.githubId}/members`, async (orgMembers) => {
    orgMembers.map(async (orgMember) => {
      const orgMemberData =  await fetchGithubData(user.accessToken, `users/${orgMember.login}`);

      const data = {
        organizationId: org.id,
        userId: user.id,
        githubId: orgMemberData.id,
        login: orgMemberData.login,
        name: orgMemberData.name,
        bio: orgMemberData.bio,
        public_repos: orgMemberData.public_repos,
        followers: orgMemberData.followers,
        following: orgMemberData.following,
        avatarUrl: orgMemberData.avatar_url,
        description: orgMember.description,
      }
      const record = await findOrCreate(OrganizationMember, { githubId: orgMember.id }, data);
      allOrgMembers.push(record);

      return record;
    })
  });

  return allOrgMembers
};

export const fetchOrganizationRepos = async (user, org, syncMore = true) => {
  const allRepos = [];
  await fetchAllPages(user.accessToken, `orgs/${org.githubId}/repos`, async (orgRepos) => {
    orgRepos.map(async (orgRepo) => {
      const data = {
        organizationId: org.id,
        userId: user.id,
        githubId: orgRepo.id,
        name: orgRepo.name,
        orgRepo: orgRepo.orgRepo,
        private: orgRepo.private,
        description: orgRepo.description,
        htmlUrl: orgRepo.html_url,
        homepage: orgRepo.homepage,
        url: orgRepo.url,
        ownerLogin: orgRepo.owner?.login,
        ownerId: orgRepo.owner?.id,
      }
      const repo = await findOrCreate(OrganizationRepo, { githubId: orgRepo.id }, data);
      if (syncMore) {
        fetchRepoPulls(user, org, repo);
        fetchRepoIssues(user, org, repo);
        fetchRepoCommits(user, org, repo);
      }
      allRepos.push(repo);
      return repo;
    })
  });

  return allRepos;
};

export const fetchRepoPulls = async (user, org, repo) => {
  const allPrs = []
  await fetchAllPages(user.accessToken, `repos/${repo.ownerLogin}/${repo.name}/pulls`, async (pullRequests) => {
    pullRequests.map(async (pullRequest) => {
      if (!pullRequest.node_id.startsWith('PR_')) {
        return;
      }

      const data = {
        organizationId: org.id,
        userId: user.id,
        repoId: repo.id,
        githubId: pullRequest.id,
        name: pullRequest.title,
        number: pullRequest.number,
        state: pullRequest.state,
        createdByLogin: pullRequest.user?.login,
        createdByID: pullRequest.user?.id,
        body: pullRequest.body,
        PRCreatedAt: pullRequest.created_at,
        PRUpdatedAt: pullRequest.updated_at,
        PRClosedAt: pullRequest.closed_at,
        PRMergedAt: pullRequest.merged_at,
      }

      const PR = await findOrCreate(OrganizationRepoPullRequest, { githubId: pullRequest.id }, data);
      allPrs.push(PR);

      return PR;
    })
  }, { state: 'all' });

  return allPrs
};

export const fetchRepoIssues = async (user, org, repo) => {
  const allIssues = [];
  await fetchAllPages(user.accessToken, `repos/${repo.ownerLogin}/${repo.name}/issues`, async (issues) => {
    issues.map(async (issue) => {
      if (!issue.node_id.startsWith('I_')) {
        return;
      }

      const data = {
        organizationId: org.id,
        userId: user.id,
        repoId: repo.id,
        githubId: issue.id,
        name: issue.title,
        number: issue.number,
        state: issue.state,
        createdByLogin: issue.user?.login,
        createdByID: issue.user?.id,
        body: issue.body,
        issueCreatedAt: issue.created_at,
        issueUpdatedAt: issue.updated_at,
        issueClosedAt: issue.closed_at,
        issueMergedAt: issue.merged_at,
      }

      const issueRecord = await findOrCreate(OrganizationRepoIssue, { githubId: issue.id }, data);
      allIssues.push(issueRecord);

      return issueRecord;
    })
  }, { state: 'all' });

  return allIssues
};

export const fetchRepoCommits = async (user, org, repo) => {
  const allCommits = [];
  await fetchAllPages(user.accessToken, `repos/${repo.ownerLogin}/${repo.name}/commits`, async (commits) => {
    if (!Array.isArray(commits)){
      return;
    }

    commits.map(async (commit) => {
      const data = {
        organizationId: org.id,
        userId: user.id,
        repoId: repo.id,
        sha: commit.sha,
        author_name: commit.commit?.author?.name,
        author_email: commit.commit?.author?.email,
        author_login: commit.author?.login,
        author_id: commit.author?.id,
        time: commit.commit?.author?.time,
        message: commit.commit.message,
        html_url: commit.html_url,
        verified: commit.verification?.verified,
      }
      const commitRecord = await findOrCreate(OrganizationRepoCommit, { sha: commit.sha }, data);
      allCommits.push(commitRecord);

      return commitRecord;
    })
  });

  return allCommits
};
