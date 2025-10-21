# Component Booking - Hướng dẫn sử dụng

## Tổng quan
Component Booking đã được cập nhật để hiển thị dữ liệu booking từ API và cho phép chọn ngày để đặt lịch hẹn.

## Tính năng mới

### 1. Hiển thị dữ liệu booking từ API
- Component hiện tại có thể nhận dữ liệu booking thông qua prop `bookingData`
- Dữ liệu sẽ được chuyển đổi và hiển thị trên calendar
- Tương thích với cả dữ liệu appointments cũ và bookingData mới

### 2. Chọn ngày để đặt lịch
- **Click vào ngày**: Click vào bất kỳ ngày nào trên calendar để đặt lịch cho ngày đó
- **Nút "Đặt lịch hẹn +"**: Đặt lịch mà không chọn ngày cụ thể
- **Click vào lịch hẹn**: Xem chi tiết hoặc chỉnh sửa lịch hẹn có sẵn

### 3. Cải thiện giao diện
- Thêm hướng dẫn sử dụng cho người dùng
- Hiển thị thông tin ngày đã chọn chi tiết hơn
- Hỗ trợ nhiều view: tháng/tuần

## Cách sử dụng

### Props
```typescript
interface BookingProps {
  onRefresh: () => void;
  appointments: Appointment[];
  serviceCenters: ServiceCenter[];
  vehicles: Vehicle[];
  bookingData?: BookingResponse; // Mới - dữ liệu booking từ API
}
```

### Ví dụ sử dụng
```tsx
<BookingDataTable
  onRefresh={onRefresh}
  appointments={appointments}
  serviceCenters={serviceCenters}
  vehicles={vehicles}
  bookingData={bookingData} // Truyền dữ liệu booking từ API
/>
```

### Format dữ liệu bookingData
```typescript
interface BookingResponse {
  data: BookingData[];
  total: number;
}

interface BookingData {
  id: number;
  userId: number;
  serviceCenterId: number;
  vehicleId: number | null;
  date: string;
  timeSlot: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  ServiceCenter: {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

## Debug
- Component có console.log để debug khi chọn ngày
- Kiểm tra browser console để xem "Date selected:" khi click vào ngày

## Lưu ý
- Component tự động chuyển đổi dữ liệu booking thành format Appointment để tương thích
- Thông tin vehicle sẽ được cập nhật từ danh sách vehicles có sẵn
- Form sẽ được reset khi mở modal từ việc chọn ngày
