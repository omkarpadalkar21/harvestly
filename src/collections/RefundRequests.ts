import type { CollectionConfig } from 'payload';
import { isSuperAdmin, isSellerOrSuperAdmin } from "@/lib/access";

export const RefundRequests: CollectionConfig = {
  slug: 'refund-requests',
  admin: {
    useAsTitle: 'reason',
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  access: {
    create: ({ req }) => isSuperAdmin(req.user), // customers submit via app UI only
    read: ({ req }) => !!req.user,
    update: ({ req }) => isSellerOrSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  fields: [
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'reason', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Processed', value: 'processed' },
      ],
    },
    { name: 'sellerNote', type: 'textarea' },
    { name: 'stripeRefundId', type: 'text' },
  ],
  timestamps: true,
};
