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
  Appointment,
  ServiceCenter,
  Vehicle,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentById
} from "@/services/appointmentService";
import DatePicker from "../form/date-picker";
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
    appointment: Appointment;
  };
}

interface BookingProps {
  onRefresh: () => void;
  appointments: Appointment[];
  serviceCenters: ServiceCenter[];
  vehicles: Vehicle[];
}

const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
} as const;

const TIME_SLOTS = [
  { value: '08:00-10:00', label: '08:00 - 10:00' },
  { value: '10:00-12:00', label: '10:00 - 12:00' },
  { value: '13:00-15:00', label: '13:00 - 15:00' },
  { value: '15:00-17:00', label: '15:00 - 17:00' },
  { value: '17:00-19:00', label: '17:00 - 19:00' }
];

const getAppointmentStatusColor = (status: string) => {
  switch (status) {
    case APPOINTMENT_STATUS.PENDING: return 'warning';
    case APPOINTMENT_STATUS.CONFIRMED: return 'success';
    case APPOINTMENT_STATUS.CANCELLED: return 'danger';
    default: return 'info';
  }
};

const getAppointmentStatusText = (status: string) => {
  switch (status) {
    case APPOINTMENT_STATUS.PENDING: return 'Chờ xác nhận';
    case APPOINTMENT_STATUS.CONFIRMED: return 'Đã xác nhận';
    case APPOINTMENT_STATUS.CANCELLED: return 'Đã hủy';
    default: return 'Không xác định';
  }
};

const mapAppointmentToEvent = (appointment: Appointment): CalendarEvent => ({
  id: appointment.id.toString(),
  title: `${appointment.serviceCenter?.name || "Trung tâm dịch vụ"} - ${appointment.vehicle?.make || "Xe"} ${appointment.vehicle?.model || ""}`,
  start: moment(appointment.date).format("YYYY-MM-DD"),
  allDay: false,
  extendedProps: {
    calendar: getAppointmentStatusColor(appointment.status),
    appointment: appointment
  }
});

const renderEventContent = (eventInfo: EventContentArg) => {
  const appointment = eventInfo.event.extendedProps.appointment as Appointment;
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  const statusText = getAppointmentStatusText(appointment.status);
  const statusColor = getAppointmentStatusColor(appointment.status);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'warning': return '⏳';
      case 'success': return '✅';
      case 'danger': return '❌';
      default: return '🔧';
    }
  };

  // Màu text cho từng trạng thái
  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'warning': return 'text-yellow-800 dark:text-yellow-200';
      case 'success': return 'text-green-800 dark:text-green-200';
      case 'danger': return 'text-red-800 dark:text-red-200';
      default: return 'text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div
      className={`mb-4 event-fc-color fc-event-main ${colorClass} p-2 rounded-md shadow-sm border-l-4 border-${statusColor}-500 hover:shadow-md transition-shadow duration-200 cursor-pointer`}
    >
      <div className="flex flex-col space-y-2 mt-2">
        {/* Header với thời gian và trạng thái */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-gray-800 dark:text-white bg-gray-200 dark:bg-white/20 py-1 px-2 rounded">
            🕐 {appointment.timeSlot}
          </div>
          <div className={`inline-flex items-center py-1 rounded-full text-xs font-medium bg-${statusColor}-100 dark:bg-${statusColor}-900 ${getStatusTextColor(statusColor)}`}>
            <span className="mr-1">{getStatusIcon(statusColor)}</span>
            <span className="hidden sm:inline">{statusText}</span>
            <span className="sm:hidden">{statusText.split(' ')[0]}</span>
          </div>
        </div>

        {/* Tên trung tâm dịch vụ */}
        <div className="text-sm font-semibold text-gray-800 dark:text-white truncate leading-tight">
          🏢 {appointment.serviceCenter?.name || "Trung tâm dịch vụ"}
        </div>

        {/* Thông tin xe */}
        <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
          🚗 {appointment.vehicle ? `${appointment.vehicle.make} ${appointment.vehicle.model}` : "Chưa chọn xe"}
        </div>

        {/* Ghi chú */}
        {appointment.notes && (
          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
            📝 {appointment.notes}
          </div>
        )}
      </div>
    </div>
  );
};

export default function BookingDataTable({ onRefresh, appointments, serviceCenters, vehicles }: BookingProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentDto | UpdateAppointmentDto>({
    userId: 0,
    serviceCenterId: 0,
    vehicleId: 0,
    date: "",
    timeSlot: "",
    notes: ""
  });
  const { isOpen, openModal, closeModal } = useModal();
  const [events, setEvents] = useState<CalendarEvent[]>(appointments.map(mapAppointmentToEvent));
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const roles = getRolesObject(parsed.userRoles || []);
      setCurrentUserId(parsed.id);
    }
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAppointment(null);
      setFormData({
        userId: currentUserId || 0,
        serviceCenterId: 0,
        vehicleId: 0,
        date: "",
        timeSlot: "",
        notes: ""
      });
    }
  }, [isOpen, currentUserId]);

  // Update form data when selected Appointment changes
  useEffect(() => {
    if (selectedAppointment) {
      setFormData({
        serviceCenterId: selectedAppointment.serviceCenterId,
        vehicleId: selectedAppointment.vehicleId || 0,
        date: selectedAppointment.date,
        timeSlot: selectedAppointment.timeSlot,
        notes: selectedAppointment.notes || ""
      });
    }
  }, [selectedAppointment]);

  // Update events when appointments change
  useEffect(() => {
    setEvents(appointments.map(mapAppointmentToEvent));
  }, [appointments]);



  const handleSelectServiceCenterChange = (value: string) => {
    const serviceCenterId = parseInt(value);
    setFormData({ ...formData, serviceCenterId });
  };

  const handleSelectVehicleChange = (value: string) => {
    const vehicleId = parseInt(value);
    setFormData({ ...formData, vehicleId });
  };

  const handleSelectTimeSlotChange = (value: string) => {
    setFormData({ ...formData, timeSlot: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedAppointment?.id) {
        await updateAppointment(selectedAppointment.id, formData as UpdateAppointmentDto);
        toast.success("Cập nhật lịch hẹn thành công");
      } else {
        // Tự động set userId là ID của user hiện tại
        const submitData = {
          ...formData,
          userId: currentUserId || 0
        } as CreateAppointmentDto;
        await createAppointment(submitData);
        toast.success("Đặt lịch hẹn thành công");
      }
      closeModal();
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, selectedAppointment?.id ? "Không thể cập nhật lịch hẹn" : "Không thể đặt lịch hẹn"));
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa lịch hẹn này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteAppointment(id);
      toast.success("Xóa lịch hẹn thành công");
      closeModal();
      onRefresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa lịch hẹn"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const calendarRef = useRef<FullCalendar>(null);

  const handleEventClick = async (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const appointmentId = parseInt(event.id);

    try {
      const appointment = await getAppointmentById(appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
        setFormData({
          serviceCenterId: appointment.serviceCenterId,
          vehicleId: appointment.vehicleId || 0,
          date: appointment.date,
          timeSlot: appointment.timeSlot,
          notes: appointment.notes || ""
        });
        openModal();
      }
    } catch (error) {
      console.log("error", error);
      toast.error(getErrorMessage(error, "Không thể lấy thông tin lịch hẹn"));
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
          customButtons={{
            addEventButton: {
              text: "Đặt lịch hẹn +",
              click: openModal,
            },
          }}
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
                  {selectedAppointment ? "Chi tiết lịch hẹn" : "Đặt lịch hẹn"}
                </h5>
                <p className="text-blue-100 text-sm">
                  {selectedAppointment
                    ? "Xem và quản lý thông tin lịch hẹn bảo dưỡng/sửa chữa"
                    : "Đặt lịch hẹn bảo dưỡng/sửa chữa xe điện"
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
              {/* Ngày hẹn - Highlight */}
              <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${selectedAppointment && selectedAppointment.status !== APPOINTMENT_STATUS.PENDING
                  ? 'opacity-60 pointer-events-none'
                  : ''
                }`}>
                <div className="flex items-center mb-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
                  <h6 className="text-lg font-semibold text-gray-800 dark:text-white">Ngày hẹn</h6>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Bắt buộc
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <DatePicker
                    id="date-picker"
                    placeholder="Chọn ngày hẹn"
                    enableTime={false}
                    onChange={(dates, currentDateString) => {
                      console.log({ dates, currentDateString });
                      if (dates && dates[0]) {
                        const date = dates[0];
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const formattedDate = `${year}-${month}-${day}`;
                        setFormData(prev => ({
                          ...prev,
                          date: formattedDate
                        }));
                      }
                    }}
                    defaultDate={formData.date ? moment(formData.date).format("YYYY-MM-DD") : undefined}
                  />
                </div>
                {formData.date && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <span className="font-medium">Ngày đã chọn:</span> {moment(formData.date).format("DD/MM/YYYY")}
                    </div>
                  </div>
                )}
              </div>

              {/* Chọn trung tâm dịch vụ */}
              <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${selectedAppointment && selectedAppointment.status !== APPOINTMENT_STATUS.PENDING
                  ? 'opacity-60 pointer-events-none'
                  : ''
                }`}>
                <div className="flex items-center mb-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-3"></div>
                  <h6 className="text-lg font-semibold text-gray-800 dark:text-white">Trung tâm dịch vụ</h6>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Bắt buộc
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Select
                    value={formData.serviceCenterId?.toString() || "-"}
                    onChange={handleSelectServiceCenterChange}
                    disabled={Boolean(selectedAppointment && selectedAppointment.status !== APPOINTMENT_STATUS.PENDING)}
                    options={[
                      {
                        value: "-",
                        label: "Chọn trung tâm dịch vụ",
                      },
                      ...serviceCenters.map((center) => ({
                        value: center.id.toString(),
                        label: center.name,
                      })),
                    ]}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
                {formData.serviceCenterId && formData.serviceCenterId !== 0 && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-sm text-green-800 dark:text-green-200">
                      <span className="font-medium">Trung tâm đã chọn:</span> {serviceCenters.find(c => Number(c.id) === Number(formData.serviceCenterId))?.name}
                    </div>
                  </div>
                )}
              </div>

              {/* Chọn xe */}
              <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${selectedAppointment && selectedAppointment.status !== APPOINTMENT_STATUS.PENDING
                  ? 'opacity-60 pointer-events-none'
                  : ''
                }`}>
                <div className="flex items-center mb-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-3"></div>
                  <h6 className="text-lg font-semibold text-gray-800 dark:text-white">Xe cần bảo dưỡng</h6>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                      Tùy chọn
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Select
                    value={formData.vehicleId?.toString() || "-"}
                    onChange={handleSelectVehicleChange}
                    disabled={Boolean(selectedAppointment && selectedAppointment.status !== APPOINTMENT_STATUS.PENDING)}
                    options={[
                      {
                        value: "-",
                        label: "Chọn xe",
                      },
                      ...vehicles.map((vehicle) => ({
                        value: vehicle.id.toString(),
                        label: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
                      })),
                    ]}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
                {formData.vehicleId && formData.vehicleId !== 0 && (
                  <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="text-sm text-orange-800 dark:text-orange-200">
                      <span className="font-medium">Xe đã chọn:</span> {vehicles.find(v => Number(v.id) === Number(formData.vehicleId))?.make} {vehicles.find(v => Number(v.id) === Number(formData.vehicleId))?.model}
                    </div>
                  </div>
                )}
              </div>

              {/* Chọn khung giờ */}
              <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${selectedAppointment && selectedAppointment.status !== APPOINTMENT_STATUS.PENDING
                  ? 'opacity-60 pointer-events-none'
                  : ''
                }`}>
                <div className="flex items-center mb-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
                  <h6 className="text-lg font-semibold text-gray-800 dark:text-white">Khung giờ</h6>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Bắt buộc
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Select
                    value={formData.timeSlot || "-"}
                    onChange={handleSelectTimeSlotChange}
                    disabled={Boolean(selectedAppointment && selectedAppointment.status !== APPOINTMENT_STATUS.PENDING)}
                    options={[
                      {
                        value: "-",
                        label: "Chọn khung giờ",
                      },
                      ...TIME_SLOTS.map((slot) => ({
                        value: slot.value,
                        label: slot.label,
                      })),
                    ]}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
                {formData.timeSlot && formData.timeSlot !== "" && (
                  <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="text-sm text-purple-800 dark:text-purple-200">
                      <span className="font-medium">Khung giờ đã chọn:</span> {TIME_SLOTS.find(s => s.value === formData.timeSlot)?.label}
                    </div>
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${selectedAppointment && selectedAppointment.status !== APPOINTMENT_STATUS.PENDING
                  ? 'opacity-60 pointer-events-none'
                  : ''
                }`}>
                <div className="flex items-center mb-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full mr-3"></div>
                  <h6 className="text-lg font-semibold text-gray-800 dark:text-white">Ghi chú</h6>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                      Tùy chọn
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mô tả vấn đề hoặc yêu cầu đặc biệt
                  </label>
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ví dụ: Xe có tiếng động lạ, cần kiểm tra pin, thay lốp..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 resize-none"
                    rows={4}
                    maxLength={500}
                    disabled={Boolean(selectedAppointment && selectedAppointment.status !== APPOINTMENT_STATUS.PENDING)}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Tối đa 500 ký tự
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(formData.notes || "").length}/500 ký tự
                    </div>
                  </div>
                </div>
                {formData.notes && (
                  <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div className="text-sm text-indigo-800 dark:text-indigo-200">
                      <span className="font-medium">Ghi chú đã nhập:</span> {formData.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Thông báo không thể chỉnh sửa */}
            {selectedAppointment && selectedAppointment.status !== APPOINTMENT_STATUS.PENDING && (
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
                        Bạn chỉ có thể chỉnh sửa lịch hẹn khi trạng thái là &quot;Chờ xác nhận&quot;.
                        Lịch hẹn hiện tại đã được xử lý và không thể thay đổi.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Thông tin chi tiết appointment */}
            {selectedAppointment && (
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
                        {getAppointmentStatusText(selectedAppointment.status)}
                      </div>
                    </div>

                    {/* Trung tâm dịch vụ */}
                    {selectedAppointment.serviceCenter && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Trung tâm dịch vụ</div>
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          {selectedAppointment.serviceCenter.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {selectedAppointment.serviceCenter.address}
                        </div>
                      </div>
                    )}

                    {/* Xe */}
                    {selectedAppointment.vehicle && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Xe</div>
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          {selectedAppointment.vehicle.make} {selectedAppointment.vehicle.model}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Biển số: {selectedAppointment.vehicle.licensePlate}
                        </div>
                      </div>
                    )}

                    {/* Khung giờ */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Khung giờ</div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {selectedAppointment.timeSlot}
                      </div>
                    </div>

                    {/* Ghi chú */}
                    {selectedAppointment.notes && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 md:col-span-2">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Ghi chú</div>
                        <div className="text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                          {selectedAppointment.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedAppointment ? "Quản lý lịch hẹn" : "Đặt lịch hẹn mới"}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  type="button"
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Đóng
                </button>


                {/* Nút chỉnh sửa và xóa */}
                {selectedAppointment && selectedAppointment.id && (
                  <>
                    <button
                      onClick={() => handleDelete(selectedAppointment.id)}
                      type="button"
                      disabled={isSubmitting}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={handleSubmit}
                      type="button"
                      disabled={isSubmitting || selectedAppointment.status !== APPOINTMENT_STATUS.PENDING}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Đang xử lý..." : "Cập nhật"}
                    </button>
                  </>
                )}

                {/* Nút tạo mới */}
                {!selectedAppointment && (
                  <button
                    onClick={handleSubmit}
                    type="button"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isSubmitting ? "Đang xử lý..." : "Đặt lịch hẹn"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
}

