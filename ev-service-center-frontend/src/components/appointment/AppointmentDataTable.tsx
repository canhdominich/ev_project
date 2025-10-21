/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { BasicTableProps } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import Select from "../form/Select";
import { AppointmentStatus, AppointmentStatusOptions, TimeSlotOptions, getStatusColor, getStatusLabel } from "@/constants/appointment.constant";
import { ChevronDownIcon } from "@/icons";
import { CreateAppointmentRequest, deleteAppointment, updateAppointment, Appointment, createAppointment, getAllServiceCenters, ServiceCenter } from "@/services/appointmentService";
import toast from "react-hot-toast";

interface AppointmentDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: Appointment[];
}

export default function AppointmentDataTable({ headers, items, onRefresh }: AppointmentDataTableProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    userId: 1, // Default user ID
    serviceCenterId: 1,
    vehicleId: undefined,
    date: "",
    timeSlot: "08:00",
    status: AppointmentStatus.Pending,
    notes: "",
  });
  const { isOpen, openModal, closeModal } = useModal();

  // Load service centers
  useEffect(() => {
    const loadServiceCenters = async () => {
      try {
        const data = await getAllServiceCenters();
        setServiceCenters(data);
      } catch (error) {
        toast.error("Không thể tải danh sách trung tâm dịch vụ");
      }
    };
    loadServiceCenters();
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAppointment(null);
      setFormData({
        userId: 1,
        serviceCenterId: serviceCenters[0]?.id || 1,
        vehicleId: undefined,
        date: "",
        timeSlot: "08:00",
        status: AppointmentStatus.Pending,
        notes: "",
      });
    }
  }, [isOpen, serviceCenters]);

  // Update form data when selected appointment changes
  useEffect(() => {
    if (selectedAppointment) {
      setFormData({
        userId: selectedAppointment.userId,
        serviceCenterId: selectedAppointment.serviceCenterId,
        vehicleId: selectedAppointment.vehicleId,
        date: selectedAppointment.date.split('T')[0], // Extract date part
        timeSlot: selectedAppointment.timeSlot,
        status: selectedAppointment.status as AppointmentStatus,
        notes: selectedAppointment.notes || "",
      });
    }
  }, [selectedAppointment]);

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as AppointmentStatus });
  };

  const handleTimeSlotChange = (value: string) => {
    setFormData({ ...formData, timeSlot: value });
  };

  const handleServiceCenterChange = (value: string) => {
    setFormData({ ...formData, serviceCenterId: parseInt(value) });
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedAppointment?.id) {
        await updateAppointment(selectedAppointment.id, formData);
        toast.success("Cập nhật lịch hẹn thành công");
      } else {
        await createAppointment(formData);
        toast.success("Thêm lịch hẹn thành công");
      }
      closeModal();
      onRefresh();
    } catch {
      toast.error(selectedAppointment?.id ? "Không thể cập nhật lịch hẹn" : "Không thể thêm lịch hẹn");
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
      onRefresh();
    } catch {
      toast.error("Không thể xóa lịch hẹn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string, timeSlot: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('vi-VN')} - ${timeSlot}`;
  };

  const serviceCenterOptions = serviceCenters.map(sc => ({
    value: sc.id.toString(),
    label: sc.name
  }));

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="mb-6 px-5 flex items-start gap-3 modal-footer sm:justify-start">
        <button
          onClick={openModal}
          type="button"
          className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
        >
          Thêm lịch hẹn
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1200px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell
                    key={header.key}
                    isHeader
                    className={index === 0 || index === headers.length - 1 ? "px-5 py-3 font-medium text-start text-theme-sm dark:text-gray-400" : "px-5 py-3 font-medium text-center text-theme-sm dark:text-gray-400"}
                  >
                    {header.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {items.map((item: Appointment) => (
                <TableRow key={item.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-center">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
                          User #{item.userId}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.serviceCenter?.name || `Service Center #${item.serviceCenterId}`}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.vehicleId ? `Vehicle #${item.vehicleId}` : "Không có"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {formatDateTime(item.date, item.timeSlot)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={getStatusColor(item.status as AppointmentStatus)}
                    >
                      {getStatusLabel(item.status as AppointmentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.notes || "Không có ghi chú"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    <div className="flex items-end gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                      >
                        Cập nhật
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-error btn-delete-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
                      >
                        Xóa
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  {selectedAppointment ? "Chỉnh sửa lịch hẹn" : "Thêm lịch hẹn"}
            </h5>
          </div>
          <div className="mt-8">
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Trung tâm dịch vụ
                  </label>
                  <div className="relative">
                    <Select
                      value={formData.serviceCenterId.toString()}
                      options={serviceCenterOptions}
                      placeholder="Chọn trung tâm dịch vụ"
                      onChange={handleServiceCenterChange}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    ID Phương tiện (tùy chọn)
                  </label>
                  <input
                    id="vehicle-id"
                    type="number"
                    value={formData.vehicleId || ""}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập ID phương tiện"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Ngày hẹn
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Khung giờ
                  </label>
                  <div className="relative">
                    <Select
                      value={formData.timeSlot}
                      options={TimeSlotOptions}
                      placeholder="Chọn khung giờ"
                      onChange={handleTimeSlotChange}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Trạng thái
                  </label>
                  <div className="relative">
                    <Select
                      value={formData.status}
                      options={AppointmentStatusOptions}
                      placeholder="Chọn trạng thái"
                      onChange={handleStatusChange}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Ghi chú
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    rows={3}
                    placeholder="Nhập ghi chú..."
                  />
                </div>
              </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
                  Đóng
            </button>
            <button
                  onClick={handleSubmit}
              type="button"
                  disabled={isSubmitting}
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
                  {isSubmitting ? "Đang xử lý..." : selectedAppointment ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>
      </Modal>
        </div>
      </div>
    </div>
  );
}
