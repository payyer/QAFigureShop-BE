/**
 * Tạo một object mới chỉ chứa các key được chỉ định từ object gốc.
 * @param obj Object gốc
 * @param keys Danh sách các key muốn lấy
 * @returns Object mới chỉ chứa các key đã chọn
 */
export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    // Check if key exists (optional safety)
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    } else {
      // Handle Mongoose usage where properties are on prototype or via strict getters
      // If obj is Mongoose document, obj[key] usually works fine.
      // Fallback for direct access if hasOwnProperty fails (e.g. prototype props)
      result[key] = obj[key];
    }
  });
  return result;
};
