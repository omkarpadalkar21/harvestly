/**
 * Helper function to extract plain text from Lexical rich text format
 */
export function extractTextFromRichText(richText: any): string {
  if (!richText) return "";
  
  // If it's already a string, return it
  if (typeof richText === "string") {
    return richText;
  }
  
  // If it's a Lexical object
  if (richText && typeof richText === "object" && "root" in richText) {
    const root = richText.root;
    if (root && Array.isArray(root.children)) {
      // Recursively extract text from all children
      const extractTextFromNode = (node: any): string => {
        if (!node) return "";
        
        // If the node has text property, return it
        if (typeof node.text === "string") {
          return node.text;
        }
        
        // If the node has children, recursively extract text from them
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
export function hasRichTextContent(richText: any): boolean {
  return extractTextFromRichText(richText).trim().length > 0;
}

