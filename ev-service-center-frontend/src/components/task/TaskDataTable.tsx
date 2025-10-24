"use client";
import React, { useMemo, useState } from "react";
import { TableCell, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Header } from "@/types/common";
import { ChecklistItem } from "@/services/workorderService";
import { Modal } from "../ui/modal";
import Select from "../form/Select";
import { ChevronDownIcon } from "@/icons";
import { getUsers, PaginatedUserResponse } from "@/services/userService";
import { UserRole } from "@/constants/user.constant";
import { VERY_BIG_NUMBER } from "@/constants/common";
import SearchableDataTable from "../common/SearchableDataTable";
import { PaginationInfo } from "../common/Pagination";

interface TaskDataTableProps {
  items: ChecklistItem[];
  headers: Header[];
  searchTerm?: string;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

export default function TaskDataTable({ 
  headers, 
  items, 
  searchTerm = "", 
  onSearch,
  isSearching = false,
  pagination,
  onPageChange,
  onItemsPerPageChange
}: TaskDataTableProps) {
  const [assignedMap, setAssignedMap] = useState<Record<number, number | undefined>>({});
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [usersResponse, setUsersResponse] = useState<PaginatedUserResponse | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const openAssignModal = async (itemId: number) => {
    setSelectedItemId(itemId);
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

  const userOptions = useMemo(() => {
    if (!usersResponse) return [] as { value: string; label: string }[];
    return (usersResponse.data || []).map((u) => ({ value: String(u.id), label: u.username || `User #${u.id}` }));
  }, [usersResponse]);

  const handleAssign = (userIdStr: string) => {
    if (selectedItemId == null) return;
    const userId = userIdStr === "-" ? undefined : Number(userIdStr);
    setAssignedMap((prev) => ({ ...prev, [selectedItemId]: userId }));
  };

  const getAssignedName = (itemId: number) => {
    const userId = assignedMap[itemId];
    if (!userId || !usersResponse) return "Chưa gán";
    const found = usersResponse.data.find((u) => Number(u.id) === Number(userId));
    return found?.username || `User #${userId}`;
  };

  // Render row function
  const renderRow = (item: ChecklistItem) => (
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
      <TableCell className="px-4 py-3 text-end">
        <button
          onClick={() => openAssignModal(item.id)}
          className="btn btn-info flex w-full justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 sm:w-auto"
        >
          Gán phụ trách
        </button>
      </TableCell>
    </TableRow>
  );

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
                disabled={isLoadingUsers}
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
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
