/**
 * Utility composables for formatting data across the application
 */

/**
 * Format a price value to Vietnamese currency (VND)
 * @param value - The price value to format
 * @returns Formatted price string in VND
 */
export function useFormatPrice() {
  const formatPrice = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === "") return "N/A";

    // Convert string to number if needed
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    // Check if it's a valid number after conversion
    if (isNaN(numValue)) return "N/A";

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numValue);
  };

  return { formatPrice };
}
