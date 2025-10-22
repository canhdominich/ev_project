"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AppointmentDataTable from "@/components/appointment/AppointmentDataTable";
import { getAllAppointments, Appointment } from "@/services/appointmentService";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";

export default function AppointmentPage() {
  const headers = [
    { key: "userId", title: "Khách hàng" },
    { key: "serviceCenter", title: "Trung tâm dịch vụ" },
    { key: "vehicleId", title: "Phương tiện" },
    { key: "datetime", title: "Ngày giờ hẹn" },
    { key: "status", title: "Trạng thái" },
    { key: "notes", title: "Ghi chú" },
    { key: "action", title: "Hành động" },
  ];

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await getAllAppointments();
      setAppointments(data);
    } catch {
      toast.error("Không thể tải danh sách lịch hẹn");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? appointments.filter((a) =>
          [
            a.user?.username,
            a.user?.email,
            a.serviceCenter?.name,
            a.notes,
            a.status,
          ]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(term))
        )
      : appointments;
    setTotalItems(filtered.length);
    const pages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    setTotalPages(pages);
    const safePage = Math.min(currentPage, pages);
    if (safePage !== currentPage) setCurrentPage(safePage);
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [appointments, searchTerm, currentPage, itemsPerPage]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý lịch hẹn" />
      <div className="space-y-6">
        <ComponentCard title="">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <SearchBox
                  placeholder="Tìm kiếm theo khách hàng, trung tâm, ghi chú..."
                  onSearch={handleSearch}
                  defaultValue={searchTerm}
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tổng cộng: {totalItems} lịch hẹn
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <AppointmentDataTable 
                headers={headers} 
                items={filteredAppointments} 
                onRefresh={fetchAppointments}
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