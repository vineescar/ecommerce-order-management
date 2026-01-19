import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useOrder } from '../hooks/useOrders';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { OrderFormData, ApiErrorResponse } from '../types';
import OrderForm from '../components/orders/OrderForm';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { products, isLoading: isLoadingProducts, error: productError } = useProducts();
  const { order, isLoading: isLoadingOrder, error: orderError } = useOrder(id);
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: OrderFormData): Promise<void> => {
    try {
      setIsSubmitting(true);

      if (isEditMode && id) {
        await api.put(`/orders/${id}`, {
          orderDescription: data.orderDescription,
          productIds: data.productIds,
        });
        showToast('success', 'Order updated successfully');
      } else {
        await api.post('/orders', {
          orderDescription: data.orderDescription,
          productIds: data.productIds,
        });
        showToast('success', 'Order created successfully');
      }

      navigate('/');
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      showToast('error', apiError.message || 'Failed to save order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    navigate('/');
  };

  // Show loading state when fetching order for edit mode
  if (isEditMode && isLoadingOrder) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show error if order not found in edit mode
  if (isEditMode && orderError) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <Alert type="error" message={orderError} />
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Go back to orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Order' : 'Create New Order'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode
              ? 'Update the order details below'
              : 'Fill in the details below to create a new order'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <OrderForm
            products={products}
            isLoadingProducts={isLoadingProducts}
            productError={productError}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            initialData={order}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;
