import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Product, OrderFormData, OrderWithProducts } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import Alert from '../common/Alert';

interface OrderFormProps {
  products: Product[];
  isLoadingProducts: boolean;
  productError: string | null;
  onSubmit: (data: OrderFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: OrderWithProducts | null;
}

const OrderForm: React.FC<OrderFormProps> = ({
  products,
  isLoadingProducts,
  productError,
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormData>({
    defaultValues: {
      orderDescription: '',
      productIds: [],
    },
  });

  const selectedProducts = watch('productIds') || [];

  // Set initial data when editing
  useEffect(() => {
    if (initialData) {
      setValue('orderDescription', initialData.order_description);
      setValue(
        'productIds',
        initialData.products.map((p) => p.id)
      );
    }
  }, [initialData, setValue]);

  const handleProductToggle = (productId: number): void => {
    const currentSelected = selectedProducts;
    if (currentSelected.includes(productId)) {
      setValue(
        'productIds',
        currentSelected.filter((id) => id !== productId)
      );
    } else {
      setValue('productIds', [...currentSelected, productId]);
    }
  };

  const onFormSubmit = async (data: OrderFormData): Promise<void> => {
    await onSubmit(data);
  };

  if (isLoadingProducts) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (productError) {
    return <Alert type="error" message={productError} />;
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Order Description */}
      <div>
        <Input
          label="Order Description"
          placeholder="Enter order description"
          {...register('orderDescription', {
            required: 'Order description is required',
            maxLength: {
              value: 100,
              message: 'Order description must not exceed 100 characters',
            },
          })}
          error={errors.orderDescription?.message}
        />
      </div>

      {/* Product Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Products
        </label>
        {errors.productIds && (
          <p className="mb-2 text-sm text-red-600">{errors.productIds.message}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductToggle(product.id)}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all duration-200
                ${
                  selectedProducts.includes(product.id)
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start">
                <div
                  className={`
                    w-5 h-5 rounded border-2 mr-3 mt-0.5 flex items-center justify-center
                    ${
                      selectedProducts.includes(product.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }
                  `}
                >
                  {selectedProducts.includes(product.id) && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.product_name}</p>
                  <p className="text-sm text-gray-500">{product.product_description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <input
          type="hidden"
          {...register('productIds', {
            validate: (value) =>
              (value && value.length > 0) || 'Please select at least one product',
          })}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {initialData ? 'Update Order' : 'Book Order'}
        </Button>
      </div>
    </form>
  );
};

export default OrderForm;
