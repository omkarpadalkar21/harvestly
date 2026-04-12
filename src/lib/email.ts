import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "mock-key");
const SENDER_EMAIL = "orders@harvestly.com";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendOrderConfirmationToCustomer(order: any, customerEmail: string) {
  try {
    const amount = (order.quantity || 1);
    const productName = order.name || "Unknown Product";
    const status = order.status;
    const addr = order.deliveryAddress;
    
    let addrText = "No delivery address provided.";
    if (addr) {
      addrText = `${addr.fullName}, ${addr.addressLine1}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
    }

    await resend.emails.send({
      from: SENDER_EMAIL,
      to: customerEmail,
      subject: `Order Confirmation - #${String(order.id).slice(-8).toUpperCase()}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order for <strong>${amount}x ${productName}</strong> has been received and is currently <strong>${status}</strong>.</p>
        <h3>Delivery Address:</h3>
        <p>${addrText}</p>
        <p>We will notify you when the seller updates the status of your order.</p>
      `,
    });
    console.log(`Email sent to customer ${customerEmail} for order ${order.id}`);
  } catch (error) {
    console.error("Failed to send order confirmation to customer", error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendNewOrderAlertToSeller(order: any, sellerEmail: string) {
  try {
    const amount = (order.quantity || 1);
    const productName = order.name || "Unknown Product";
    
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: sellerEmail,
      subject: `New Order Received! Action Required - #${String(order.id).slice(-8).toUpperCase()}`,
      html: `
        <h1>You have a new order!</h1>
        <p>A customer has just ordered <strong>${amount}x ${productName}</strong>.</p>
        <p>Please log in to your Seller Dashboard to view the details and process this order.</p>
      `,
    });
    console.log(`Email sent to seller ${sellerEmail} for order ${order.id}`);
  } catch (error) {
    console.error("Failed to send new order alert to seller", error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendOrderStatusUpdateToCustomer(order: any, customerEmail: string, newStatus: string) {
  try {
    const amount = (order.quantity || 1);
    const productName = order.name || "Unknown Product";
    
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: customerEmail,
      subject: `Order Status Update: ${newStatus.toUpperCase()} - #${String(order.id).slice(-8).toUpperCase()}`,
      html: `
        <h1>Order Update</h1>
        <p>The status of your order for <strong>${amount}x ${productName}</strong> has been updated to <strong>${newStatus.toUpperCase()}</strong>.</p>
        <p>Log in to your account to view more details.</p>
      `,
    });
    console.log(`Email sent to customer ${customerEmail} regarding status update to ${newStatus} for order ${order.id}`);
  } catch (error) {
    console.error("Failed to send status update email to customer", error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendOrderAcceptedToCustomer(order: any, customerEmail: string, etaFormatted: string) {
  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: customerEmail,
      subject: `Your order has been accepted! – #${String(order.id).slice(-8).toUpperCase()}`,
      html: `
        <h1>Great news — your order is confirmed!</h1>
        <p>Your order for <strong>${order.quantity ?? 1}x ${order.name}</strong> has been accepted by the seller.</p>
        <h3>Estimated Delivery</h3>
        <p><strong>${etaFormatted}</strong></p>
        <p>You'll receive another update when your order is dispatched.</p>
      `,
    });
    console.log(`Acceptance email sent to ${customerEmail} for order ${order.id}`);
  } catch (e) {
    console.error('Failed to send order acceptance email:', e);
  }
}
