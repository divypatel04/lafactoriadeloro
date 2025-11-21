// Initialize Stripe only if key is available
let stripe;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key_here_get_from_stripe_dashboard') {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const Order = require('../models/Order.model');
const emailService = require('../services/emailService');

/**
 * Create Stripe Checkout Session (for hosted payment page)
 * @route POST /api/payment/create-checkout-session
 * @access Private
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please add STRIPE_SECRET_KEY to environment variables.'
      });
    }

    const { orderId, amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Get order details
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create line items from order
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: item.productName,
          description: item.productSku,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if applicable
    if (order.pricing.shipping > 0) {
      lineItems.push({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Shipping',
            description: 'Delivery charges',
          },
          unit_amount: Math.round(order.pricing.shipping * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as a line item
    if (order.pricing.tax > 0) {
      lineItems.push({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Tax',
            description: 'Sales tax',
          },
          unit_amount: Math.round(order.pricing.tax * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order-success/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?canceled=true`,
      customer_email: order.shippingAddress.email || req.user.email,
      metadata: {
        orderId: orderId,
        userId: req.user._id.toString()
      }
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
};

/**
 * Create Stripe Payment Intent
 * @route POST /api/payment/create-intent
 * @access Private
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please add STRIPE_SECRET_KEY to environment variables.'
      });
    }

    const { amount, currency = 'usd', orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: orderId || 'pending',
        userId: req.user._id.toString()
      }
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

/**
 * Confirm Payment
 * @route POST /api/payment/confirm
 * @access Private
 */
exports.confirmPayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please add STRIPE_SECRET_KEY to environment variables.'
      });
    }

    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID is required'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order with payment information
      if (orderId) {
        const order = await Order.findById(orderId);
        
        if (order) {
          order.paymentInfo = {
            method: 'card',
            transactionId: paymentIntent.id,
            status: 'paid',
            paidAt: new Date(),
            amount: paymentIntent.amount / 100 // Convert back from cents
          };
          order.isPaid = true;
          order.paidAt = new Date();
          
          await order.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};

/**
 * Handle Stripe Webhook
 * @route POST /api/payment/webhook
 * @access Public (Stripe webhook)
 */
exports.handleWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Payment service not configured'
    });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Update order status when checkout session is completed
      if (session.metadata.orderId) {
        try {
          const order = await Order.findById(session.metadata.orderId);
          if (order) {
            order.paymentInfo = {
              method: 'card',
              transactionId: session.payment_intent,
              status: 'paid',
              paidAt: new Date(),
              amount: session.amount_total / 100
            };
            order.isPaid = true;
            order.paidAt = new Date();
            order.status = 'processing';
            await order.save();
            
            // Send order confirmation email
            try {
              await emailService.sendOrderConfirmation(order, {
                firstName: order.shippingAddress.firstName,
                lastName: order.shippingAddress.lastName,
                email: session.customer_email || order.shippingAddress.email
              });
            } catch (emailError) {
              console.error('Failed to send order confirmation email:', emailError);
            }
          }
        } catch (error) {
          console.error('Error updating order from checkout session:', error);
        }
      }
      break;

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Update order status
      if (paymentIntent.metadata.orderId) {
        try {
          const order = await Order.findById(paymentIntent.metadata.orderId);
          if (order) {
            order.paymentInfo = {
              method: 'card',
              transactionId: paymentIntent.id,
              status: 'paid',
              paidAt: new Date(),
              amount: paymentIntent.amount / 100
            };
            order.isPaid = true;
            order.paidAt = new Date();
            await order.save();
            
            // Send order confirmation email
            try {
              await emailService.sendOrderConfirmation(order, {
                firstName: order.shippingAddress.firstName,
                lastName: order.shippingAddress.lastName,
                email: order.user?.email || order.shippingAddress.email
              });
            } catch (emailError) {
              console.error('Failed to send order confirmation email:', emailError);
            }
          }
        } catch (error) {
          console.error('Error updating order:', error);
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      // Update order with failed payment
      if (failedPayment.metadata.orderId) {
        try {
          const order = await Order.findById(failedPayment.metadata.orderId);
          if (order) {
            order.paymentInfo = {
              method: 'card',
              transactionId: failedPayment.id,
              status: 'failed',
              error: failedPayment.last_payment_error?.message || 'Payment failed'
            };
            await order.save();
            
            // Send payment failed notification
            try {
              await emailService.sendPaymentFailed(order, {
                firstName: order.shippingAddress.firstName,
                lastName: order.shippingAddress.lastName,
                email: order.user?.email || order.shippingAddress.email
              }, order.paymentInfo.error);
            } catch (emailError) {
              console.error('Failed to send payment failed email:', emailError);
            }
          }
        } catch (error) {
          console.error('Error updating failed order:', error);
        }
      }
      break;

    default:
      // Unhandled webhook event type
      break;
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};

/**
 * Get Payment Intent
 * @route GET /api/payment/intent/:id
 * @access Private
 */
exports.getPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured'
      });
    }

    const { id } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    res.status(200).json({
      success: true,
      data: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        created: paymentIntent.created
      }
    });
  } catch (error) {
    console.error('Get payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment intent',
      error: error.message
    });
  }
};

/**
 * Verify Checkout Session and Update Order
 * @route POST /api/payment/verify-session
 * @access Private
 */
exports.verifySession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured'
      });
    }

    const { sessionId, orderId } = req.body;

    if (!sessionId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and Order ID are required'
      });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Update order if payment was successful
    if (session.payment_status === 'paid') {
      const order = await Order.findById(orderId);
      
      if (order) {
        order.paymentInfo = {
          method: 'card',
          transactionId: session.payment_intent,
          paidAt: new Date()
        };
        order.paymentStatus = 'paid';
        order.orderStatus = 'processing';
        await order.save();

        res.status(200).json({
          success: true,
          message: 'Payment verified and order updated',
          data: {
            paymentStatus: session.payment_status,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${session.payment_status}`
      });
    }
  } catch (error) {
    console.error('Verify session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment session',
      error: error.message
    });
  }
};

/**
 * Get publishable key
 * @route GET /api/payment/config
 * @access Public
 */
exports.getConfig = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    }
  });
};
