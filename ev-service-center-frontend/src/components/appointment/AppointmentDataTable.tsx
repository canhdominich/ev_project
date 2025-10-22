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
import { CreateAppointmentDto, deleteAppointment, updateAppointment, Appointment, createAppointment, getAllServiceCenters, ServiceCenter, getAppointmentsByUserId, getAppointmentById } from "@/services/appointmentService";
import { getAllVehicles, getVehiclesByUserId, Vehicle } from "@/services/vehicleService";
import { getRolesObject } from "@/utils/user.utils";
import { IUserRole } from "@/types/common";
import toast from "react-hot-toast";

interface AppointmentDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: Appointment[];
}

export default function AppointmentDataTable({ headers, items, onRefresh }: AppointmentDataTableProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<IUserRole[]>([]);
  const [filteredItems, setFilteredItems] = useState<Appointment[]>(items);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<CreateAppointmentDto>({
    createdById: 1, // Default user ID
    serviceCenterId: 1,
    vehicleId: undefined,
    date: "",
    timeSlot: "08:00",
    status: AppointmentStatus.Pending,
    notes: "",
  });
  const { isOpen, openModal, closeModal } = useModal();

  // Load user info
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setCurrentUserId(parsed.id);
      setUserRoles(parsed.userRoles || []);
      setFormData(prev => ({ ...prev, createdById: parsed.id }));
    }
  }, []);

  // Filter appointments based on user role
  useEffect(() => {
    const filterAppointments = async () => {
      if (!currentUserId || !userRoles.length) return;
      
      const roles = getRolesObject(userRoles);
      
      if (roles.user && !roles.admin && !roles.staff) {
        // Regular user can only see their own appointments
        try {
          const userAppointments = await getAppointmentsByUserId(currentUserId);
          setFilteredItems(userAppointments);
        } catch (error) {
          toast.error("Không thể tải lịch hẹn của bạn");
          setFilteredItems([]);
        }
      } else {
        // Admin/Staff can see all appointments
        setFilteredItems(items);
      }
    };

    filterAppointments();
  }, [currentUserId, userRoles, items]);

  // Load vehicles based on user role
  useEffect(() => {
    const loadVehicles = async () => {
      if (!currentUserId && userRoles.length === 0) return;
      
      setIsLoadingVehicles(true);
      try {
        const roles = getRolesObject(userRoles);
        let vehicleData: Vehicle[];
        
        if (roles && (roles.admin || roles.staff)) {
          // Admin/Staff can see all vehicles
          vehicleData = await getAllVehicles();
        } else if (currentUserId) {
          // Regular user can only see their own vehicles
          vehicleData = await getVehiclesByUserId(currentUserId);
        } else {
          vehicleData = [];
        }
        
        setVehicles(vehicleData);
      } catch (error) {
        console.error("Error loading vehicles:", error);
        toast.error("Không thể tải danh sách phương tiện");
        setVehicles([]);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    loadVehicles();
  }, [currentUserId, userRoles]);

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
        createdById: currentUserId || 1,
        serviceCenterId: serviceCenters[0]?.id || 1,
        vehicleId: undefined,
        date: "",
        timeSlot: "08:00",
        status: AppointmentStatus.Pending,
        notes: "",
      });
    }
  }, [isOpen, currentUserId, serviceCenters]);

  // Update form data when selected appointment changes
  useEffect(() => {
    if (selectedAppointment) {
      setFormData({
        createdById: selectedAppointment.createdById,
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

  const handleViewDetail = async (appointment: Appointment) => {
    try {
      const detailData = await getAppointmentById(appointment.id);
      setDetailAppointment(detailData);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error("Không thể tải thông tin chi tiết");
    }
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

  const roles = getRolesObject(userRoles);
  const canCreate = roles.admin || roles.staff;

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {canCreate && (
        <div className="mb-6 px-5 flex items-start gap-3 modal-footer sm:justify-start">
          <button
            onClick={openModal}
            type="button"
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            Thêm lịch hẹn
          </button>
        </div>
      )}
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
              {filteredItems.map((item: Appointment) => {
                const roles = getRolesObject(userRoles);
                const canEdit = roles.admin || roles.staff;
                const canDelete = roles.admin || roles.staff;
                
                return (
                <TableRow key={item.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-center">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
                          {item.user?.username || "Không có"}
                        </span>
                        <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
                          ({item.user?.email || "Không có email"})
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.serviceCenter?.name || `Service Center #${item.serviceCenterId}`}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.vehicleId ? (
                      (() => {
                        const vehicle = vehicles.find(v => Number(v.id) === Number(item.vehicleId));
                        return vehicle ? `${vehicle.brand || ""} ${vehicle.model || ""} (${vehicle.licensePlate || ""})` : `Vehicle #${item.vehicleId}`;
                      })()
                    ) : "Không có"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {formatDateTime(item.date, item.timeSlot)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={getStatusColor(item.status as AppointmentStatus) as any}
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
                        onClick={() => handleViewDetail(item)}
                        className="btn btn-info btn-view-detail flex w-full justify-center rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 sm:w-auto"
                      >
                        Xem chi tiết
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                          Cập nhật
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-error btn-delete-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
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
                    Phương tiện (tùy chọn)
                    {isLoadingVehicles && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        Đang tải...
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Select
                      value={formData.vehicleId?.toString() || "-"}
                      onChange={(value) => setFormData({ ...formData, vehicleId: value === "-" ? undefined : parseInt(value) })}
                      options={[
                        {
                          value: "-",
                          label: isLoadingVehicles ? "Đang tải phương tiện..." : "Chọn phương tiện",
                        },
                        ...vehicles.map((vehicle) => ({
                          value: vehicle.id.toString(),
                          label: `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`,
                        })),
                      ]}
                      className="dark:bg-dark-900"
                      disabled={isLoadingVehicles}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {formData.vehicleId && !isLoadingVehicles && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <span className="font-medium">Phương tiện đã chọn:</span> {vehicles.find(v => Number(v.id) === Number(formData.vehicleId))?.brand} {vehicles.find(v => Number(v.id) === Number(formData.vehicleId))?.model}
                      </div>
                    </div>
                  )}
                  {vehicles.length === 0 && !isLoadingVehicles && (
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        Không có phương tiện nào được tìm thấy
                      </div>
                    </div>
                  )}
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
                {/* Chỉ hiển thị phần chọn trạng thái cho admin/staff, ẩn với user */}
                {(roles.admin || roles.staff) && (
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
                )}
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

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        className="max-w-[600px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Chi tiết lịch hẹn
            </h5>
          </div>
          <div className="mt-8">
            {detailAppointment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Số hiệu lịch hẹn
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-900 dark:text-white">#{detailAppointment.id}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Khách hàng
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-900 dark:text-white">{detailAppointment.user?.username || "Không có"}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                    Trung tâm dịch vụ
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-900 dark:text-white">
                      {detailAppointment.serviceCenter?.name || `Service Center #${detailAppointment.serviceCenterId}`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                    Phương tiện
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-900 dark:text-white">
                      {detailAppointment.vehicleId ? (
                        (() => {
                          const vehicle = vehicles.find(v => Number(v.id) === Number(detailAppointment.vehicleId));
                          return vehicle ? `${vehicle.brand || ""} ${vehicle.model || ""} (${vehicle.licensePlate || ""})` : `Vehicle #${detailAppointment.vehicleId}`;
                        })()
                      ) : "Không có"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Ngày hẹn
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(detailAppointment.date)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Khung giờ
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-900 dark:text-white">
                        {detailAppointment.timeSlot}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                    Trạng thái
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Badge
                      size="sm"
                      color={getStatusColor(detailAppointment.status as AppointmentStatus) as any}
                    >
                      {getStatusLabel(detailAppointment.status as AppointmentStatus)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                    Ghi chú
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[60px]">
                    <span className="text-gray-900 dark:text-white">
                      {detailAppointment.notes || "Không có ghi chú"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Ngày tạo
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-900 dark:text-white text-sm">
                        {new Date(detailAppointment.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Cập nhật lần cuối
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-900 dark:text-white text-sm">
                        {new Date(detailAppointment.updatedAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
        </div>
      </div>
    </div>
  );
}
