"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { StatusBadge } from "@/modules/orders/ui/components/status-badge";
import { User, Product } from "@/payload-types";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SellerOrdersView = () => {
  const trpc = useTRPC();
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data, isLoading, refetch } = useQuery(
    trpc.seller.getSellerOrders.queryOptions({ limit: 100, page: 1 }),
  );

  const updateStatus = useMutation(
    trpc.seller.updateOrderStatus.mutationOptions({
      onSuccess: () => {
        toast.success("Order status updated!");
        refetch();
      },
      onError: (err) => {
        toast.error("Failed to update status: " + err.message);
      },
    }),
  );

  const tabs = [
    "all",
    "pending",
    "confirmed",
    "processing",
    "dispatched",
    "delivered",
    "cancelled",
    "refunded",
  ];

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white min-h-screen">
        Loading orders...
      </div>
    );
  }

  const orders = data?.docs || [];

  const filteredOrders =
    activeTab === "all"
      ? orders
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orders.filter((o: any) => o.status === activeTab);

  return (
    <div className="min-h-screen bg-neutral-50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-medium mb-2">Seller Dashboard</h1>
        <p className="text-neutral-500 mb-8">
          Manage incoming orders for all your products.
        </p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-black text-white"
                  : "bg-white text-neutral-600 hover:bg-neutral-200 border border-neutral-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-600 font-medium border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-4 min-w-[120px]">Order ID & Date</th>
                  <th className="px-5 py-4 min-w-[200px]">Product</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4 min-w-[200px]">Delivery Address</th>
                  <th className="px-5 py-4 min-w-[160px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-neutral-500"
                    >
                      No orders found for this view.
                    </td>
                  </tr>
                ) : (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  filteredOrders.map((order: any) => {
                    const product = order.product as Product;
                    const customer = order.user as User;
                    const addr = order.deliveryAddress;
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-neutral-50/50 transition-colors"
                      >
                        <td className="px-5 py-4 align-top">
                          <p className="font-mono text-xs text-neutral-500 break-all mb-1">
                            #{String(order.id).slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-black line-clamp-2">
                            {product?.name || "Unknown Product"}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Qty: {order.quantity || 1}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium">
                            {customer?.username || "Guest"}
                          </p>
                          {customer?.email && (
                            <p className="text-xs text-neutral-500">
                              {customer.email}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 align-top font-semibold">
                          ₹
                          {(
                            (product?.price || 0) * (order.quantity || 1)
                          ).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-4 align-top">
                          {addr ? (
                            <div className="text-xs text-neutral-600 space-y-0.5">
                              <p className="font-medium text-black">
                                {addr.fullName}
                              </p>
                              <p className="line-clamp-2">
                                {addr.addressLine1} {addr.addressLine2}
                              </p>
                              <p>
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                              <p>{addr.phone}</p>
                            </div>
                          ) : (
                            <span className="text-xs italic text-neutral-400">
                              No address collected
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <Select
                            disabled={
                              updateStatus.isPending &&
                              updateStatus.variables?.orderId === order.id
                            }
                            value={order.status || "pending"}
                            onValueChange={(val) => {
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              updateStatus.mutate({
                                orderId: order.id,
                                status: val as any,
                              });
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs font-semibold focus:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">
                                Confirmed
                              </SelectItem>
                              <SelectItem value="processing">
                                Processing
                              </SelectItem>
                              <SelectItem value="dispatched">
                                Dispatched
                              </SelectItem>
                              <SelectItem value="delivered">
                                Delivered
                              </SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled
                              </SelectItem>
                              <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="mt-2">
                            <StatusBadge
                              status={order.status}
                              className="text-[10px] uppercase tracking-wider"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
