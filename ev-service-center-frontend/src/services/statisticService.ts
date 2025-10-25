import { httpClient } from "@/lib/httpClient";

export interface IDashboardStatistic {
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  totalParts: number;
  totalQuantity: number;
  monthlyBookings: number[];
  monthlyRevenue: number[];
  monthlyUsers: number[];
  monthlyParts: number[];
  monthlyQuantities: number[];
}

export const getDashboardStats = async (): Promise<IDashboardStatistic> => {
  const res = await httpClient.get<{ data: IDashboardStatistic; message: string }>("/api/finance/stats/dashboard");
  return res.data.data;
};
