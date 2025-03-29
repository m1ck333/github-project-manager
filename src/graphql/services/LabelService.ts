/**
 * Label Service
 *
 * Service class to handle all label-related operations.
 * Uses GraphQL operations for fetching and managing labels.
 */
import { gql } from "urql";

import { Label } from "../../types";
import { client } from "../client";

// Define GraphQL documents
const GetLabelsDocument = gql`
  query GetLabels($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        items(first: 100) {
          nodes {
            content {
              ... on Issue {
                labels(first: 20) {
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
      }
    }
  }
`;

// Type definitions for GraphQL responses
interface ProjectItem {
  content?: {
    labels?: {
      nodes?: Array<LabelNode | null>;
    };
  };
}

interface LabelNode {
  id: string;
  name?: string;
  color?: string;
  description?: string;
}

/**
 * Service for managing project labels
 */
export class LabelService {
  private client = client;

  /**
   * Get all labels for a project
   * This gets labels from all issues in the project and deduplicates them
   */
  async getLabels(projectId: string): Promise<Label[]> {
    const { data, error } = await this.client.query(GetLabelsDocument, { projectId }).toPromise();

    if (error || !data?.node) {
      console.error("Error fetching project labels:", error);
      return [];
    }

    if (data.node.__typename !== "ProjectV2" || !data.node.items?.nodes) {
      return [];
    }

    // Extract all labels from all issues and deduplicate
    const labelsMap = new Map<string, Label>();

    data.node.items.nodes.forEach((node: ProjectItem | null) => {
      if (!node?.content?.labels?.nodes) return;

      node.content.labels.nodes.forEach((label: LabelNode | null) => {
        if (!label) return;

        labelsMap.set(label.id, {
          id: label.id,
          name: label.name || "",
          color: label.color || "",
          description: label.description || "",
        });
      });
    });

    return Array.from(labelsMap.values());
  }
}

export const labelService = new LabelService();
