const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const schema = require("./schema");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

db.query = {
  birthInfo: {
    findFirst: async (options) => {
      return db
        .select()
        .from(schema.birthInfo)
        .where(options.where)
        .limit(1)
        .then((rows) => rows[0]);
    },
  },
};

module.exports = { db };
