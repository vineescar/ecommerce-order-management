import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import api from '../services/api';
import { Order, ApiErrorResponse } from '../types';
import OrderList from '../components/orders/OrderList';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, isLoading, error, refetch, clearError } = useOrders();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleCreateOrder = (): void => {
    navigate('/orders/create');
  };

  const handleEditOrder = (order: Order): void => {
    navigate(`/orders/${order.id}/edit`);
  };

  const handleDeleteClick = (id: number): void => {
    setOrderToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!orderToDelete) return;

    try {
      setIsDeleting(true);
      await api.delete(`/orders/${orderToDelete}`);
      showToast('success', 'Order deleted successfully');
      setDeleteModalOpen(false);
      setOrderToDelete(null);
      refetch();
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      showToast('error', apiError.message || 'Failed to delete order');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = (): void => {
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-2 text-gray-600">Manage your orders and track their status</p>
        </div>

        {/* Error Alert */}
        {error && <Alert type="error" message={error} onClose={clearError} />}

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Search */}
            <div className="w-full sm:w-96">
              <Input
                placeholder="Search by Order ID or Description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Add Order Button */}
            <Button variant="primary" onClick={handleCreateOrder}>
              + Add Order
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <OrderList
            orders={orders}
            isLoading={isLoading}
            onEdit={handleEditOrder}
            onDelete={handleDeleteClick}
            searchTerm={debouncedSearchTerm}
          />
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={handleDeleteCancel}
          title="Delete Order"
        >
          <div className="mt-2">
            <p className="text-gray-600">
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default OrdersPage;
