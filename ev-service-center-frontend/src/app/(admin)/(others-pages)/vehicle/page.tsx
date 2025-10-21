"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import VehicleDataTable from "@/components/vehicle/VehicleDataTable";
import { getVehicles, Vehicle } from "@/services/vehicleService";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

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

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const data = await getVehicles();
      setVehicles(data);
    } catch {
      toast.error("Không thể tải danh sách xe");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý xe cá nhân" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <VehicleDataTable 
              headers={headers} 
              items={vehicles} 
              onRefresh={fetchVehicles}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
