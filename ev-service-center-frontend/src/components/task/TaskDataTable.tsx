"use client";
import React, { useMemo, useState } from "react";
import { TableCell, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Header } from "@/types/common";
import { ChecklistItem, updateChecklistItem } from "@/services/workorderService";
import { Modal } from "../ui/modal";
import Select from "../form/Select";
import { ChevronDownIcon } from "@/icons";
import { getUsers, PaginatedUserResponse } from "@/services/userService";
import { UserRole } from "@/constants/user.constant";
import { VERY_BIG_NUMBER } from "@/constants/common";
import SearchableDataTable from "../common/SearchableDataTable";
import { PaginationInfo } from "../common/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";

interface TaskDataTableProps {
  items: ChecklistItem[];
  headers: Header[];
  searchTerm?: string;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  onRefresh?: () => void;
}

export default function TaskDataTable({
  headers,
  items,
  searchTerm = "",
  onSearch,
  isSearching = false,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  onRefresh
}: TaskDataTableProps) {
  const { user, hasRole } = useAuth();
  const [assignedMap, setAssignedMap] = useState<Record<number, number | undefined>>({});
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [usersResponse, setUsersResponse] = useState<PaginatedUserResponse | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<Record<number, boolean>>({});
  const [isAssigning, setIsAssigning] = useState(false);

  const isAdmin = hasRole([UserRole.Admin]);

  const isStaff = hasRole([UserRole.Staff]);

  const openAssignModal = async (itemId: number) => {
    if (!isAdmin) {
      toast.error("Chỉ quản trị viên mới có quyền gán nhân viên phụ trách");
      return;
    }

    setSelectedItemId(itemId);

    const currentItem = items.find(item => item.id === itemId);
    if (currentItem?.assignedToUserId) {
      setAssignedMap(prev => ({ ...prev, [itemId]: currentItem.assignedToUserId || undefined }));
    }

    setIsAssignModalOpen(true);
    try {
      setIsLoadingUsers(true);
      const res = await getUsers({ limit: VERY_BIG_NUMBER, role: UserRole.Staff });
      setUsersResponse(res);
    } catch {
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleMarkComplete = async (item: ChecklistItem) => {
    if (!isStaff || !user || item.assignedToUserId !== user.id) {
      toast.error("Bạn chỉ có thể đánh dấu hoàn thành những task được gán cho bạn");
      return;
    }

    if (item.completed) {
      toast.error("Task này đã được đánh dấu hoàn thành");
      return;
    }

    try {
      setIsUpdatingStatus(prev => ({ ...prev, [item.id]: true }));

      await updateChecklistItem(item.workOrderId, item.id, { completed: true });

      toast.success("Đã đánh dấu task hoàn thành");

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái task");
      console.error("Error updating task status:", error);
    } finally {
      setIsUpdatingStatus(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const handleMarkIncomplete = async (item: ChecklistItem) => {
    if (!isStaff || !user || item.assignedToUserId !== user.id) {
      toast.error("Bạn chỉ có thể đánh dấu chưa hoàn thành những task được gán cho bạn");
      return;
    }

    if (!item.completed) {
      toast.error("Task này đã được đánh dấu chưa hoàn thành");
      return;
    }

    try {
      setIsUpdatingStatus(prev => ({ ...prev, [item.id]: true }));

      await updateChecklistItem(item.workOrderId, item.id, { completed: false });

      toast.success("Đã đánh dấu task chưa hoàn thành");

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái task");
      console.error("Error updating task status:", error);
    } finally {
      setIsUpdatingStatus(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const userOptions = useMemo(() => {
    if (!usersResponse) return [] as { value: string; label: string }[];
    return (usersResponse.data || []).map((u) => ({ value: String(u.id), label: u.username || `User #${u.id}` }));
  }, [usersResponse]);

  const handleAssign = (userIdStr: string) => {
    if (selectedItemId == null) return;
    const userId = userIdStr === "-" ? undefined : Number(userIdStr);
    setAssignedMap((prev) => ({ ...prev, [selectedItemId]: userId }));
  };

  const handleConfirmAssign = async () => {
    if (selectedItemId == null) return;

    const selectedUserId = assignedMap[selectedItemId];
    const selectedItem = items.find(item => item.id === selectedItemId);

    if (!selectedItem) {
      toast.error("Không tìm thấy task");
      return;
    }

    try {
      setIsAssigning(true);

      await updateChecklistItem(selectedItem.workOrderId, selectedItemId, {
        assignedToUserId: selectedUserId || null,
        assignedAt: selectedUserId ? new Date().toISOString() : null
      });

      toast.success("Đã gán nhân viên phụ trách thành công");

      setIsAssignModalOpen(false);

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gán nhân viên phụ trách");
      console.error("Error assigning user:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const getAssignedName = (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    if (item?.assignedUser) {
      return item.assignedUser.username || `User #${item.assignedUser.id}`;
    }

    if (item?.assignedToUserId) {
      return `User #${item.assignedToUserId}`;
    }

    const userId = assignedMap[itemId];
    if (!userId || !usersResponse) return "Chưa gán";
    const found = usersResponse.data.find((u) => Number(u.id) === Number(userId));
    return found?.username || `User #${userId}`;
  };

  const renderRow = (item: ChecklistItem) => {
    const canModifyTask = isStaff && user && item.assignedToUserId === user.id;
    const canMarkComplete = canModifyTask && !item.completed;
    const canMarkIncomplete = canModifyTask && item.completed;

    return (
      <TableRow key={item.id}>
        <TableCell className="px-4 py-3 text-start text-gray-700 dark:text-gray-300 text-theme-sm">
          {item.vehicle ? (
            <div className="text-sm">
              <div className="font-medium">{item.vehicle.licensePlate}</div>
              <div className="text-xs text-gray-500">{item.vehicle.brand} {item.vehicle.model}</div>
            </div>
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </TableCell>
        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-700 dark:text-gray-300 text-theme-sm">
          {item.task}
        </TableCell>
        <TableCell className="px-4 py-3 text-start text-gray-700 dark:text-gray-300 text-theme-sm">
          {item.price.toLocaleString('vi-VN')} VND
        </TableCell>
        <TableCell className="px-4 py-3 text-start text-gray-700 dark:text-gray-300 text-theme-sm">
          {new Date(item.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </TableCell>
        <TableCell className="px-4 py-3 text-start">
          <Badge size="sm" color={item.completed ? 'success' : 'warning'}>
            {item.completed ? 'Hoàn thành' : 'Chưa hoàn thành'}
          </Badge>
        </TableCell>
        <TableCell className="px-4 py-3 text-start text-gray-700 dark:text-gray-300 text-theme-sm">
          {getAssignedName(item.id)}
        </TableCell>
        <TableCell className="px-4 py-3 text-start">
          <div className="flex gap-2 justify-start">
            {canMarkComplete && (
              <button
                onClick={() => handleMarkComplete(item)}
                disabled={isUpdatingStatus[item.id]}
                className="btn btn-success flex justify-center rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingStatus[item.id] ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Hoàn thành'
                )}
              </button>
            )}

            {canMarkIncomplete && (
              <button
                onClick={() => handleMarkIncomplete(item)}
                disabled={isUpdatingStatus[item.id]}
                className="btn btn-warning flex justify-center rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingStatus[item.id] ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Chưa hoàn thành'
                )}
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => openAssignModal(item.id)}
                className="btn btn-info flex justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
              >
                Gán phụ trách
              </button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <SearchableDataTable
        headers={headers}
        items={items as never}
        renderRow={renderRow as never}
        searchTerm={searchTerm}
        onSearch={onSearch}
        searchPlaceholder="Tìm kiếm theo tên nhiệm vụ..."
        isSearching={isSearching}
        pagination={pagination}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        className="max-w-[520px] p-6 lg:p-8"
      >
        <div className="flex flex-col px-2">
          <h5 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-xl">Gán người phụ trách</h5>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nhân viên</label>
            <div className="relative">
              <Select
                value={assignedMap[selectedItemId ?? -1]?.toString() || "-"}
                onChange={handleAssign}
                options={[{ value: "-", label: isLoadingUsers ? "Đang tải..." : "Chọn nhân viên" }, ...userOptions]}
                className="dark:bg-dark-900"
                disabled={isLoadingUsers || isAssigning}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              disabled={isAssigning}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleConfirmAssign}
              disabled={isAssigning}
              className="btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xử lý...
                </div>
              ) : (
                'Xác nhận'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
