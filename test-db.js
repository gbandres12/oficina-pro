const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const result = await pool.query(`SELECT id FROM "ServiceOrder" LIMIT 1`);
  if (result.rows.length === 0) {
    console.log("No orders");
    return;
  }
  const id = result.rows[0].id;
  console.log("Testing OS ID:", id);
  
  try {
     const orderQuery = `
            SELECT 
                so.*,
                c.name as "clientName", c.phone as "clientPhone", c.document as "clientDocument", c.email as "clientEmail",
                v.plate as "vehiclePlate", v.brand as "vehicleBrand", v.model as "vehicleModel", v.year as "vehicleYear", v.vin as "vehicleVin"
            FROM "ServiceOrder" so
            LEFT JOIN "Client" c ON so."clientId" = c.id
            LEFT JOIN "Vehicle" v ON so."vehicleId" = v.id
            WHERE so.id = $1
        `;
        const orderRes = await pool.query(orderQuery, [id]);
        console.log("Order found:", !!orderRes.rows[0]);
  } catch (err) {
      console.error("Error running query:", err);
  }
  process.exit(0);
}
run();
