"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import BookingDataTable from "@/components/booking/Booking";
import {
  getAllAppointments,
  getAllServiceCenters,
  Appointment,
  ServiceCenter,
} from "@/services/appointmentService";
import { 
  getAllVehicles, 
  Vehicle as VehicleType 
} from "@/services/vehicleService";
import { 
  getUsers 
} from "@/services/userService";
import { User } from "@/types/common";

export default function BookingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [appointmentsData, serviceCentersData, vehiclesData, usersData] = await Promise.all([
        getAllAppointments(),
        getAllServiceCenters(),
        getAllVehicles(),
        getUsers(),
      ]);
      
      setAppointments(appointmentsData || []);
      setServiceCenters(serviceCentersData || []);
      setVehicles((vehiclesData?.data as VehicleType[]) || []);
      setUsers(usersData?.data || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = () => {
    loadAll();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Đặt lịch bảo dưỡng" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <BookingDataTable
              onRefresh={onRefresh}
              appointments={appointments}
              users={users}
              vehicles={vehicles}
              serviceCenters={serviceCenters}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
