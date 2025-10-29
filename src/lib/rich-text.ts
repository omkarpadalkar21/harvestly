/**
 * Helper function to extract plain text from Lexical rich text format
 */

type LexicalNode = {
  text?: string;
  children?: LexicalNode[];
  [key: string]: unknown;
} | null | undefined;

type LexicalRichText =
  | string
  | null
  | undefined
  | {
      root?: {
        children?: LexicalNode[];
      };
    };

export function extractTextFromRichText(richText: LexicalRichText): string {
  if (!richText) return "";

  if (typeof richText === "string") {
    return richText;
  }

  if (richText && typeof richText === "object" && "root" in richText) {
    const root = richText.root;
    if (root && Array.isArray(root.children)) {
      const extractTextFromNode = (node: LexicalNode): string => {
        if (!node) return "";

        if (typeof node.text === "string") {
          return node.text;
        }

        if (Array.isArray(node.children)) {
          return node.children.map(extractTextFromNode).join("");
        }

        return "";
      };

      return root.children.map(extractTextFromNode).join("");
    }
  }

  return "";
}

/**
 * Check if the rich text content has any actual text content
 */
export function hasRichTextContent(richText: LexicalRichText): boolean {
  return extractTextFromRichText(richText).trim().length > 0;
}

