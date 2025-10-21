"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ServiceCenterDataTable from "@/components/service-center/ServiceCenterDataTable";
import { getAllServiceCenters, ServiceCenter } from "@/services/appointmentService";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function ServiceCenterPage() {
  const headers = [
    { key: "name", title: "Tên trung tâm" },
    { key: "address", title: "Địa chỉ" },
    { key: "phone", title: "Số điện thoại" },
    { key: "email", title: "Email" },
    { key: "createdAt", title: "Ngày tạo" },
    { key: "action", title: "Hành động" },
  ];

  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServiceCenters = async () => {
    try {
      setIsLoading(true);
      const data = await getAllServiceCenters();
      setServiceCenters(data);
    } catch {
      toast.error("Không thể tải danh sách trung tâm dịch vụ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceCenters();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý trung tâm dịch vụ" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <ServiceCenterDataTable 
              headers={headers} 
              items={serviceCenters} 
              onRefresh={fetchServiceCenters}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}