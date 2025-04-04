import { githubClient } from "../../../api-github/client";
import { CreateLabelDocument } from "../api";
import { Label } from "../types";

/**
 * Service responsible for label operations
 */
export class LabelService {
  /**
   * Create a label for a repository
   */
  async createLabel(
    repositoryId: string,
    name: string,
    color: string,
    description?: string
  ): Promise<Label> {
    // GitHub expects hex colors without the # prefix
    const colorHex = color.startsWith("#") ? color.substring(1) : color;

    const input = {
      repositoryId,
      name,
      color: colorHex,
      description: description || "",
    };

    const result = await githubClient.mutation(CreateLabelDocument, { input }).toPromise();

    if (!result.data?.createLabel?.label) {
      throw new Error("Failed to create label");
    }

    const labelData = result.data.createLabel.label;
    return {
      id: labelData.id,
      name: labelData.name,
      color: labelData.color,
      description: labelData.description || "",
    };
  }
}

// Create a singleton instance
export const labelService = new LabelService();
