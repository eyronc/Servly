import db from '../db.js';

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    // mysql2 automatically parses JSON columns on retrieval in most environments,
    // but we ensure it is parsed just in case.
    const orders = rows.map(row => {
      let parsedItems = row.items;
      if (typeof row.items === 'string') {
        try {
          parsedItems = JSON.parse(row.items);
        } catch (e) {
          parsedItems = [];
        }
      }
      return { ...row, items: parsedItems };
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  const { customer_name, table_number, items, total_amount, payment_status, order_status } = req.body;

  if (!customer_name || !items || !Array.isArray(items) || items.length === 0 || total_amount === undefined) {
    return res.status(400).json({ error: 'Invalid order details. Make sure customer_name, items (array), and total_amount are provided.' });
  }

  try {
    const itemsJson = JSON.stringify(items);
    const payStatus = payment_status || 'pending';
    const ordStatus = order_status || 'pending';
    const tableNum = parseInt(table_number, 10) || 0;

    const [result] = await db.query(
      'INSERT INTO orders (customer_name, table_number, items, total_amount, payment_status, order_status) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_name, tableNum, itemsJson, total_amount, payStatus, ordStatus]
    );

    res.status(201).json({
      message: 'Order created successfully',
      orderId: result.insertId,
      order: {
        id: result.insertId,
        customer_name,
        table_number: tableNum,
        items,
        total_amount,
        payment_status: payStatus,
        order_status: ordStatus,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

// Update order / payment status
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { payment_status, order_status } = req.body;

  if (!payment_status && !order_status) {
    return res.status(400).json({ error: 'Provide payment_status or order_status to update.' });
  }

  try {
    // Build query dynamically based on fields provided
    const updates = [];
    const values = [];

    if (payment_status) {
      if (!['pending', 'paid', 'failed'].includes(payment_status)) {
        return res.status(400).json({ error: 'Invalid payment_status. Must be pending, paid, or failed.' });
      }
      updates.push('payment_status = ?');
      values.push(payment_status);
    }

    if (order_status) {
      if (!['pending', 'preparing', 'completed'].includes(order_status)) {
        return res.status(400).json({ error: 'Invalid order_status. Must be pending, preparing, or completed.' });
      }
      updates.push('order_status = ?');
      values.push(order_status);
    }

    values.push(id);

    const query = `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
