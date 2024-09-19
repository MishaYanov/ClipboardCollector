export function sanitizeId(option: string): string {
    return option.replace(/\s+/g, "-").toLowerCase().substring(0, 100);
  }
  