import type { Metadata } from "next";
import React from "react";
import MonthlyUsersChart from "@/components/ecommerce/MonthlyUsersChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import UserMetrics from "@/components/ecommerce/UserMetrics";

export const metadata: Metadata = {
  title: "EV Service Center Dashboard",
  description: "EV Service Center Management Dashboard",
};

export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <UserMetrics />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12">
        <MonthlyUsersChart />
      </div>
    </div>
  );
}