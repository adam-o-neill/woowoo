const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const schema = require("./schema");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

db.query = {
  birthInfo: {
    findFirst: async (options: any) => {
      return db
        .select()
        .from(schema.birthInfo)
        .where(options.where)
        .limit(1)
        .then((rows: any) => rows[0]);
    },
  },
};

export { db };
