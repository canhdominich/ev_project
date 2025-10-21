import { BookingStatus } from '@/services/bookingService';

export { BookingStatus };

export const BookingStatusOptions = [
  { value: BookingStatus.PENDING, label: "Chờ duyệt" },
  { value: BookingStatus.APPROVED_BY_LECTURER, label: "Đã duyệt bởi giảng viên" },
  { value: BookingStatus.APPROVED_BY_FACULTY_DEAN, label: "Đã duyệt bởi trưởng khoa" },
  { value: BookingStatus.APPROVED_BY_RECTOR, label: "Đã duyệt bởi phòng nghiên cứu khoa học" },
  { value: BookingStatus.REJECTED, label: "Từ chối" },
];

export const getBookingStatusColor = (status: BookingStatus): string => {
  const statusColorMap: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: "warning", // Màu vàng
    [BookingStatus.APPROVED_BY_LECTURER]: "info", // Màu xanh dương
    [BookingStatus.APPROVED_BY_FACULTY_DEAN]: "primary", // Màu xanh chính
    [BookingStatus.APPROVED_BY_RECTOR]: "success", // Màu xanh lá
    [BookingStatus.REJECTED]: "danger", // Màu đỏ
  };

  return statusColorMap[status] || "primary";
};

export const getBookingStatusText = (status: BookingStatus): string => {
  const statusTextMap: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: "Chờ duyệt",
    [BookingStatus.APPROVED_BY_LECTURER]: "Đã duyệt bởi giảng viên",
    [BookingStatus.APPROVED_BY_FACULTY_DEAN]: "Đã duyệt bởi trưởng khoa",
    [BookingStatus.APPROVED_BY_RECTOR]: "Đã duyệt bởi phòng nghiên cứu khoa học",
    [BookingStatus.REJECTED]: "Từ chối",
  };

  return statusTextMap[status] || "Không xác định";
};

export const canApproveBooking = (userRole: string, currentStatus: BookingStatus): boolean => {
  switch (userRole) {
    case 'Lecturer':
      return currentStatus === BookingStatus.PENDING;
    case 'FacultyDean':
      return currentStatus === BookingStatus.APPROVED_BY_LECTURER;
    case 'Rector':
      return currentStatus === BookingStatus.APPROVED_BY_FACULTY_DEAN;
    case 'Admin':
      return true; // Admin có thể duyệt ở mọi trạng thái
    default:
      return false;
  }
};

export const getNextApprovalStep = (currentStatus: BookingStatus): string | null => {
  switch (currentStatus) {
    case BookingStatus.PENDING:
      return 'Giảng viên';
    case BookingStatus.APPROVED_BY_LECTURER:
      return 'Trưởng khoa';
    case BookingStatus.APPROVED_BY_FACULTY_DEAN:
      return 'Phòng nghiên cứu khoa học';
    case BookingStatus.APPROVED_BY_RECTOR:
      return 'Hoàn thành';
    case BookingStatus.REJECTED:
      return 'Đã từ chối';
    default:
      return null;
  }
};
