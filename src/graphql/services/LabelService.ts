/**
 * Label Service
 *
 * Service class to handle all label-related operations.
 * Uses the GraphQL generated hooks and handles data transformation.
 */
import { gql } from "urql";

import { Label } from "../../types";
import { client } from "../client";

import { appInitializationService } from "./AppInitializationService";

// Define GraphQL documents
const GetRepositoryLabelsDocument = gql`
  query GetRepositoryLabels($repositoryId: ID!) {
    node(id: $repositoryId) {
      ... on Repository {
        labels(first: 100) {
          nodes {
            id
            name
            color
            description
          }
        }
      }
    }
  }
`;

const CreateLabelDocument = gql`
  mutation CreateLabel($repositoryId: ID!, $name: String!, $color: String!, $description: String) {
    createLabel(
      input: { repositoryId: $repositoryId, name: $name, color: $color, description: $description }
    ) {
      label {
        id
        name
        color
        description
      }
    }
  }
`;

const UpdateLabelDocument = gql`
  mutation UpdateLabel($labelId: ID!, $name: String!, $color: String!, $description: String) {
    updateLabel(input: { id: $labelId, name: $name, color: $color, description: $description }) {
      label {
        id
        name
        color
        description
      }
    }
  }
`;

const DeleteLabelDocument = gql`
  mutation DeleteLabel($labelId: ID!) {
    deleteLabel(input: { id: $labelId }) {
      clientMutationId
    }
  }
`;

const AddLabelsToIssueDocument = gql`
  mutation AddLabelsToIssue($issueId: ID!, $labelIds: [ID!]!) {
    addLabelsToLabelable(input: { labelableId: $issueId, labelIds: $labelIds }) {
      labelable {
        ... on Issue {
          labels(first: 100) {
            nodes {
              id
              name
              color
              description
            }
          }
        }
      }
    }
  }
`;

const RemoveLabelFromIssueDocument = gql`
  mutation RemoveLabelFromIssue($issueId: ID!, $labelId: ID!) {
    removeLabelFromLabelable(input: { labelableId: $issueId, labelId: $labelId }) {
      labelable {
        ... on Issue {
          labels(first: 100) {
            nodes {
              id
              name
              color
              description
            }
          }
        }
      }
    }
  }
`;

// Type definitions for API responses
interface LabelNode {
  id: string;
  name: string;
  color: string;
  description?: string;
}

/**
 * Service for interacting with GitHub issue labels
 */
export class LabelService {
  private client = client;

  /**
   * Get all labels for a repository
   */
  async getRepositoryLabels(owner: string, name: string): Promise<Label[]> {
    return appInitializationService.getRepositoryLabels(owner, name);
  }

  /**
   * Get all labels for a project's repositories
   */
  async getProjectLabels(projectId: string): Promise<Label[]> {
    return appInitializationService.getProjectLabels(projectId);
  }

  /**
   * Create a new label in a repository
   */
  async createLabel(
    repositoryId: string,
    name: string,
    color: string,
    description?: string
  ): Promise<Label | null> {
    try {
      // GitHub expects hex colors without the # prefix
      const colorHex = color.startsWith("#") ? color.substring(1) : color;

      const { data, error } = await this.client
        .mutation(CreateLabelDocument, {
          repositoryId,
          name,
          color: colorHex,
          description,
        })
        .toPromise();

      if (error || !data?.createLabel?.label) {
        console.error("Error creating label:", error);
        return null;
      }

      // Return the created label with our expected format
      const label = data.createLabel.label as LabelNode;
      return {
        id: label.id,
        name: label.name,
        color: `#${label.color}`,
        description: label.description || "",
      };
    } catch (err) {
      console.error("Exception creating label:", err);
      return null;
    }
  }

  /**
   * Update an existing label
   */
  async updateLabel(
    labelId: string,
    name: string,
    color: string,
    description?: string
  ): Promise<Label | null> {
    try {
      // GitHub expects hex colors without the # prefix
      const colorHex = color.startsWith("#") ? color.substring(1) : color;

      const { data, error } = await this.client
        .mutation(UpdateLabelDocument, {
          labelId,
          name,
          color: colorHex,
          description,
        })
        .toPromise();

      if (error || !data?.updateLabel?.label) {
        console.error("Error updating label:", error);
        return null;
      }

      // Return the updated label with our expected format
      const label = data.updateLabel.label as LabelNode;
      return {
        id: label.id,
        name: label.name,
        color: `#${label.color}`,
        description: label.description || "",
      };
    } catch (err) {
      console.error("Exception updating label:", err);
      return null;
    }
  }

  /**
   * Delete a label
   */
  async deleteLabel(labelId: string): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .mutation(DeleteLabelDocument, {
          labelId,
        })
        .toPromise();

      if (error) {
        console.error("Error deleting label:", error);
        return false;
      }

      return data?.deleteLabel?.clientMutationId !== null;
    } catch (err) {
      console.error("Exception deleting label:", err);
      return false;
    }
  }

  /**
   * Add labels to an issue
   */
  async addLabelsToIssue(issueId: string, labelIds: string[]): Promise<Label[]> {
    try {
      const { data, error } = await this.client
        .mutation(AddLabelsToIssueDocument, {
          issueId,
          labelIds,
        })
        .toPromise();

      if (error || !data?.addLabelsToLabelable?.labelable?.labels?.nodes) {
        console.error("Error adding labels to issue:", error);
        return [];
      }

      // Return the updated labels list
      return data.addLabelsToLabelable.labelable.labels.nodes.map((node: LabelNode) => ({
        id: node.id,
        name: node.name,
        color: `#${node.color}`,
        description: node.description || "",
      }));
    } catch (err) {
      console.error("Exception adding labels to issue:", err);
      return [];
    }
  }

  /**
   * Remove a label from an issue
   */
  async removeLabelFromIssue(issueId: string, labelId: string): Promise<Label[]> {
    try {
      const { data, error } = await this.client
        .mutation(RemoveLabelFromIssueDocument, {
          issueId,
          labelId,
        })
        .toPromise();

      if (error || !data?.removeLabelFromLabelable?.labelable?.labels?.nodes) {
        console.error("Error removing label from issue:", error);
        return [];
      }

      // Return the updated labels list
      return data.removeLabelFromLabelable.labelable.labels.nodes.map((node: LabelNode) => ({
        id: node.id,
        name: node.name,
        color: `#${node.color}`,
        description: node.description || "",
      }));
    } catch (err) {
      console.error("Exception removing label from issue:", err);
      return [];
    }
  }

  /**
   * Get all labels - simplified to just use repository labels
   * This is used by the ProjectBoard component
   */
  async getLabels(repositoryId: string): Promise<Label[]> {
    // Simply delegate to getRepositoryLabels since that's what we need
    return this.getRepositoryLabels(repositoryId, repositoryId);
  }
}

export const labelService = new LabelService();
