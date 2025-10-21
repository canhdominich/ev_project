"use client";
import React, { useState, useEffect } from "react";
import { TableCell, TableRow } from "../ui/table";
import { BasicTableProps, Header, Faculty, School } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import { CreateFacultyDto, createFaculty, deleteFaculty, updateFaculty, UpdateFacultyDto } from "@/services/facultyService";
import { getSchools } from "@/services/schoolService";
import { toast } from "react-hot-toast";
import SearchableDataTable from "../common/SearchableDataTable";
import { PaginationInfo } from "../common/Pagination";

interface FacultyDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: Faculty[];
  headers: Header[];
  searchTerm?: string;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

export default function FacultyDataTable({ 
  headers, 
  items, 
  onRefresh, 
  searchTerm = "", 
  onSearch,
  isSearching = false,
  pagination,
  onPageChange,
  onItemsPerPageChange
}: FacultyDataTableProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [formData, setFormData] = useState<CreateFacultyDto | UpdateFacultyDto>({
    name: "",
    code: "",
    description: "",
    schoolId: undefined,
  });
  const { isOpen, openModal, closeModal } = useModal();

  // Load schools when component mounts
  useEffect(() => {
    const loadSchools = async () => {
      try {
        setIsLoadingSchools(true);
        const response = await getSchools({ limit: 1000 }); // Get all schools
        setSchools(response.data);
      } catch (error) {
        console.error('Error loading schools:', error);
        toast.error('Không thể tải danh sách trường');
      } finally {
        setIsLoadingSchools(false);
      }
    };
    
    loadSchools();
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFaculty(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        schoolId: undefined,
      });
    }
  }, [isOpen]);

  // Update form data when selected Faculty changes
  useEffect(() => {
    if (selectedFaculty) {
      setFormData({
        name: selectedFaculty.name,
        code: selectedFaculty.code,
        description: selectedFaculty.description || "",
        schoolId: selectedFaculty.schoolId,
      });
    }
  }, [selectedFaculty]);

  const handleEdit = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation
    if (!formData.name?.trim()) {
      toast.error("Vui lòng nhập tên khoa");
      return;
    }
    if (!formData.code?.trim()) {
      toast.error("Vui lòng nhập mã khoa");
      return;
    }
    // Chỉ validate schoolId khi thêm mới khoa
    if (!selectedFaculty && !formData.schoolId) {
      toast.error("Vui lòng chọn trường");
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedFaculty?.id) {
        // Khi chỉnh sửa, đảm bảo schoolId được giữ nguyên
        const updateData = {
          ...formData,
          schoolId: selectedFaculty.schoolId,
        } as UpdateFacultyDto;
        await updateFaculty(selectedFaculty.id.toString(), updateData);
        toast.success("Cập nhật khoa thành công");
      } else {
        await createFaculty(formData as CreateFacultyDto);
        toast.success("Thêm khoa thành công");
      }
      closeModal();
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = selectedFaculty?.id ? "Không thể cập nhật khoa" : "Không thể thêm khoa";
      
      // Try to get specific error message
      if (error instanceof Error && error.message) {
        toast.error(`${errorMessage}: ${error.message}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa khoa này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteFaculty(id.toString());
      toast.success("Xóa khoa thành công");
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleDelete:', error);
      
      let errorMessage = "Không thể xóa khoa";
      
      // Handle constraint violation error
      if (error instanceof Error && error.message) {
        if (error.message.includes("Không thể xóa khoa này vì đang được sử dụng trong:")) {
          errorMessage = error.message;
          toast.error(errorMessage, {
            duration: 6000, // Show longer for constraint errors
          });
        } else {
          toast.error(`${errorMessage}: ${error.message}`);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render row function
  const renderRow = (faculty: Faculty) => (
    <TableRow key={faculty.id}>
      <TableCell className="px-5 py-4 sm:px-6 text-start">
        <div className="flex items-center gap-3">
          <div>
            <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
              {faculty.name}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {faculty.code}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {faculty.description || "Không có mô tả"}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {faculty.school?.name || "Chưa có trường"}
          </span>
          {faculty.school?.code && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {faculty.school.code}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {new Date(faculty.createdAt).toLocaleString('vi-VN')}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {new Date(faculty.updatedAt).toLocaleString('vi-VN')}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEdit(faculty)}
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            Sửa
          </button>
          <button
            onClick={() => handleDelete(faculty.id)}
            className="btn btn-error btn-delete-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
          >
            Xóa
          </button>
        </div>
      </TableCell>
    </TableRow>
  );

  // Action button
  const actionButton = (
    <button
      onClick={openModal}
      type="button"
      className="btn btn-success btn-update-event flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
    >
      Thêm khoa
    </button>
  );

  return (
    <>
      <SearchableDataTable
        headers={headers}
        items={items}
        renderRow={renderRow}
        searchTerm={searchTerm}
        onSearch={onSearch}
        searchPlaceholder="Tìm kiếm theo tên khoa..."
        isSearching={isSearching}
        pagination={pagination}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        actionButton={actionButton}
      />

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedFaculty ? "Chỉnh sửa khoa" : "Thêm khoa"}
            </h5>
          </div>
          <div className="mt-8">
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Tên khoa <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Nhập tên khoa"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Mã khoa <span className="text-red-500">*</span>
              </label>
              <input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="dark:bg-gray-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Nhập mã khoa"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Trường {!selectedFaculty && <span className="text-red-500">*</span>}
              </label>
              <select
                id="schoolId"
                value={formData.schoolId || ""}
                onChange={(e) => setFormData({ ...formData, schoolId: e.target.value ? Number(e.target.value) : undefined })}
                className="dark:bg-gray-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                disabled={isLoadingSchools || !!selectedFaculty}
              >
                <option value="">Chọn trường</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name} ({school.code})
                  </option>
                ))}
              </select>
              {selectedFaculty && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Không thể thay đổi trường khi chỉnh sửa khoa
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Mô tả
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="dark:bg-gray-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Nhập mô tả khoa (không bắt buộc)"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Đóng
            </button>
            <button
              onClick={handleSubmit}
              type="button"
              disabled={isSubmitting}
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {isSubmitting ? "Đang xử lý..." : selectedFaculty ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
} 