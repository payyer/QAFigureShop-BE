export const createSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Chuẩn hóa Unicode để tách dấu
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
    .trim()
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w-]+/g, "") // Xóa các ký tự đặc biệt
    .replace(/--+/g, "-"); // Thỏa hiệp nhiều dấu gạch ngang liên tiếp
};
