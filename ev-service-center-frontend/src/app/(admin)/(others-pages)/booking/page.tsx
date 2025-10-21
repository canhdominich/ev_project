"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import BookingDataTable from "@/components/booking/Booking";
import {
  getAllAppointments,
  getAllServiceCenters,
  Appointment,
  ServiceCenter,
} from "@/services/appointmentService";
import { getAllVehicles, Vehicle } from "@/services/vehicleService";

export default function BookingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Guard to avoid setting state after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadAll = useCallback(async () => {
    if (isMountedRef.current) setIsLoading(true);
    try {
      const [appointmentsData, serviceCentersData, vehiclesData] = await Promise.all([
        getAllAppointments(),
        getAllServiceCenters(),
        getAllVehicles(),
      ]);

      if (isMountedRef.current) {
        setAppointments(appointmentsData || []);
        setServiceCenters(serviceCentersData || []);
        setVehicles(vehiclesData || []);
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      if (isMountedRef.current) setIsLoading(false);
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
              serviceCenters={serviceCenters}
              vehicles={vehicles}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
