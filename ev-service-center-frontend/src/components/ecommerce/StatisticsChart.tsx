"use client";
import React, { useEffect, useState } from "react";
// import Chart from "react-apexcharts";
// import { ApexOptions } from "apexcharts";
// import ChartTab from "../common/ChartTab";
import dynamic from "next/dynamic";
import { getDashboardStats, IDashboardStatistic } from "@/services/statisticService";
import { ApexOptions } from "apexcharts";

// Dynamically import the ReactApexChart component
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
      name: "Nhiệm vụ",
      data: stats.projects.monthlyProjects,
    },
    {
      name: "Nhiệm vụ hoàn thành",
      data: stats.projects.monthlyCompletedProjects,
    },
  ];

  const options = {
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
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
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
      ],
    },
    yaxis: [
      {
        title: {
          text: "Nhiệm vụ",
        },
      },
      {
        opposite: true,
        title: {
          text: "Nhiệm vụ hoàn thành",
        },
      },
    ],
    tooltip: {
      y: [
        {
          formatter: (value: number) => {
            return value.toLocaleString();
          },
        },
        {
          formatter: (value: number) => {
            return value.toLocaleString();
          },
        },
      ],
    },
    fill: {
      opacity: 1,
    },
    colors: ["#3C50E0", "#80CAEE"],
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div>
        <h3 className="text-xl font-semibold text-black dark:text-white">
          Thống kê Nhiệm vụ
        </h3>
      </div>

      <div className="mb-2">
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={options as ApexOptions}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default StatisticsChart;
