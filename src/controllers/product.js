const getAllProduct = (req, res) => {
  res.json({ message: 'Test Get All Product' });
};

const deleteAllProduct = (req, res) => {
  res.json({ message: 'Test Delete New Product' });
};

const getProduct = (req, res) => {
  res.json({ message: 'Test Get Product' });
};

const newProduct = (req, res) => {
  res.json({ message: 'Test New Product' });
};

const deleteProduct = (req, res) => {
  res.json({ message: 'Test Delete Product' });
};

module.exports = {
  getAllProduct,
  deleteAllProduct,
  getProduct,
  newProduct,
  deleteProduct
};