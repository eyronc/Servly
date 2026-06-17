import db from '../db.js';

// Get all products
export const getProducts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY category, name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
};

// POST /api/products — create a product
export const createProduct = async (req, res) => {
  const { name, description, price, image_url, category } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, parseFloat(price), image_url || null, category]
    );
    res.status(201).json({ message: 'Product created', productId: result.insertId });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// PUT /api/products/:id — update a product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }
  try {
    const [result] = await db.query(
      'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category = ? WHERE id = ?',
      [name, description || null, parseFloat(price), image_url || null, category, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// DELETE /api/products/:id — delete a product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
