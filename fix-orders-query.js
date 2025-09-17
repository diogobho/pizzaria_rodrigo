const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Encontrar e substituir a query de listagem
const oldQuery = `app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(\`
      SELECT o.*, c.name as "customerName", c.phone as "customerPhone", c.address as "customerAddress",
             dp.name as delivery_person_name
      FROM orders o
      JOIN customers c ON o."customerId" = c.id
      LEFT JOIN delivery_persons dp ON o."deliveryPersonId" = dp.id
      ORDER BY o."createdAt" DESC
    \`);
    res.json(result.rows);`;

const newQuery = `app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(\`
      SELECT o.*, 
             json_build_object('name', c.name, 'phone', c.phone, 'address', c.address) as customer,
             dp.name as delivery_person_name
      FROM orders o
      JOIN customers c ON o."customerId" = c.id
      LEFT JOIN delivery_persons dp ON o."deliveryPersonId" = dp.id
      ORDER BY o."createdAt" DESC
    \`);
    res.json(result.rows);`;

content = content.replace(oldQuery, newQuery);
fs.writeFileSync('server.js', content);
console.log('Query corrigida!');
