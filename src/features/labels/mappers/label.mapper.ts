import { ProjectV2Item, Label as GithubLabel } from "@/api-github/schema/github-schema";

import { Label } from "../types/label.types";

/**
 * Maps GitHub labels to Label objects
 */
export function mapToLabels(items: (ProjectV2Item | null)[]): Label[] {
  if (!items.length) return [];

  const labelMap = new Map<string, Label>();

  items
    .filter((item): item is ProjectV2Item => item !== null && item.content !== null)
    .forEach((item) => {
      // Type assertion to access labels
      const content = item.content as unknown as {
        labels?: {
          nodes?: (GithubLabel | null)[];
        };
      };

      if (content.labels?.nodes) {
        content.labels.nodes.forEach((label) => {
          if (label && !labelMap.has(label.id)) {
            labelMap.set(label.id, {
              id: label.id,
              name: label.name,
              color: label.color || "",
              description: label.description || undefined,
            });
          }
        });
      }
    });

  return Array.from(labelMap.values());
}
