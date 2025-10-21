"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import BookingDataTable from "@/components/booking/Booking";
import { getBookings, Booking } from "@/services/bookingService";
import { getProjects, ProjectEntity } from "@/services/projectService";

export default function BookingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [projects, setProjects] = useState<ProjectEntity[]>([]);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : data.data || []);
    } catch {
      toast.error("Không thể tải danh sách đề tài");
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await getBookings();
      setBookings(Array.isArray(data) ? data : data.data || []);
    } catch {
      toast.error("Không thể tải danh sách lịch bảo vệ");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchProjects(),
        fetchBookings()
      ]);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const onRefresh = () => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchProjects(),
        fetchBookings()
      ]);
      setIsLoading(false);
    };
    
    loadData();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Lịch bảo vệ đề tài" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <BookingDataTable
              projects={projects}
              onRefresh={onRefresh}
              bookings={bookings}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
