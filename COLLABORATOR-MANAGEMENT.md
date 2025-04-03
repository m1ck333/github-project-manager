# Repository Collaborator Management

This document outlines the changes made to improve repository collaborator management in the application.

## Overview

We've transitioned from using REST API calls to a GraphQL-based approach for managing repository collaborators. Due to GitHub's GraphQL API limitations, we've implemented a hybrid solution that uses GraphQL where possible and falls back to REST API when necessary.

## Changes Made

1. **Created GraphQL Fragments and Queries**

   - Added `CollaboratorFields` fragment for consistent collaborator data
   - Created `GetRepositoryCollaborators` query to fetch collaborators
   - Created `CheckRepositoryCollaborator` query to check if a user is a collaborator

2. **Updated Repository Service**

   - Implemented `getRepositoryCollaborators` method using GraphQL
   - Implemented `checkRepositoryCollaborator` method using GraphQL
   - Simplified `addRepositoryCollaborator` and `removeRepositoryCollaborator` methods

3. **Updated Repository Store**

   - Removed hardcoded GraphQL queries from the store
   - Updated `fetchRepositoryCollaborators` to use the repository service
   - Maintained optimistic UI updates for better user experience

4. **Added Documentation**
   - Created README files for the GraphQL setup
   - Added code comments explaining the hybrid approach
   - Documented the limitations of GitHub's GraphQL API

## Future Improvements

As GitHub's GraphQL API evolves, we can continue to migrate more functionality:

1. **GitHub API Enhancements**

   - If GitHub adds direct mutations for collaborator management, we can update our GraphQL operations

2. **Custom Backend**

   - A custom backend could be implemented to handle operations not supported by GitHub's GraphQL API
   - This would allow for a completely GraphQL-based frontend

3. **Advanced Caching**
   - We could implement more sophisticated caching for collaborator data
   - This would reduce the need for frequent API calls

## Testing

To test the collaborator management functionality:

1. Navigate to a repository detail page
2. Click "Manage Collaborators"
3. Test adding a new collaborator
4. Test removing an existing collaborator

The UI should update optimistically in both cases, and the changes should persist after page refresh.
