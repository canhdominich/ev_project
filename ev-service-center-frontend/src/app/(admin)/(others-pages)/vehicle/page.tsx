"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import VehicleDataTable from "@/components/vehicle/VehicleDataTable";
import { getVehicles, Vehicle } from "@/services/vehicleService";
import React, { useEffect, useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import SearchBox from "@/components/common/SearchBox";
import { getErrorMessage } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";

export default function VehiclePage() {
  const headers = [
    { key: "ownerName", title: "Chủ xe" },
    { key: "brand", title: "Thương hiệu" },
    { key: "licensePlate", title: "Biển số xe" },
    { key: "model", title: "Mẫu xe" },
    { key: "year", title: "Năm sản xuất" },
    { key: "status", title: "Trạng thái" },
    { key: "action", title: "Hành động" },
  ];

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    currentPage,
    itemsPerPage,
    paginationInfo,
    handlePageChange,
    handleItemsPerPageChange,
    setTotalItems,
    setTotalPages,
    resetToFirstPage,
  } = usePagination();

  const fetchVehicles = useCallback(
    async (params?: Record<string, string | number>, isSearch = false) => {
      try {
        if (isSearch) {
          setIsSearching(true);
        } else {
          setIsLoading(true);
        }

        const searchParams = {
          ...params,
          page: currentPage,
          limit: itemsPerPage,
        };

        const data = await getVehicles(searchParams);

        setVehicles(data.data as Vehicle[]);
        setTotalItems(data.total);
        setTotalPages(data.totalPages);
      } catch (e) {
        toast.error(getErrorMessage(e, "Không thể tải danh sách xe"));
      } finally {
        if (isSearch) {
          setIsSearching(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [currentPage, itemsPerPage, setTotalItems, setTotalPages]
  );

  const handleSearch = useCallback(
    (query: string) => {
      const trimmedQuery = query.trim();
      setSearchTerm(trimmedQuery);
      resetToFirstPage();

      if (trimmedQuery) {
        fetchVehicles(
          {
            keyword: trimmedQuery,
          },
          true
        );
      } else {
        fetchVehicles({}, true);
      }
    },
    [fetchVehicles, resetToFirstPage]
  );

  const handleRefresh = useCallback(() => {
    if (searchTerm.trim()) {
      fetchVehicles(
        {
          keyword: searchTerm.trim(),
        },
        true
      );
    } else {
      fetchVehicles({}, true);
    }
  }, [searchTerm, fetchVehicles]);

  useEffect(() => {
    fetchVehicles({});
  }, [fetchVehicles]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý xe cá nhân" />
      <div className="space-y-6">
        <ComponentCard title="">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <SearchBox
                  placeholder="Tìm kiếm theo biển số, hãng, mẫu, năm..."
                  onSearch={handleSearch}
                  defaultValue={searchTerm}
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tổng cộng: {paginationInfo.totalItems} xe
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <VehicleDataTable
              headers={headers}
              items={vehicles}
              onRefresh={handleRefresh}
              pagination={{
                currentPage,
                totalPages: paginationInfo.totalPages,
                totalItems: paginationInfo.totalItems,
                itemsPerPage,
                hasNext: currentPage < paginationInfo.totalPages,
                hasPrev: currentPage > 1,
              }}
              isSearching={isSearching}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
