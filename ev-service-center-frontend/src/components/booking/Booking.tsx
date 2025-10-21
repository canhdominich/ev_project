"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Select from "../form/Select";
import { 
  CreateBookingDto, 
  UpdateBookingDto, 
  createBooking, 
  updateBooking, 
  deleteBooking, 
  getBookingById,
  Booking,
  BookingStatus,
  approveByLecturer,
  approveByFacultyDean,
  approveByRector
} from "@/services/bookingService";
import { ProjectEntity } from "@/services/projectService";
import DatePicker from "../form/date-picker";
import { UserRole } from "@/constants/user.constant";
import { 
  getBookingStatusColor, 
  getBookingStatusText, 
  canApproveBooking,
  getNextApprovalStep
} from "@/constants/booking.constant";
import moment from "moment";
import { getRolesObject } from "@/utils/user.utils";
import { ChevronDownIcon } from "@/icons";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";

interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  extendedProps: {
    calendar: string;
    booking: Booking;
  };
}

const mapBookingToEvent = (booking: Booking): CalendarEvent => ({
  id: booking.id.toString(),
  title: `${booking.project?.title || "Không có tên đề tài"} - ${booking.student?.name || "N/A"}`,
  start: moment(booking.time).format("YYYY-MM-DD"),
  allDay: false,
  extendedProps: {
    calendar: getBookingStatusColor(booking.status),
    booking: booking
  }
});

const renderEventContent = (eventInfo: EventContentArg) => {
  const booking = eventInfo.event.extendedProps.booking as Booking;
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  const statusText = getBookingStatusText(booking.status);
  const statusColor = getBookingStatusColor(booking.status);
  
  // Icon cho từng trạng thái
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'warning': return '⏳';
      case 'info': return '👨‍🏫';
      case 'primary': return '👨‍💼';
      case 'success': return '✅';
      case 'danger': return '❌';
      default: return '📋';
    }
  };

  // Màu text cho từng trạng thái
  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'warning': return 'text-yellow-800 dark:text-yellow-200';
      case 'info': return 'text-blue-800 dark:text-blue-200';
      case 'primary': return 'text-green-800 dark:text-green-200';
      case 'success': return 'text-green-800 dark:text-green-200';
      case 'danger': return 'text-red-800 dark:text-red-200';
      default: return 'text-gray-800 dark:text-gray-200';
    }
  };
  
  return (
    <div
      className={`mb-4 event-fc-color fc-event-main ${colorClass} p-2 rounded-md shadow-sm border-l-4 border-${statusColor}-500 hover:shadow-md transition-shadow duration-200 cursor-pointer`}
    >
      <div className="flex flex-col space-y-4 mt-2">
        {/* Header với thời gian và trạng thái */}
        <div className="flex items-center justify-between">
          {/* <div className="text-xs font-bold text-gray-800 dark:text-white bg-gray-200 dark:bg-white/20 py-1 px-2 rounded">
            🕐 {moment(booking.time).format("HH:mm")}
          </div> */}
          <div className={`inline-flex items-center py-1 rounded-full text-xs font-medium bg-${statusColor}-100 dark:bg-${statusColor}-900 ${getStatusTextColor(statusColor)}`}>
            <span className="mr-1">{getStatusIcon(statusColor)}</span>
            <span className="hidden sm:inline">{statusText}</span>
            <span className="sm:hidden">{statusText.split(' ')[0]}</span>
          </div>
        </div>
        
        {/* Tên đề tài */}
        <div className="text-sm font-semibold text-gray-800 dark:text-white truncate leading-tight">
          📋 {booking.project?.title || "Không có tên đề tài"}
        </div>

        {/* Tên kế hoạch NCKH */}
        <div className="text-sm font-semibold text-gray-800 dark:text-white truncate leading-tight">
          📋 {booking.project?.term?.name || "Không có tên kế hoạch NCKH"}
        </div>
        
        {/* Tên sinh viên */}
        <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
          👤 {booking.student?.name || "N/A"}
        </div>
      </div>
    </div>
  );
};

interface BookingProps {
  onRefresh: () => void;
  bookings: Booking[];
  projects: ProjectEntity[];
}

export default function BookingDataTable({ onRefresh, bookings, projects }: BookingProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateBookingDto | UpdateBookingDto>({
    time: "",
    projectId: 0
  });
  const { isOpen, openModal, closeModal } = useModal();
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [pendingRejectionBookingId, setPendingRejectionBookingId] = useState<number | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(bookings.map(mapBookingToEvent));
  const [rolesObject, setRolesObject] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const roles = getRolesObject(parsed.userRoles || []);
      setRolesObject(roles);
      setCurrentUserId(parsed.id);
    }
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedBooking(null);
      setFormData({
        time: "",
        projectId: 0
      });
    }
  }, [isOpen]);

  // Update form data when selected Booking changes
  useEffect(() => {
    if (selectedBooking) {
      setFormData({
        time: selectedBooking.time,
        projectId: selectedBooking.projectId
      });
    }
  }, [selectedBooking]);

  // Update events when bookings change
  useEffect(() => {
    setEvents(bookings.map(mapBookingToEvent));
  }, [bookings]);



  const handleSelectProjectChange = (value: string) => {
    const projectId = parseInt(value);
    setFormData({ ...formData, projectId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedBooking?.id) {
        await updateBooking(selectedBooking.id, formData as UpdateBookingDto);
        toast.success("Cập nhật lịch bảo vệ thành công");
      } else {
        // Tự động set studentId là ID của user hiện tại
        const submitData = {
          ...formData,
          studentId: currentUserId || 0
        } as CreateBookingDto;
        await createBooking(submitData);
        toast.success("Đăng ký lịch bảo vệ thành công");
      }
      closeModal();
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, selectedBooking?.id ? "Không thể cập nhật lịch bảo vệ" : "Không thể đăng ký lịch bảo vệ"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (bookingId: number, status: BookingStatus.APPROVED_BY_LECTURER | BookingStatus.APPROVED_BY_FACULTY_DEAN | BookingStatus.APPROVED_BY_RECTOR | BookingStatus.REJECTED) => {
    if (isSubmitting) return;

    // Nếu từ chối, hiển thị popup để nhập lí do
    if (status === BookingStatus.REJECTED) {
      setPendingRejectionBookingId(bookingId);
      setRejectionNote("");
      setIsRejectionModalOpen(true);
      return;
    }

    try {
      setIsSubmitting(true);
            
      if (rolesObject[UserRole.Lecturer]) {
        await approveByLecturer(bookingId, { status: status as BookingStatus.APPROVED_BY_LECTURER | BookingStatus.REJECTED });
      } else if (rolesObject[UserRole.FacultyDean]) {
        await approveByFacultyDean(bookingId, { status: status as BookingStatus.APPROVED_BY_FACULTY_DEAN | BookingStatus.REJECTED });
      } else if (rolesObject[UserRole.Rector]) {
        await approveByRector(bookingId, { status: status as BookingStatus.APPROVED_BY_RECTOR | BookingStatus.REJECTED });
      }
      
      toast.success("Duyệt lịch bảo vệ thành công");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Không thể duyệt lịch bảo vệ"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectWithNote = async () => {
    if (!pendingRejectionBookingId || !rejectionNote.trim()) {
      toast.error("Vui lòng nhập lí do từ chối");
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (rolesObject[UserRole.Lecturer]) {
        await approveByLecturer(pendingRejectionBookingId, { 
          status: BookingStatus.REJECTED,
          note: rejectionNote.trim()
        });
      } else if (rolesObject[UserRole.FacultyDean]) {
        await approveByFacultyDean(pendingRejectionBookingId, { 
          status: BookingStatus.REJECTED,
          note: rejectionNote.trim()
        });
      } else if (rolesObject[UserRole.Rector]) {
        await approveByRector(pendingRejectionBookingId, { 
          status: BookingStatus.REJECTED,
          note: rejectionNote.trim()
        });
      }
      
      toast.success("Từ chối lịch bảo vệ thành công");
      setIsRejectionModalOpen(false);
      setPendingRejectionBookingId(null);
      setRejectionNote("");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Không thể từ chối lịch bảo vệ"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa lịch bảo vệ này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteBooking(id);
      toast.success("Xóa lịch bảo vệ thành công");
      closeModal();
      onRefresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa lịch bảo vệ"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const calendarRef = useRef<FullCalendar>(null);

  const handleEventClick = async (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const bookingId = parseInt(event.id);

    try {
      const booking = await getBookingById(bookingId);
      if (booking) {
        setSelectedBooking(booking);
        setFormData({
          time: booking.time,
          projectId: booking.projectId
        });
        openModal();
      }
    } catch (error) {
      console.log("error", error);
      toast.error(getErrorMessage(error, "Không thể lấy thông tin lịch bảo vệ"));
    }
  };

  return (
    <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <style jsx>{`
        .fc-event-main {
          min-height: 70px;
          max-height: 120px;
          overflow: hidden;
          cursor: pointer;
        }
        .fc-event-main:hover {
          transform: translateY(-1px);
        }
        @media (max-width: 640px) {
          .fc-event-main {
            min-height: 50px;
            font-size: 0.75rem;
          }
        }
        .fc-event-main .bg-warning-100 {
          background-color: #fef3c7;
          color: #92400e;
        }
        .fc-event-main .bg-info-100 {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .fc-event-main .bg-primary-100 {
          background-color: #d1fae5;
          color: #065f46;
        }
        .fc-event-main .bg-success-100 {
          background-color: #dcfce7;
          color: #166534;
        }
        .fc-event-main .bg-danger-100 {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .fc-event-main .text-warning-800 {
          color: #92400e;
        }
        .fc-event-main .text-info-800 {
          color: #1e40af;
        }
        .fc-event-main .text-primary-800 {
          color: #065f46;
        }
        .fc-event-main .text-success-800 {
          color: #166534;
        }
        .fc-event-main .text-danger-800 {
          color: #991b1b;
        }
        /* Dark mode colors */
        .fc-event-main .dark\\:bg-warning-900 {
          background-color: #78350f;
        }
        .fc-event-main .dark\\:bg-info-900 {
          background-color: #1e3a8a;
        }
        .fc-event-main .dark\\:bg-primary-900 {
          background-color: #064e3b;
        }
        .fc-event-main .dark\\:bg-success-900 {
          background-color: #14532d;
        }
        .fc-event-main .dark\\:bg-danger-900 {
          background-color: #7f1d1d;
        }
        .fc-event-main .dark\\:text-warning-200 {
          color: #fde68a;
        }
        .fc-event-main .dark\\:text-info-200 {
          color: #93c5fd;
        }
        .fc-event-main .dark\\:text-primary-200 {
          color: #6ee7b7;
        }
        .fc-event-main .dark\\:text-success-200 {
          color: #86efac;
        }
        .fc-event-main .dark\\:text-danger-200 {
          color: #fca5a5;
        }
        .fc-event-main .bg-warning-500 {
          background-color: #f59e0b;
        }
        .fc-event-main .bg-info-500 {
          background-color: #3b82f6;
        }
        .fc-event-main .bg-primary-500 {
          background-color: #10b981;
        }
        .fc-event-main .bg-success-500 {
          background-color: #22c55e;
        }
        .fc-event-main .bg-danger-500 {
          background-color: #ef4444;
        }
        .border-warning-500 {
          border-color: #f59e0b;
        }
        .border-info-500 {
          border-color: #3b82f6;
        }
        .border-primary-500 {
          border-color: #10b981;
        }
        .border-success-500 {
          border-color: #22c55e;
        }
        .border-danger-500 {
          border-color: #ef4444;
        }
        .fc-event-main .bg-black\/20 {
          background-color: rgba(0, 0, 0, 0.2);
        }
        .fc-event-main .text-gray-800 {
          color: #1f2937;
        }
        .fc-event-main .text-gray-700 {
          color: #374151;
        }
        .fc-event-main .bg-gray-200 {
          background-color: #e5e7eb;
        }
        .fc-event-main .dark\\:text-white {
          color: #ffffff;
        }
        .fc-event-main .dark\\:text-gray-300 {
          color: #d1d5db;
        }
        /* Status text colors */
        .fc-event-main .text-yellow-800 {
          color: #92400e;
        }
        .fc-event-main .text-blue-800 {
          color: #1e40af;
        }
        .fc-event-main .text-green-800 {
          color: #166534;
        }
        .fc-event-main .text-red-800 {
          color: #991b1b;
        }
        .fc-event-main .dark\\:text-yellow-200 {
          color: #fde68a;
        }
        .fc-event-main .dark\\:text-blue-200 {
          color: #93c5fd;
        }
        .fc-event-main .dark\\:text-green-200 {
          color: #86efac;
        }
        .fc-event-main .dark\\:text-red-200 {
          color: #fca5a5;
        }
        .fc-event-main .dark\\:bg-white\/20 {
          background-color: rgba(255, 255, 255, 0.2);
        }
        .fc-event-main .transition-shadow {
          transition-property: box-shadow;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }
      `}</style>
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "",
          }}
          events={events}
          selectable={true}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          eventDisplay="block"
          eventTextColor="white"
          eventBorderColor="transparent"
          dayMaxEvents={2}
          moreLinkClick="popover"
          eventMaxStack={1}
          height="auto"
          eventMinHeight={60}
          eventOverlap={false}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          customButtons={rolesObject[UserRole.Student] ? {
            addEventButton: {
              text: "Đăng ký bảo vệ đề tài +",
              click: openModal,
            },
          } : {}}
        />
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[800px] p-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-2xl font-bold mb-2">
                  {selectedBooking ? "Chi tiết lịch bảo vệ" : "Đăng ký lịch bảo vệ"}
                </h5>
                <p className="text-blue-100 text-sm">
                  {selectedBooking 
                    ? "Xem và quản lý thông tin lịch bảo vệ đề tài" 
                    : "Đăng ký lịch bảo vệ đề tài và theo dõi quá trình duyệt"
                  }
                </p>
              </div>
              {/* <div className="text-right">
                {selectedBooking && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="text-xs text-blue-100 mb-1">Trạng thái</div>
                    <div className={`text-sm font-semibold px-2 py-1 rounded-full bg-${getBookingStatusColor(selectedBooking.status)}-100 text-${getBookingStatusColor(selectedBooking.status)}-800`}>
                      {getBookingStatusText(selectedBooking.status)}
                    </div>
                  </div>
                )}
              </div> */}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900">
            {/* Form Fields */}
            <div className="space-y-6">
              {/* Ngày và giờ bảo vệ - Highlight */}
              <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${
                selectedBooking && rolesObject[UserRole.Student] && selectedBooking.studentId === currentUserId && selectedBooking.status !== BookingStatus.PENDING 
                  ? 'opacity-60 pointer-events-none' 
                  : ''
              }`}>
                <div className="flex items-center mb-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
                  <h6 className="text-lg font-semibold text-gray-800 dark:text-white">Ngày bảo vệ</h6>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Bắt buộc
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <DatePicker
                    id="date-picker"
                    placeholder="Chọn ngày bảo vệ"
                    enableTime={false}
                    onChange={(dates, currentDateString) => {
                      console.log({ dates, currentDateString });
                      if (dates && dates[0]) {
                        const date = dates[0];
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        // Set default time to 09:00 AM
                        const formattedDate = `${year}-${month}-${day}T09:00:00.000Z`;
                        setFormData(prev => ({
                          ...prev,
                          time: formattedDate
                        }));
                      }
                    }}
                    defaultDate={formData.time ? moment(formData.time).format("YYYY-MM-DD") : undefined}
                  />
                </div>
                {formData.time && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <span className="font-medium">Ngày đã chọn:</span> {moment(formData.time).format("DD/MM/YYYY")}
                    </div>
                  </div>
                )}
              </div>

              {/* Chọn đề tài */}
              <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${
                selectedBooking && rolesObject[UserRole.Student] && selectedBooking.studentId === currentUserId && selectedBooking.status !== BookingStatus.PENDING 
                  ? 'opacity-60 pointer-events-none' 
                  : ''
              }`}>
                <div className="flex items-center mb-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-3"></div>
                  <h6 className="text-lg font-semibold text-gray-800 dark:text-white">Đề tài bảo vệ</h6>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Bắt buộc
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Select
                    value={formData.projectId?.toString() || "-"}
                    onChange={handleSelectProjectChange}
                    disabled={Boolean(selectedBooking && rolesObject[UserRole.Student] && selectedBooking.studentId === currentUserId && selectedBooking.status !== BookingStatus.PENDING)}
                    options={[
                      {
                        value: "-",
                        label: "Chọn đề tài",
                      },
                      ...projects.map((project) => ({
                        value: project.id.toString(),
                        label: project.title,
                      })),
                    ]}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
                {formData.projectId && formData.projectId !== 0 && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-sm text-green-800 dark:text-green-200">
                      <span className="font-medium">Đề tài đã chọn:</span> {projects.find(p => Number(p.id) === Number(formData.projectId))?.title}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Thông báo không thể chỉnh sửa cho sinh viên */}
            {selectedBooking && rolesObject[UserRole.Student] && selectedBooking.studentId === currentUserId && selectedBooking.status !== BookingStatus.PENDING && (
              <div className="mt-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Không thể chỉnh sửa
                      </h3>
                      <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                        Bạn chỉ có thể chỉnh sửa lịch bảo vệ khi trạng thái là &quot;Chờ duyệt&quot;. 
                        Lịch bảo vệ hiện tại đã được xử lý và không thể thay đổi.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Thông tin chi tiết booking */}
            {selectedBooking && (
              <div className="mt-6">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center mb-4">
                    <div className="w-2 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full mr-3"></div>
                    <h6 className="text-lg font-semibold text-gray-800 dark:text-white">Thông tin chi tiết</h6>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Trạng thái - Highlight */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Trạng thái hiện tại</div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {getBookingStatusText(selectedBooking.status)}
                      </div>
                    </div>

                    {/* Bước tiếp theo */}
                    {selectedBooking.status !== BookingStatus.REJECTED && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Bước tiếp theo</div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {getNextApprovalStep(selectedBooking.status)}
                        </div>
                      </div>
                    )}

                    {/* Đề tài */}
                    {selectedBooking.project && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Đề tài</div>
                        <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
                          {selectedBooking.project.title}
                        </div>
                      </div>
                    )}

                    {/* Sinh viên */}
                    {selectedBooking.student && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Sinh viên</div>
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          {selectedBooking.student.name}
                        </div>
                      </div>
                    )}

                    {/* Lí do từ chối */}
                    {selectedBooking.status === BookingStatus.REJECTED && selectedBooking.note && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-800 md:col-span-2">
                        <div className="text-xs font-medium text-red-500 dark:text-red-400 mb-2">Lí do từ chối</div>
                        <div className="text-sm text-gray-800 dark:text-white bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                          {selectedBooking.note}
                        </div>
                      </div>
                    )}

                    {/* Ngày tạo */}
                    {/* <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Ngày tạo</div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {moment(selectedBooking.createdAt).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </div> */}

                    {/* Cập nhật cuối */}
                    {/* <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Cập nhật cuối</div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {moment(selectedBooking.updatedAt).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedBooking ? "Quản lý lịch bảo vệ" : "Đăng ký lịch bảo vệ mới"}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  type="button"
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Đóng
                </button>

                {/* Nút duyệt cho các role khác nhau */}
                {selectedBooking && selectedBooking.id 
                && ((rolesObject[UserRole.Lecturer] && canApproveBooking(UserRole.Lecturer, selectedBooking.status)) 
                  || (rolesObject[UserRole.FacultyDean] && canApproveBooking(UserRole.FacultyDean, selectedBooking.status)) 
                  || (rolesObject[UserRole.Rector] && canApproveBooking(UserRole.Rector, selectedBooking.status))
                  || rolesObject[UserRole.Admin])
                && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedBooking.id, BookingStatus.REJECTED)}
                      type="button"
                      disabled={isSubmitting}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => {
                        let nextStatus: BookingStatus.APPROVED_BY_LECTURER | BookingStatus.APPROVED_BY_FACULTY_DEAN | BookingStatus.APPROVED_BY_RECTOR;
                        if (rolesObject[UserRole.Lecturer]) {
                          nextStatus = BookingStatus.APPROVED_BY_LECTURER;
                        } else if (rolesObject[UserRole.FacultyDean]) {
                          nextStatus = BookingStatus.APPROVED_BY_FACULTY_DEAN;
                        } else if (rolesObject[UserRole.Rector]) {
                          nextStatus = BookingStatus.APPROVED_BY_RECTOR;
                        } else {
                          return;
                        }
                        handleApprove(selectedBooking.id, nextStatus);
                      }}
                      type="button"
                      disabled={isSubmitting}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Duyệt
                    </button>
                  </>
                )}

                {/* Nút chỉnh sửa và xóa cho sinh viên hoặc admin */}
                {selectedBooking && selectedBooking.id && (
                  <>
                     {/* Sinh viên chỉ có thể cập nhật khi trạng thái là PENDING */}
                     {rolesObject[UserRole.Student] && selectedBooking.studentId === currentUserId && selectedBooking.status === BookingStatus.PENDING ? (
                  <>
                    <button
                      onClick={() => handleDelete(selectedBooking.id)}
                      type="button"
                      disabled={isSubmitting}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={handleSubmit}
                      type="button"
                      disabled={isSubmitting}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Đang xử lý..." : "Cập nhật"}
                    </button>
                  </>
                     ) : null}
                     
                     {/* Admin có thể cập nhật mọi lúc */}
                     {rolesObject[UserRole.Admin] ? (
                  <>
                    <button
                      onClick={() => handleDelete(selectedBooking.id)}
                      type="button"
                      disabled={isSubmitting}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={handleSubmit}
                      type="button"
                      disabled={isSubmitting}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Đang xử lý..." : "Cập nhật"}
                    </button>
                  </>
                     ) : null}
                  </>
                )}

                {/* Nút tạo mới cho sinh viên */}
                {!selectedBooking && rolesObject[UserRole.Student] && (
                  <button
                    onClick={handleSubmit}
                    type="button"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isSubmitting ? "Đang xử lý..." : "Đăng ký lịch bảo vệ"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal từ chối với lí do */}
      <Modal isOpen={isRejectionModalOpen} onClose={() => setIsRejectionModalOpen(false)} className="max-w-[600px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-2xl font-bold mb-2">
                  Từ chối lịch bảo vệ
                </h5>
                <p className="text-red-100 text-sm">
                  Nhập lí do từ chối để thông báo cho sinh viên
                </p>
              </div>
              <button
                onClick={() => setIsRejectionModalOpen(false)}
                className="text-red-200 hover:text-white transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-6">
              {/* Lí do từ chối */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-pink-500 rounded-full mr-3"></div>
                  <h6 className="text-lg font-semibold text-gray-800 dark:text-white">Lí do từ chối</h6>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Bắt buộc
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nhập lí do từ chối lịch bảo vệ
                  </label>
                  <textarea
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    placeholder="Ví dụ: Thời gian không phù hợp, đề tài chưa hoàn thiện, thiếu tài liệu..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 resize-none"
                    rows={5}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Tối đa 500 ký tự
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {rejectionNote.length}/500 ký tự
                    </div>
                  </div>
                </div>

                {rejectionNote && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <span className="font-medium">Lí do đã nhập:</span> {rejectionNote}
                    </div>
                  </div>
                )}
              </div>

              {/* Thông báo */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Lưu ý quan trọng
                    </h3>
                    <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                      Lí do từ chối sẽ được gửi đến sinh viên và không thể thay đổi sau khi xác nhận.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Xác nhận từ chối lịch bảo vệ
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRejectionModalOpen(false)}
                  type="button"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRejectWithNote}
                  type="button"
                  disabled={isSubmitting || !rejectionNote.trim()}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200"
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận từ chối"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

