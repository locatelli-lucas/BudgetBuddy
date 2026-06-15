/**
 * Normalizes icon names from database (underscore_separated) to MaterialIcons format (hyphen-separated).
 */
export function normalizeIcon(icon: string | undefined | null): string {
  if (!icon) return 'help-outline';
  return icon.replace(/_/g, '-');
}
