"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AppointmentDataTable from "@/components/appointment/AppointmentDataTable";
import { getAllAppointments, Appointment } from "@/services/appointmentService";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function AppointmentPage() {
  const headers = [
    { key: "userId", title: "Người dùng" },
    { key: "serviceCenter", title: "Trung tâm dịch vụ" },
    { key: "vehicleId", title: "Phương tiện" },
    { key: "datetime", title: "Ngày giờ hẹn" },
    { key: "status", title: "Trạng thái" },
    { key: "notes", title: "Ghi chú" },
    { key: "action", title: "Hành động" },
  ];

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý lịch hẹn" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <AppointmentDataTable 
              headers={headers} 
              items={appointments} 
              onRefresh={fetchAppointments}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}