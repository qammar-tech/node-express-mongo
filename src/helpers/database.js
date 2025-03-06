
export const findOrCreate = async (model, filter, data) => {
  let modelRecord = await model.findOne(filter);
  if (!modelRecord) {
    modelRecord = new model(data);
    await modelRecord.save();
  } else {
    Object.keys(data).forEach((field) => {
      modelRecord[field] = data[field]
    })
    await modelRecord.save();
  }

  return modelRecord;
}

export const getColumnReadableName = (column) => {
  switch (column) {
    case 'login':
      return 'Login';
    case 'userId':
      return 'User ID';
    case 'githubId':
      return 'Github ID';
    case 'url':
      return 'URL';
    case 'avatarUrl':
      return 'Avatar';
    case 'description':
      return 'Description';
    case 'createdAt':
      return 'Created At';
    case 'name':
      return 'Name';
    case 'bio':
      return 'Bio';
    case 'public_repos':
      return 'Public Repos';
    case 'followers':
      return 'Followers';
    case 'following':
      return 'Following';
    case 'full_name':
      return 'Full Name';
    case 'private':
      return 'Private';
    case 'htmlUrl':
      return 'URL';
    case 'homepage':
      return 'Home Page';
    case 'ownerLogin':
      return 'Owner Login';
    case 'ownerId':
      return 'Owner ID';
    case 'organizationId':
      return 'Organization ID';
    case 'repoId':
      return 'Repository ID';
    case 'sha':
      return 'SHA';
    case 'author_name':
      return 'Author Name';
    case 'author_email':
      return 'Author Email';
    case 'author_login':
      return 'Author Login';
    case 'author_id':
      return 'Author ID';
    case 'time':
      return 'Time';
    case 'message':
      return 'Message';
    case 'verified':
      return 'Verified';
    case 'number':
      return 'Number';
    case 'state':
      return 'State';
    case 'created_by_login':
      return 'Created By';
    case 'body':
      return 'Body';
    case 'issueCreatedAt':
      return 'Issue Created At';
    case 'issueUpdatedAt':
      return 'Issue Updated At';
    case 'issueClosedAt':
      return 'Issue Closed At';
    case 'issueMergedAt':
      return 'Issue Merged At';
    case 'PRCreatedAt':
      return 'PR Created At';
    case 'PRUpdatedAt':
      return 'PR Updated At';
    case 'PRClosedAt':
      return 'PR Closed At';
    case 'PRMergedAt':
      return 'PR Merged At';
  }

  return column;
}
