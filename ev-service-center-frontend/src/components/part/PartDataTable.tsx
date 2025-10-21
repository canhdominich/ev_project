"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { BasicTableProps } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import { 
  CreatePartDto, 
  deletePart, 
  updatePart, 
  Part, 
  createPart,
  updateStock,
  UpdateStockDto
} from "@/services/partService";
import toast from "react-hot-toast";

interface PartDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: Part[];
}

export default function PartDataTable({ headers, items, onRefresh }: PartDataTableProps) {
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreatePartDto>({
    name: "",
    partNumber: "",
    quantity: 0,
    minStock: 0,
  });
  const [stockFormData, setStockFormData] = useState<UpdateStockDto>({
    changeType: 'IN',
    quantity: 0,
    reason: '',
  });
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPart(null);
      setFormData({
        name: "",
        partNumber: "",
        quantity: 0,
        minStock: 0,
      });
    }
  }, [isOpen]);

  // Update form data when selected part changes
  useEffect(() => {
    if (selectedPart) {
      setFormData({
        name: selectedPart.name,
        partNumber: selectedPart.partNumber,
        quantity: selectedPart.quantity,
        minStock: selectedPart.minStock,
      });
    }
  }, [selectedPart]);

  const handleEdit = (part: Part) => {
    setSelectedPart(part);
    openModal();
  };

  const handleStockUpdate = (part: Part) => {
    setSelectedPart(part);
    setStockFormData({
      changeType: 'IN',
      quantity: 0,
      reason: '',
    });
    setIsStockModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedPart?.id) {
        await updatePart(selectedPart.id, formData);
        toast.success("Cập nhật linh kiện thành công");
      } else {
        await createPart(formData);
        toast.success("Thêm linh kiện thành công");
      }
      closeModal();
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (selectedPart?.id ? "Không thể cập nhật linh kiện" : "Không thể thêm linh kiện"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedPart) return;

    try {
      setIsSubmitting(true);
      await updateStock(selectedPart.id, stockFormData);
      toast.success(`Cập nhật kho thành công: ${stockFormData.changeType === 'IN' ? 'Nhập' : 'Xuất'} ${stockFormData.quantity} sản phẩm`);
      setIsStockModalOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật kho");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa linh kiện này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deletePart(id);
      toast.success("Xóa linh kiện thành công");
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa linh kiện");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0) return { text: "Hết hàng", color: "text-red-500" };
    if (quantity <= minStock) return { text: "Sắp hết", color: "text-yellow-500" };
    return { text: "Còn hàng", color: "text-green-500" };
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="mb-6 px-5 flex items-start gap-3 modal-footer sm:justify-start">
        <button
          onClick={openModal}
          type="button"
          className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
        >
          Thêm linh kiện
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1200px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell
                    key={header.key}
                    isHeader
                    className={index === 0 || index === headers.length - 1 ? "px-5 py-3 font-medium text-start text-theme-sm dark:text-gray-400" : "px-5 py-3 font-medium text-center text-theme-sm dark:text-gray-400"}
                  >
                    {header.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {items.map((item: Part) => {
                const stockStatus = getStockStatus(item.quantity, item.minStock);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-center">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {item.partNumber}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      <span className={`font-medium ${stockStatus.color}`}>
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {item.minStock}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center text-theme-sm">
                      <span className={`font-medium ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <div className="flex items-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleStockUpdate(item)}
                          className="btn btn-info btn-update-event flex w-full justify-center rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-white hover:bg-blue-600 sm:w-auto"
                        >
                          Kho
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-error btn-delete-event flex w-full justify-center rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white hover:bg-red-600 sm:w-auto"
                        >
                          Xóa
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Part Form Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedPart ? "Chỉnh sửa linh kiện" : "Thêm linh kiện"}
            </h5>
          </div>
          <div className="mt-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Tên linh kiện *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="Nhập tên linh kiện"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Mã linh kiện *
                </label>
                <input
                  id="partNumber"
                  type="text"
                  value={formData.partNumber}
                  onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="Nhập mã linh kiện"
                  required
                />
              </div>
              {!selectedPart && (
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Số lượng ban đầu
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity || 0}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập số lượng ban đầu"
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Tồn kho tối thiểu
                </label>
                <input
                  id="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock || 0}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="Nhập tồn kho tối thiểu"
                />
              </div>
            </form>
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
              {isSubmitting ? "Đang xử lý..." : selectedPart ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Stock Update Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        className="max-w-[500px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Cập nhật kho: {selectedPart?.name}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tồn kho hiện tại: <span className="font-medium">{selectedPart?.quantity}</span>
            </p>
          </div>
          <div className="mt-8">
            <form onSubmit={handleStockSubmit}>
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Loại thay đổi *
                </label>
                <select
                  value={stockFormData.changeType}
                  onChange={(e) => setStockFormData({ ...stockFormData, changeType: e.target.value as 'IN' | 'OUT' })}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  required
                >
                  <option value="IN">Nhập kho</option>
                  <option value="OUT">Xuất kho</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Số lượng *
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockFormData.quantity || 0}
                  onChange={(e) => setStockFormData({ ...stockFormData, quantity: parseInt(e.target.value) || 0 })}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="Nhập số lượng"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Lý do (tùy chọn)
                </label>
                <textarea
                  value={stockFormData.reason || ''}
                  onChange={(e) => setStockFormData({ ...stockFormData, reason: e.target.value })}
                  className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  rows={3}
                  placeholder="Nhập lý do thay đổi kho"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={() => setIsStockModalOpen(false)}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Đóng
            </button>
            <button
              onClick={handleStockSubmit}
              type="button"
              disabled={isSubmitting}
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {isSubmitting ? "Đang xử lý..." : "Cập nhật kho"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}