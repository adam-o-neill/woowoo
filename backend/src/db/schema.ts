const { pgTable, text, timestamp, uuid } = require("drizzle-orm/pg-core");

const birthInfo = pgTable("birth_info", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  timeOfBirth: text("time_of_birth").notNull(),
  placeOfBirth: text("place_of_birth").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const birthChart = pgTable("birth_chart", {
  id: uuid("id").defaultRandom().primaryKey(),
  birthInfoId: uuid("birth_info_id").references(() => birthInfo.id),
  chartData: text("chart_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const scenarioResponse = pgTable("scenario_response", {
  id: uuid("id").defaultRandom().primaryKey(),
  scenarioId: text("scenario_id").notNull(),
  birthInfoId: uuid("birth_info_id").references(() => birthInfo.id),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export { birthInfo, birthChart, scenarioResponse };
