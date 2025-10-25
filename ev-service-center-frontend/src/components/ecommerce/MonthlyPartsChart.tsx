"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getDashboardStats, IDashboardStatistic } from "@/services/statisticService";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyPartsChart() {
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

  const options: ApexOptions = {
    colors: ["#8b5cf6", "#06b6d4"],
    chart: {
      fontFamily: "Roboto, sans-serif",
      type: "line",
      height: 350,
      sparkline: {
        enabled: false,
      },
      toolbar: {
        show: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 4,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
    },
    yaxis: {
      title: {
        text: "Số lượng",
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toLocaleString();
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
  };

  const series = [
    {
      name: "Số loại phụ tùng",
      data: stats.monthlyParts || [],
    },
    {
      name: "Tổng số lượng",
      data: stats.monthlyQuantities || [],
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-black dark:text-white">
          Phụ tùng
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Xu hướng sử dụng và quản lý phụ tùng
        </p>
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={350}
      />
    </div>
  );
}
