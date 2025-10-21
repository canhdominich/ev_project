"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PartDataTable from "@/components/part/PartDataTable";
import { getParts, Part } from "@/services/partService";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";

export default function PartPage() {
  const headers = [
    { key: "name", title: "Tên linh kiện" },
    { key: "partNumber", title: "Mã linh kiện" },
    { key: "quantity", title: "Số lượng" },
    { key: "minStock", title: "Tồn kho tối thiểu" },
    { key: "status", title: "Trạng thái" },
    { key: "createdAt", title: "Ngày tạo" },
    { key: "action", title: "Hành động" },
  ];

  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  const fetchParts = async (page = 1, search = "") => {
    try {
      setIsLoading(true);
      const response = await getParts({
        page,
        limit: itemsPerPage,
        search: search || undefined,
      });
      
      setParts(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
      setCurrentPage(response.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách linh kiện");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParts(currentPage, searchTerm);
  }, [currentPage]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    fetchParts(1, term);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchParts(page, searchTerm);
  };

  const handleRefresh = () => {
    fetchParts(currentPage, searchTerm);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý linh kiện" />
      <div className="space-y-6">
        <ComponentCard title="">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <SearchBox
                  placeholder="Tìm kiếm theo tên hoặc mã linh kiện..."
                  onSearch={handleSearch}
                  defaultValue={searchTerm}
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tổng cộng: {totalItems} linh kiện
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <PartDataTable 
                headers={headers} 
                items={parts} 
                onRefresh={handleRefresh}
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