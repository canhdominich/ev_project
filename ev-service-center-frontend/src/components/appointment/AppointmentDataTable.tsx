"use client";
import React, { useState, useEffect } from "react";
import { TableCell, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { BadgeColor, Header } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import Select from "../form/Select";
import { AppointmentStatus, AppointmentStatusOptions, TimeSlotOptions, getStatusColor, getStatusLabel } from "@/constants/appointment.constant";
import { ChevronDownIcon } from "@/icons";
import { CreateAppointmentDto, deleteAppointment, updateAppointment, Appointment, createAppointment, getAllServiceCenters, ServiceCenter, getAppointmentsByUserId, getAppointmentById } from "@/services/appointmentService";
import { getAllVehicles, getVehiclesByUserId, Vehicle } from "@/services/vehicleService";
import { getRolesObject } from "@/utils/user.utils";
import { IUserRole } from "@/types/common";
import { createWorkOrder, addChecklistItem, updateWorkOrder, getWorkOrderByAppointmentId, getChecklistItems, updateChecklistItem, CreateWorkOrderRequest, CreateChecklistItemRequest, WorkOrder, ChecklistItem, WorkOrderStatus } from "@/services/workorderService";
import toast from "react-hot-toast";
import SearchableDataTable from "../common/SearchableDataTable";
import { PaginationInfo } from "../common/Pagination";

interface AppointmentDataTableProps {
  onRefresh: () => void;
  items: Appointment[];
  headers: Header[];
  searchTerm?: string;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

export default function AppointmentDataTable({
  headers,
  items,
  onRefresh,
  searchTerm = "",
  onSearch,
  isSearching = false,
  pagination,
  onPageChange,
  onItemsPerPageChange
}: AppointmentDataTableProps) {
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
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [selectedAppointmentForWorkOrder, setSelectedAppointmentForWorkOrder] = useState<Appointment | null>(null);
  const [workOrderFormData, setWorkOrderFormData] = useState<CreateWorkOrderRequest>({
    title: "",
    description: "",
    status: "pending",
    appointmentId: 0,
    dueDate: "",
    totalPrice: 0,
    createdById: 1,
  });
  const [checklistItems, setChecklistItems] = useState<Omit<CreateChecklistItemRequest, 'workOrderId'>[]>([
    { price: 0, task: "" }
  ]);
  const [appointmentWorkOrders, setAppointmentWorkOrders] = useState<Map<number, WorkOrder>>(new Map());
  const [isWorkOrderDetailModalOpen, setIsWorkOrderDetailModalOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [workOrderChecklistItems, setWorkOrderChecklistItems] = useState<ChecklistItem[]>([]);
  const [isEditingWorkOrder, setIsEditingWorkOrder] = useState(false);
  const [isLoadingWorkOrderDetail, setIsLoadingWorkOrderDetail] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentDto>({
    createdById: 1, // Default admin id
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
          console.error("Error:", error);
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
          vehicleData = (await getAllVehicles()).data as Vehicle[];
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
        console.error("Error:", error);
        toast.error("Không thể tải danh sách trung tâm dịch vụ");
      }
    };
    loadServiceCenters();
  }, []);

  // Load work orders for appointments
  useEffect(() => {
    const loadWorkOrders = async () => {
      const workOrderMap = new Map<number, WorkOrder>();

      for (const appointment of filteredItems) {
        try {
          const workOrder = await getWorkOrderByAppointmentId(appointment.id);
          if (workOrder) {
            workOrderMap.set(appointment.id, workOrder);
          }
        } catch (error) {
          console.error(`Error loading work order for appointment ${appointment.id}:`, error);
        }
      }

      setAppointmentWorkOrders(workOrderMap);
    };

    if (filteredItems.length > 0) {
      loadWorkOrders();
    }
  }, [filteredItems]);

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
        status: selectedAppointment.status as 'pending' | 'confirmed' | 'cancelled',
        notes: selectedAppointment.notes || "",
      });
    }
  }, [selectedAppointment]);

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as 'pending' | 'confirmed' | 'cancelled' });
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
      console.error("Error:", error);
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

  const handleCreateWorkOrder = (appointment: Appointment) => {
    setSelectedAppointmentForWorkOrder(appointment);
    setWorkOrderFormData({
      title: `Phiếu dịch vụ - ${appointment.user?.username || 'Khách hàng'}`,
      description: appointment.notes || "",
      status: "pending",
      appointmentId: appointment.id,
      dueDate: "",
      totalPrice: 0,
      createdById: currentUserId || 1,
    });
    setChecklistItems([{ price: 0, task: "" }]);
    setIsWorkOrderModalOpen(true);
  };

  const handleWorkOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation
    if (!workOrderFormData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề phiếu dịch vụ");
      return;
    }

    const validChecklistItems = checklistItems.filter(item => item.task.trim());
    if (validChecklistItems.length === 0) {
      toast.error("Vui lòng nhập ít nhất một công việc");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create work order
      const workOrder = await createWorkOrder(workOrderFormData);

      // Create checklist items
      for (const item of validChecklistItems) {
        await addChecklistItem(workOrder.id, item);
      }

      toast.success("Tạo phiếu dịch vụ thành công");
      setIsWorkOrderModalOpen(false);
      onRefresh();
    } catch (error) {
      console.error("Error creating work order:", error);
      toast.error("Không thể tạo phiếu dịch vụ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addChecklistItemRow = () => {
    setChecklistItems([...checklistItems, { price: 0, task: "" }]);
  };

  const removeChecklistItemRow = (index: number) => {
    if (checklistItems.length > 1) {
      setChecklistItems(checklistItems.filter((_, i) => i !== index));
    }
  };

  const updateChecklistItemLocal = (index: number, field: 'price' | 'task', value: string | number) => {
    const updatedItems = [...checklistItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setChecklistItems(updatedItems);

    const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price || 0), 0);
    setWorkOrderFormData(prev => ({ ...prev, totalPrice }));
  };

  const calculateTotalPrice = () => {
    return checklistItems.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const handleViewWorkOrderDetail = async (appointment: Appointment) => {
    try {
      setIsLoadingWorkOrderDetail(true);
      
      // Luôn fetch dữ liệu mới nhất từ server thay vì sử dụng cache
      const freshWorkOrder = await getWorkOrderByAppointmentId(appointment.id);
      if (!freshWorkOrder) {
        toast.error("Không tìm thấy phiếu dịch vụ");
        return;
      }

      setSelectedWorkOrder(freshWorkOrder);
      
      // Fetch checklist items mới nhất
      const checklistItems = await getChecklistItems(freshWorkOrder.id);
      setWorkOrderChecklistItems(checklistItems);

      // Set form data for editing với dữ liệu mới nhất
      setWorkOrderFormData({
        title: freshWorkOrder.title,
        description: freshWorkOrder.description || "",
        status: freshWorkOrder.status as WorkOrderStatus,
        appointmentId: freshWorkOrder.appointmentId,
        dueDate: freshWorkOrder.dueDate ? freshWorkOrder.dueDate.split('T')[0] : "",
        totalPrice: freshWorkOrder.totalPrice,
        createdById: freshWorkOrder.createdById,
      });

      setIsWorkOrderDetailModalOpen(true);
    } catch (error) {
      console.error("Error loading work order detail:", error);
      toast.error("Không thể tải chi tiết phiếu dịch vụ");
    } finally {
      setIsLoadingWorkOrderDetail(false);
    }
  };

  const handleEditWorkOrder = () => {
    setIsEditingWorkOrder(true);
  };

  const handleSaveWorkOrder = async () => {
    if (!selectedWorkOrder) return;

    try {
      setIsSubmitting(true);
      await updateWorkOrder(selectedWorkOrder.id, {
        title: workOrderFormData.title,
        description: workOrderFormData.description,
        status: workOrderFormData.status,
        dueDate: workOrderFormData.dueDate,
        totalPrice: workOrderFormData.totalPrice,
      });

      // Update checklist items
      for (const item of workOrderChecklistItems) {
        await updateChecklistItem(selectedWorkOrder.id, item.id, {
          task: item.task,
          price: item.price,
          completed: item.completed,
        });
      }

      toast.success("Cập nhật phiếu dịch vụ thành công");
      setIsEditingWorkOrder(false);

      // Reload work orders
      const updatedWorkOrder = await getWorkOrderByAppointmentId(selectedWorkOrder.appointmentId);
      if (updatedWorkOrder) {
        setAppointmentWorkOrders(prev => new Map(prev.set(selectedWorkOrder.appointmentId, updatedWorkOrder)));
        setSelectedWorkOrder(updatedWorkOrder);
      }

      onRefresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể cập nhật phiếu dịch vụ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEditWorkOrder = () => {
    setIsEditingWorkOrder(false);
    // Reset form data
    if (selectedWorkOrder) {
      setWorkOrderFormData({
        title: selectedWorkOrder.title,
        description: selectedWorkOrder.description || "",
        status: selectedWorkOrder.status as WorkOrderStatus,
        appointmentId: selectedWorkOrder.appointmentId,
        dueDate: selectedWorkOrder.dueDate ? selectedWorkOrder.dueDate.split('T')[0] : "",
        totalPrice: selectedWorkOrder.totalPrice,
        createdById: selectedWorkOrder.createdById,
      });
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

  // Render row function
  const renderRow = (item: Appointment) => {
    const roles = getRolesObject(userRoles);
    const canEdit = roles.admin || roles.staff;
    const canDelete = roles.admin || roles.staff;

    return (
      <TableRow key={item.id}>
        <TableCell className="px-5 py-4 sm:px-6 text-start">
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
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {item.serviceCenter?.name || `Service Center #${item.serviceCenterId}`}
        </TableCell>
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {item.vehicleId ? (
            (() => {
              const vehicle = vehicles.find(v => Number(v.id) === Number(item.vehicleId));
              return vehicle ? `${vehicle.brand || ""} ${vehicle.model || ""} (${vehicle.licensePlate || ""})` : `Vehicle #${item.vehicleId}`;
            })()
          ) : "Không có"}
        </TableCell>
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {formatDateTime(item.date, item.timeSlot)}
        </TableCell>
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          <Badge
            size="sm"
            color={getStatusColor(item.status as AppointmentStatus) as BadgeColor}
          >
            {getStatusLabel(item.status as AppointmentStatus)}
          </Badge>
        </TableCell>
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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
            {canEdit && item.status === AppointmentStatus.Confirmed && (
              <>
                {appointmentWorkOrders.has(item.id) ? (
                  <button
                    onClick={() => handleViewWorkOrderDetail(item)}
                    disabled={isLoadingWorkOrderDetail}
                    className="btn btn-info btn-view-workorder flex w-full justify-center rounded-lg bg-purple-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-600 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingWorkOrderDetail ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang tải...
                      </div>
                    ) : (
                      'Chi tiết phiếu dịch vụ'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleCreateWorkOrder(item)}
                    className="btn btn-warning btn-create-workorder flex w-full justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 sm:w-auto"
                  >
                    Tạo phiếu dịch vụ
                  </button>
                )}
              </>
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
  };

  // Action button
  const actionButton = canCreate ? (
    <button
      onClick={openModal}
      type="button"
      className="btn btn-success btn-update-event flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
    >
      + Thêm lịch hẹn
    </button>
  ) : undefined;

  return (
    <>
      <SearchableDataTable
        headers={headers}
        items={filteredItems as never}
        renderRow={renderRow as never}
        searchTerm={searchTerm}
        onSearch={onSearch}
        searchPlaceholder="Tìm kiếm theo khách hàng, trung tâm, ghi chú..."
        isSearching={isSearching}
        pagination={pagination}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        actionButton={actionButton}
      />

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
            {selectedAppointment && (
              <div className="mt-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                      Lưu ý khi chỉnh sửa lịch hẹn
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300">
                      Phương tiện không thể thay đổi khi chỉnh sửa để tránh nhầm lẫn và đảm bảo tính chính xác của dịch vụ. Các thông tin khác vẫn có thể chỉnh sửa bình thường.
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                {selectedAppointment && (
                  <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                    (Không thể thay đổi khi chỉnh sửa)
                  </span>
                )}
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
                  disabled={isLoadingVehicles || !!selectedAppointment}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
              {selectedAppointment && (
                <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-sm text-orange-800 dark:text-orange-200">
                    <span className="font-medium">Lý do:</span> Phương tiện không thể thay đổi để tránh nhầm lẫn và đảm bảo tính chính xác của dịch vụ
                  </div>
                </div>
              )}
              {formData.vehicleId && !isLoadingVehicles && !selectedAppointment && (
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
            {/* Only display the status selection section for admin/staff, hide it for users */}
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
                      color={getStatusColor(detailAppointment.status as AppointmentStatus) as BadgeColor}
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

      {/* Work Order Modal */}
      <Modal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        className="max-w-[800px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Tạo phiếu dịch vụ
            </h5>
          </div>
          <form onSubmit={handleWorkOrderSubmit} className="mt-8">
            {/* Info appointment */}
            {selectedAppointmentForWorkOrder && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h6 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Thông tin lịch hẹn
                </h6>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Khách hàng:</span>
                    <span className="ml-2 text-blue-900 dark:text-blue-100">
                      {selectedAppointmentForWorkOrder.user?.username || "Không có"}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Trung tâm:</span>
                    <span className="ml-2 text-blue-900 dark:text-blue-100">
                      {selectedAppointmentForWorkOrder.serviceCenter?.name || `Service Center #${selectedAppointmentForWorkOrder.serviceCenterId}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Ngày hẹn:</span>
                    <span className="ml-2 text-blue-900 dark:text-blue-100">
                      {formatDateTime(selectedAppointmentForWorkOrder.date, selectedAppointmentForWorkOrder.timeSlot)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Phương tiện:</span>
                    <span className="ml-2 text-blue-900 dark:text-blue-100">
                      {selectedAppointmentForWorkOrder.vehicleId ? (
                        (() => {
                          const vehicle = vehicles.find(v => Number(v.id) === Number(selectedAppointmentForWorkOrder.vehicleId));
                          return vehicle ? `${vehicle.brand || ""} ${vehicle.model || ""} (${vehicle.licensePlate || ""})` : `Vehicle #${selectedAppointmentForWorkOrder.vehicleId}`;
                        })()
                      ) : "Không có"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Tiêu đề phiếu dịch vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={workOrderFormData.title}
                  onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, title: e.target.value })}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="Nhập tiêu đề phiếu dịch vụ..."
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Mô tả
                </label>
                <textarea
                  value={workOrderFormData.description}
                  onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, description: e.target.value })}
                  className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  rows={3}
                  placeholder="Nhập mô tả phiếu dịch vụ..."
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Trạng thái
                  </label>
                  <div className="relative">
                    <Select
                      value={workOrderFormData.status || "pending"}
                      onChange={(value) => setWorkOrderFormData({ ...workOrderFormData, status: value as WorkOrderStatus })}
                      options={[
                        { value: "pending", label: "Chờ xử lý" },
                        { value: "in_progress", label: "Đang thực hiện" },
                        { value: "completed", label: "Hoàn thành" },
                        { value: "cancelled", label: "Đã hủy" },
                      ]}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Ngày hẹn hoàn thành
                  </label>
                  <input
                    type="date"
                    value={workOrderFormData.dueDate}
                    onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, dueDate: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Tổng giá trị dự kiến (VND)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={workOrderFormData.totalPrice}
                    onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, totalPrice: parseFloat(e.target.value) || 0 })}
                    className="dark:bg-dark-900 h-11 flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập tổng giá trị dự kiến..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const calculatedTotal = calculateTotalPrice();
                      setWorkOrderFormData(prev => ({ ...prev, totalPrice: calculatedTotal }));
                    }}
                    className="h-11 px-4 py-2.5 text-sm font-medium text-brand-600 hover:text-brand-700 border border-brand-300 hover:border-brand-400 rounded-lg transition-colors"
                  >
                    Tính từ danh sách
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Tổng từ danh sách công việc: <span className="font-medium text-brand-600 dark:text-brand-400">{calculateTotalPrice().toLocaleString('vi-VN')} VND</span>
                </div>
              </div>

              {/* Checklist items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Danh sách công việc <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addChecklistItemRow}
                    className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                  >
                    + Thêm công việc
                  </button>
                </div>

                <div className="space-y-3">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Công việc
                        </label>
                        <input
                          type="text"
                          value={item.task}
                          onChange={(e) => updateChecklistItemLocal(index, 'task', e.target.value)}
                          className="dark:bg-dark-900 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          placeholder="Nhập công việc..."
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Giá (VND)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateChecklistItemLocal(index, 'price', parseFloat(e.target.value) || 0)}
                          className="dark:bg-dark-900 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          placeholder="0"
                        />
                      </div>
                      {checklistItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChecklistItemRow(index)}
                          className="h-10 w-10 flex items-center justify-center rounded-lg border border-red-300 text-red-500 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                type="button"
                onClick={() => setIsWorkOrderModalOpen(false)}
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-success btn-create-workorder flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo phiếu dịch vụ"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Work Order Detail Modal */}
      <Modal
        isOpen={isWorkOrderDetailModalOpen}
        onClose={() => {
          setIsWorkOrderDetailModalOpen(false);
          setIsEditingWorkOrder(false);
          setSelectedWorkOrder(null);
          setWorkOrderChecklistItems([]);
        }}
        className="max-w-[900px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between">
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Chi tiết phiếu dịch vụ
            </h5>
          </div>

          {selectedWorkOrder && (
            <div className="mt-8">
              {isEditingWorkOrder ? (
                // Edit Mode
                <form onSubmit={(e) => { e.preventDefault(); handleSaveWorkOrder(); }} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Tiêu đề phiếu dịch vụ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={workOrderFormData.title}
                      onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, title: e.target.value })}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Mô tả
                    </label>
                    <textarea
                      value={workOrderFormData.description}
                      onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, description: e.target.value })}
                      className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Trạng thái
                      </label>
                      <div className="relative">
                        <Select
                          value={workOrderFormData.status || "pending"}
                          onChange={(value) => setWorkOrderFormData({ ...workOrderFormData, status: value as WorkOrderStatus })}
                          options={[
                            { value: "pending", label: "Chờ xử lý" },
                            { value: "in_progress", label: "Đang thực hiện" },
                            { value: "completed", label: "Hoàn thành" },
                            { value: "cancelled", label: "Đã hủy" },
                          ]}
                          className="dark:bg-dark-900"
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <ChevronDownIcon />
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Ngày hẹn hoàn thành
                      </label>
                      <input
                        type="date"
                        value={workOrderFormData.dueDate}
                        onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, dueDate: e.target.value })}
                        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Tổng giá trị (VND)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={workOrderFormData.totalPrice}
                      onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, totalPrice: parseFloat(e.target.value) || 0 })}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>

                  {/* Checklist Items Edit */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Danh sách công việc
                    </label>
                    <div className="space-y-3">
                      {workOrderChecklistItems.map((item, index) => (
                        <div key={item.id} className="flex gap-3 items-end">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Công việc
                            </label>
                            <input
                              type="text"
                              value={item.task}
                              onChange={(e) => {
                                const updatedItems = [...workOrderChecklistItems];
                                updatedItems[index] = { ...updatedItems[index], task: e.target.value };
                                setWorkOrderChecklistItems(updatedItems);
                              }}
                              className="dark:bg-dark-900 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                          </div>
                          <div className="w-24">
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Giá (VND)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => {
                                const updatedItems = [...workOrderChecklistItems];
                                updatedItems[index] = { ...updatedItems[index], price: parseFloat(e.target.value) || 0 };
                                setWorkOrderChecklistItems(updatedItems);
                              }}
                              className="dark:bg-dark-900 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                          </div>
                          <div className="flex items-center justify-center cursor-pointer">
                            <label className="flex items-center space-x-2 cursor-pointer mb-[3px]">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={(e) => {
                                  const updatedItems = [...workOrderChecklistItems];
                                  updatedItems[index] = { ...updatedItems[index], completed: e.target.checked };
                                  setWorkOrderChecklistItems(updatedItems);
                                }}
                                className="w-8 h-8 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Hoàn thành
                              </span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                    <button
                      type="button"
                      onClick={handleCancelEditWorkOrder}
                      className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                    >
                      {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              ) : (
                // View Mode
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Tiêu đề
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-900 dark:text-white">{selectedWorkOrder.title}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Trạng thái
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Badge
                          size="sm"
                          color={selectedWorkOrder.status === 'completed' ? 'success' : selectedWorkOrder.status === 'cancelled' ? 'error' : selectedWorkOrder.status === 'in_progress' ? 'warning' : 'light'}
                        >
                          {selectedWorkOrder.status === 'pending' ? 'Chờ xử lý' :
                            selectedWorkOrder.status === 'in_progress' ? 'Đang thực hiện' :
                              selectedWorkOrder.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                      Mô tả
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[60px]">
                      <span className="text-gray-900 dark:text-white">
                        {selectedWorkOrder.description || "Không có mô tả"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Ngày hẹn hoàn thành
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-900 dark:text-white">
                          {selectedWorkOrder.dueDate ? formatDate(selectedWorkOrder.dueDate) : "Chưa xác định"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Checklist Items */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">
                      Danh sách công việc
                    </label>
                    <div className="space-y-3">
                      {workOrderChecklistItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <span className="text-gray-900 dark:text-white">{item.task}</span>
                          </div>
                          <div className="w-24 text-right">
                            <span className="text-gray-900 dark:text-white font-medium">
                              {item.price.toLocaleString('vi-VN')} VND
                            </span>
                          </div>
                          <div className="w-40 text-center">
                            <Badge
                              size="sm"
                              color={item.completed ? 'success' : 'warning'}
                            >
                              {item.completed ? 'Hoàn thành' : 'Chưa hoàn thành'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Tổng giá trị
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="font-medium text-red-500 dark:text-red-400">
                          {selectedWorkOrder.totalPrice.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Ngày tạo
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-900 dark:text-white text-sm">
                          {new Date(selectedWorkOrder.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Cập nhật lần cuối
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-900 dark:text-white text-sm">
                          {new Date(selectedWorkOrder.updatedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                    {!isEditingWorkOrder && (
                      <button
                        onClick={handleEditWorkOrder}
                        className="px-5 py-2.5 text-sm font-medium text-brand-600 hover:text-brand-700 border border-brand-300 hover:border-brand-400 rounded-lg transition-colors"
                      >
                        Chỉnh sửa
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsWorkOrderDetailModalOpen(false);
                        setIsEditingWorkOrder(false);
                        setSelectedWorkOrder(null);
                        setWorkOrderChecklistItems([]);
                      }}
                      type="button"
                      className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
