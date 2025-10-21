"use client";
import React, { useEffect, useState } from "react";
// import Badge from "../ui/badge/Badge";
import { CalenderIcon } from "@/icons";
import { getDashboardStats, IDashboardStatistic } from "@/services/statisticService";

const ProjectMetrics = () => {
  const [stats, setStats] = useState<IDashboardStatistic>({} as IDashboardStatistic);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* <!-- Total Projects Metric Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-800">
          <CalenderIcon className="text-blue-800 size-6 dark:text-blue-200" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tổng số đề tài
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats.projects?.totalProjects?.toLocaleString() || 0}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Total Projects Metric End --> */}

      {/* <!-- Draft Projects Metric Start --> */}
      {/* <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl dark:bg-yellow-800">
          <CalenderIcon className="text-yellow-800 size-6 dark:text-yellow-200" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Đề tài nháp
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats.projects?.draftProjects?.toLocaleString() || 0}
            </h4>
          </div>
        </div>
      </div> */}
      {/* <!-- Draft Projects Metric End --> */}

      {/* <!-- Pending Projects Metric Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-800">
          <CalenderIcon className="text-orange-800 size-6 dark:text-orange-200" />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Đề tài chờ duyệt
            </span>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {stats.projects?.pendingProjects?.toLocaleString() || 0}
            </h4>
          </div>
        </div>
      </div>

      {/* <!-- Approved Projects Metric Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-800">
          <CalenderIcon className="text-green-800 size-6 dark:text-green-200" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Đề tài đã duyệt
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats.projects?.approvedProjects?.toLocaleString() || 0}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Approved Projects Metric End --> */}

      {/* <!-- In Progress Projects Metric Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-800">
          <CalenderIcon className="text-purple-800 size-6 dark:text-purple-200" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Đề tài đang thực hiện
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats.projects?.inProgressProjects?.toLocaleString() || 0}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- In Progress Projects Metric End --> */}

      {/* <!-- Completed Projects Metric Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
        <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl dark:bg-emerald-800">
          <CalenderIcon className="text-emerald-800 size-6 dark:text-emerald-200" />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Đề tài hoàn thành
            </span>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {stats.projects?.completedProjects?.toLocaleString() || 0}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Completed Projects Metric End --> */}

      {/* <!-- Cancelled Projects Metric Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-800">
          <CalenderIcon className="text-red-800 size-6 dark:text-red-200" />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Đề tài bị hủy
            </span>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {stats.projects?.cancelledProjects?.toLocaleString() || 0}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Cancelled Projects Metric End --> */}
    </div>
  );
};

export default ProjectMetrics;
