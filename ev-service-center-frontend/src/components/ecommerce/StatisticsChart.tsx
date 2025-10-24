"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getDashboardStats, IDashboardStatistic } from "@/services/statisticService";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const StatisticsChart = () => {
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

  const series = [
    {
      name: "Bookings",
      data: stats.monthlyBookings || [],
    },
    {
      name: "Revenue",
      data: stats.monthlyRevenue || [],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      fontFamily: "Roboto, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
    },
    yaxis: {
      title: {
        text: "Count",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toLocaleString();
        },
      },
    },
    colors: ["#465fff", "#10b981"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
      <div className="mb-5">
        <h3 className="text-title-md font-bold text-black dark:text-white">
          Monthly Statistics
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Bookings and Revenue trends
        </p>
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default StatisticsChart;