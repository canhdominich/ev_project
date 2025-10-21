import type { Metadata } from "next";
import React from "react";
// import MonthlyUsersChart from "@/components/ecommerce/MonthlyUsersChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import UserMetrics from "@/components/ecommerce/UserMetrics";
import ProjectMetrics from "@/components/ecommerce/ProjectMetrics";
import MonthlyUsersChart from "@/components/ecommerce/MonthlyUsersChart";

export const metadata: Metadata = {
  title:
    "EduResearch Hub",
  description: "Phần mềm quản lý bảo dưỡng xe điện cho trung tâm dịch vụ",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* <div className="col-span-12">
        <ProjectMetrics />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12">
        <UserMetrics />
      </div>

      <div className="col-span-12">
        <MonthlyUsersChart />
      </div> */}
    </div>
  );
}
