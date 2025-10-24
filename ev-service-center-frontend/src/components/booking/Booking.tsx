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
import { CreateAppointmentDto, UpdateAppointmentDto, createAppointment, updateAppointment, deleteAppointment, getAppointmentById, Appointment, ServiceCenter } from "@/services/appointmentService";
import { ChevronDownIcon } from "@/icons";
import DatePicker from "../form/date-picker";
import { User } from "@/types/common";
import { Vehicle, getVehiclesByUserId } from "@/services/vehicleService";
import { getAllServiceCenters } from "@/services/appointmentService";
import moment from "moment";
import axios from "axios";
import { UserRole } from "@/constants/user.constant";
import { useSearchParams } from 'next/navigation';

interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  extendedProps: {
    calendar: string;
  };
}

const mapAppointmentToEvent = (appointment: Appointment): CalendarEvent => ({
  id: appointment.id.toString(),
  title: appointment.vehicle?.licensePlate || "No vehicle",
  start: moment(appointment.date).format("YYYY-MM-DD"),
  extendedProps: {
    calendar: getAppointmentStatusColor(appointment.status || "")
  }
});

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

interface BookingProps {
  onRefresh: () => void;
  appointments: Appointment[];
  users: User[];
  vehicles: Vehicle[];
  serviceCenters: ServiceCenter[];
}

const getAppointmentStatusColor = (status: string): string => {
  const statusColorMap: Record<string, string> = {
    'pending': "Warning",
    'confirmed': "Success",
    'cancelled': "Danger"
  };

  return statusColorMap[status] || "Primary";
};

export default function BookingDataTable({ onRefresh, appointments, users, vehicles: initialVehicles, serviceCenters }: BookingProps) {
  const searchParams = useSearchParams();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentDto>({
    createdById: 0,
    serviceCenterId: 0,
    vehicleId: 0,
    date: "",
    timeSlot: "",
    status: 'pending',
    notes: ""
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const { isOpen, openModal, closeModal } = useModal();
  const [events, setEvents] = useState<CalendarEvent[]>(appointments.map(mapAppointmentToEvent));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === UserRole.User) {
        setFormData(prev => ({
          ...prev,
          createdById: parsedUser.id
        }));
      }
    }
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAppointment(null);
      setFormData({
        createdById: user?.id || 0,
        serviceCenterId: 0,
        vehicleId: 0,
        date: "",
        timeSlot: "",
        status: 'pending',
        notes: ""
      });
      setVehicles(initialVehicles);
    }
  }, [isOpen, initialVehicles, user]);

  // Update events when appointments change
  useEffect(() => {
    setEvents(appointments.map(mapAppointmentToEvent));
  }, [appointments]);

  const handleSelectUserChange = async (value: string) => {
    const userId = parseInt(value);
    setFormData({ ...formData, createdById: userId, vehicleId: 0 });

    try {
      const userVehicles = await getVehiclesByUserId(userId);
      setVehicles([
        {
          id: 0,
          licensePlate: "Select vehicle",
          brand: "",
          model: "",
          year: 0,
          userId: 0
        },
        ...userVehicles,
      ]);
    } catch (error) {
      console.log("error", error);
      alert("Cannot fetch vehicles");
      setVehicles([]);
    }
  };

  const handleSelectVehicleChange = (value: string) => {
    setFormData({ ...formData, vehicleId: parseInt(value) });
  };

  const handleSelectStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as 'pending' | 'confirmed' | 'cancelled' });
  };

  const handleSelectServiceCenterChange = (value: string) => {
    setFormData({ ...formData, serviceCenterId: parseInt(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedAppointment?.id) {
        await updateAppointment(selectedAppointment.id, formData as UpdateAppointmentDto);
        alert("Appointment updated successfully");
      } else {
        await createAppointment(formData as CreateAppointmentDto);
        alert("Appointment created successfully");
      }
      closeModal();
      onRefresh();
    } catch {
      alert(selectedAppointment?.id ? "Cannot update appointment" : "Cannot create appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Are you sure you want to delete this appointment?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteAppointment(id);
      alert("Appointment deleted successfully");
      closeModal();
      onRefresh();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const serverError = error.response.data;
        alert(serverError.message || "Cannot delete appointment");
      } else {
        alert("Cannot delete appointment");
      }
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
          createdById: appointment.createdById,
          serviceCenterId: appointment.serviceCenterId,
          vehicleId: appointment.vehicleId || 0,
          date: moment(appointment.date).format("YYYY-MM-DD"),
          timeSlot: appointment.timeSlot,
          status: appointment.status,
          notes: appointment.notes || ""
        });
        openModal();
      }
    } catch (error) {
      console.log("error", error);
      alert("Cannot fetch appointment details");
    }
  };

  return (
    <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
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
          customButtons={{
            addEventButton: {
              text: "Đặt chỗ +",
              click: openModal,
            },
          }}
        />
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedAppointment ? "Appointment Details" : "Create Appointment"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
            Đặt lịch bảo dưỡng ngay hôm nay để trải nghiệm dịch vụ hoàn hảo nhất từ chúng tôi!
            </p>
          </div>
          <div className="mt-8">
            <div className="mt-1">
              <div className="relative">
                <DatePicker
                  id="date-picker"
                  placeholder="Select appointment date"
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
                  defaultDate={moment(formData.date).format("YYYY-MM-DD")}
                />
              </div>
            </div>
            <div className="mb-8 mt-12">
              <div className="relative">
                <Select
                  value={formData.createdById?.toString() || "0"}
                  onChange={handleSelectUserChange}
                  options={[
                    {
                      value: "0",
                      label: "Select user",
                    },
                    ...(user?.role === UserRole.User
                      ? users
                        .filter(u => u.id === user?.id)
                        .map(u => ({
                          value: u.id.toString(),
                          label: String(u.name || u.username || `User ${u.id}`),
                        }))
                      : users
                        .filter(u => u.role === UserRole.User)
                        .map(u => ({
                          value: u.id.toString(),
                          label: String(u.name || u.username || `User ${u.id}`),
                        })))
                  ]}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div className="mb-8">
              <div className="relative">
                <Select
                  value={formData.vehicleId?.toString() || ""}
                  options={vehicles.map((vehicle) => ({
                    value: vehicle.id.toString(),
                    label: vehicle.licensePlate,
                  }))}
                  onChange={handleSelectVehicleChange}
                  className="dark:bg-dark-900"
                  disabled={!formData.createdById}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div className="mb-8">
              <div className="relative">
                <Select
                  value={formData.serviceCenterId?.toString() || ""}
                  options={[
                    {
                      value: "0",
                      label: "Select service center",
                    },
                    ...serviceCenters.map((center) => ({
                      value: center.id.toString(),
                      label: center.name,
                    })),
                  ]}
                  onChange={handleSelectServiceCenterChange}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            {
              user?.role === UserRole.Admin || user?.role === UserRole.Staff && (
                <div className="mb-8">
                  <div className="relative">
                    <Select
                      value={formData.status?.toString() || ""}
                      options={[
                        {
                          value: "",
                          label: "Status",
                        },
                        { value: "pending", label: "Pending" },
                        { value: "confirmed", label: "Confirmed" },
                        { value: "cancelled", label: "Cancelled" }
                      ]}
                      onChange={handleSelectStatusChange}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
              )
            }
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Time slot (e.g., 09:00-10:00)"
                  value={formData.timeSlot || ""}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-900 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
            <div className="mb-8">
              <div className="relative">
                <textarea
                  placeholder="Notes (optional)"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-900 dark:text-white dark:border-gray-600"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Close
            </button>

            {selectedAppointment && selectedAppointment.id ? (
              <>
                <button
                  onClick={() => handleDelete(selectedAppointment.id)}
                  type="button"
                  disabled={isSubmitting}
                  className="btn btn-danger btn-delete-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
                >
                  Delete
                </button>
                <button
                  onClick={handleSubmit}
                  type="button"
                  disabled={isSubmitting}
                  className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  {isSubmitting ? "Updating..." : "Update"}
                </button>
              </>
            ) : (
              <button
                onClick={handleSubmit}
                type="button"
                disabled={isSubmitting}
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {isSubmitting ? "Creating..." : "Create Appointment"}
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}