"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TaskDataTable from "@/components/task/TaskDataTable";
import React, { useEffect, useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { getAllChecklistItems, ChecklistItem } from "@/services/workorderService";
import SearchBox from "@/components/common/SearchBox";
import { getErrorMessage } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";

export default function TaskPage() {
  const headers = [
    { key: "vehicleId", title: "Phương tiện" },
    { key: "task", title: "Tên nhiệm vụ" },
    { key: "price", title: "Giá" },
    { key: "createdAt", title: "Ngày tạo" },
    { key: "status", title: "Trạng thái" },
    { key: "assignee", title: "Nhân viên phụ trách" },
    { key: "action", title: "Hành động" },
  ];

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    currentPage,
    itemsPerPage,
    paginationInfo,
    handlePageChange,
    // handleItemsPerPageChange,
    setTotalItems,
    setTotalPages,
    resetToFirstPage,
  } = usePagination();

  const fetchTasks = useCallback(
    async (params?: Record<string, string | number>, isSearch = false) => {
      try {
        if (isSearch) {
          setIsSearching(true);
        } else {
          setIsLoading(true);
        }

        const searchParams = {
          page: currentPage,
          limit: itemsPerPage,
          ...params,
        };

        const response = await getAllChecklistItems(searchParams);

        setChecklistItems(response.data);
        setTotalItems(response.total);
        setTotalPages(response.totalPages);
      } catch (e) {
        toast.error(getErrorMessage(e, "Không thể tải danh sách công việc"));
      } finally {
        if (isSearch) {
          setIsSearching(false);
        } else {
          setIsLoading(false);
        }
        console.log("isSearching:", isSearching);
      }
    },
    [currentPage, itemsPerPage, setTotalItems, setTotalPages]
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      const trimmedQuery = query.trim();
      setSearchTerm(trimmedQuery);
      resetToFirstPage();

      if (trimmedQuery) {
        fetchTasks(
          {
            keyword: trimmedQuery,
          },
          true
        );
      } else {
        fetchTasks({}, true);
      }
    },
    [fetchTasks, resetToFirstPage]
  );

  // const handleRefresh = useCallback(() => {
  //   if (searchTerm.trim()) {
  //     fetchTasks(
  //       {
  //         keyword: searchTerm.trim(),
  //       },
  //       true
  //     );
  //   } else {
  //     fetchTasks({}, true);
  //   }
  // }, [searchTerm, fetchTasks]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý công việc" />
      <div className="space-y-6">
        <ComponentCard title="">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <SearchBox
                  placeholder="Tìm kiếm theo tên nhiệm vụ..."
                  onSearch={handleSearch}
                  defaultValue={searchTerm}
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tổng cộng: {paginationInfo.totalItems} công việc
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <TaskDataTable
                headers={headers}
                items={checklistItems}
              />
              {paginationInfo.totalPages > 1 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, paginationInfo.totalItems)} trong tổng số {paginationInfo.totalItems} công việc
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Trước
                      </button>
                      <span className="px-3 py-1 text-sm">
                        Trang {currentPage} / {paginationInfo.totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= paginationInfo.totalPages}
                        className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
