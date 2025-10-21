import { httpClient } from "@/lib/httpClient";

export interface IDashboardStatistic {
  users: {
    totalUsers: number;
    students: number;
    lecturers: number;
    departmentHeads: number;
    facultyDeans: number;
    councils: number;
    admins: number;
    monthlyUsers: number[];
  };
  projects: {
    totalProjects: number;
    draftProjects: number;
    pendingProjects: number;
    approvedProjects: number;
    inProgressProjects: number;
    completedProjects: number;
    cancelledProjects: number;
    monthlyProjects: number[];
    monthlyCompletedProjects: number[];
  };
  academicStructure: {
    totalFaculties: number;
    totalDepartments: number;
    totalMajors: number;
  };
  generatedAt: string; // ISO date string
}

export const getDashboardStats = async (): Promise<IDashboardStatistic> => {
  const res = await httpClient.get<IDashboardStatistic>("/statistics");
  return res.data;
};
