export interface Header {
    key: string;
    title: string;
}

export interface RowData {
    id: number;
    [key: string]: string | number | boolean | null | undefined | Array<unknown> | Record<string, unknown> | object;
}

export interface BasicTableProps {
    headers: Header[];
    items: RowData[];
}
export interface Team {
    images: string[];
}

export interface User extends RowData {
    id: number;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    userRoles?: Array<{
        role: {
            name: string;
        };
    }>;
}

export interface Faculty extends RowData {
    id: number;
    code: string;
    name: string;
    description?: string;
    schoolId: number;
    school?: School;
    createdAt: string;
    updatedAt: string;
}

export interface School extends RowData {
    id: number;
    code: string;
    name: string;
    description?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AcademicYear extends RowData {
    id: number;
    code: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface Department extends RowData {
    id: number;
    code: string;
    name: string;
    description?: string;
    facultyId: number;
    faculty?: Faculty;
    schoolId: number;
    school?: School;
    createdAt: string;
    updatedAt: string;
}

export interface Major extends RowData {
    id: number;
    code: string;
    name: string;
    description?: string;
    departmentId: number;
    department?: Department;
    facultyId: number;
    faculty?: Faculty;
    schoolId: number;
    school?: School;
    createdAt: string;
    updatedAt: string;
}

export interface TermMilestone {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    termId: string;
    orderIndex: number;
    isRequired: boolean;
    createdAt: string;
    updatedAt: string;
    term?: {
        id: string;
        name: string;
    };
    status: TermMilestoneStatus;
}

export type TermStatus = 'open' | 'closed' | 'archived';

export interface Term extends RowData {
    id: number;
    code: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: TermStatus;
    academicYearId?: number;
    academicYear?: AcademicYear;
    termMilestones: TermMilestone[];
    createdAt: string;
    updatedAt: string;
}

export type TermMilestoneStatus = 'active' | 'inactive';

export interface IRole {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }
  
export interface IUserRole {
    id: string;
    userId: string;
    roleId: string;
    createdAt: string;
    updatedAt: string;
    role: IRole;
}

 export interface IMilestoneSubmissions {
  id: string;
  milestoneId: string;
  submittedByUser: User;
  submittedBy: string;
  submittedAt: string; // ISO datetime
  note: string;
  fileUrl: string;
  version: number;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

// Council types
export interface CouncilMember {
    id: number;
    code: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    roleInCouncil?: string;
}

export type CouncilStatus = 'active' | 'inactive' | 'archived';

export interface Council extends RowData {
    id: number;
    name: string;
    description?: string;
    defenseAddress?: string;
    status: CouncilStatus;
    facultyId?: number;
    faculty?: Faculty | null;
    createdAt: string;
    updatedAt: string;
    members: CouncilMember[];
}

export interface CreateCouncilDto {
    name: string;
    description?: string;
    defenseAddress?: string;
    status?: CouncilStatus;
    facultyId?: number;
    memberIds: number[];
}

export interface UpdateCouncilDto {
    name?: string;
    description?: string;
    defenseAddress?: string;
    status?: CouncilStatus;
    facultyId?: number;
    memberIds?: number[];
}
  