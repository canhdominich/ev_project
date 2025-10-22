"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TaskDataTable from "@/components/task/TaskDataTable";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getAllWorkOrders, getChecklistItems, ChecklistItem, WorkOrder } from "@/services/workorderService";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";

export default function TaskPage() {
  const headers = [
    { key: "task", title: "Công việc" },
    { key: "price", title: "Giá" },
    { key: "status", title: "Trạng thái" },
    { key: "assignee", title: "Người phụ trách" },
    { key: "action", title: "Hành động" },
  ];

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const workorders: WorkOrder[] = await getAllWorkOrders();
      const allItems: ChecklistItem[] = [];
      for (const wo of workorders) {
        try {
          const items = await getChecklistItems(wo.id);
          allItems.push(...items);
        } catch {
          // skip this workorder if failed
        }
      }
      setChecklistItems(allItems);
    } catch {
      toast.error("Không thể tải danh sách công việc");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? checklistItems.filter((i) =>
          [i.task, i.price, i.assignedToUserId, i.completed ? "completed" : "pending"].some((v) =>
            String(v ?? "").toLowerCase().includes(term)
          )
        )
      : checklistItems;
    setTotalItems(filtered.length);
    const pages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    setTotalPages(pages);
    const safePage = Math.min(currentPage, pages);
    if (safePage !== currentPage) setCurrentPage(safePage);
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [checklistItems, searchTerm, currentPage, itemsPerPage]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý công việc" />
      <div className="space-y-6">
        <ComponentCard title="">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <SearchBox
                  placeholder="Tìm kiếm theo công việc, giá, người phụ trách..."
                  onSearch={handleSearch}
                  defaultValue={searchTerm}
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tổng cộng: {totalItems} công việc
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
                items={filteredItems} 
              />
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    pagination={{
                      currentPage,
                      totalPages,
                      totalItems,
                      itemsPerPage,
                      hasNext: currentPage < totalPages,
                      hasPrev: currentPage > 1,
                    }}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
