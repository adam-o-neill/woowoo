const {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
} = require("drizzle-orm/pg-core");

// Person table - represents any individual in the system
const person = pgTable("person", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  birthInfoId: uuid("birth_info_id").references(() => birthInfo.id),
  userId: text("user_id"), // If this person has an account, link to auth user
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdById: text("created_by_id"), // Who created this person record
});

// Birth info belongs to a person
const birthInfo = pgTable("birth_info", {
  id: uuid("id").defaultRandom().primaryKey(),
  personId: uuid("person_id")
    .references(() => person.id)
    .notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  timeOfBirth: text("time_of_birth").notNull(),
  placeOfBirth: text("place_of_birth").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  timezone: text("timezone"),
  originalLocalTime: text("original_local_time"),
  originalTimeZone: text("original_time_zone"),
  createdAt: timestamp("created_at").defaultNow(),
  createdById: text("created_by_id").notNull(), // Who created this record
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

// Relationship table - tracks connections between people
const relationship = pgTable("relationship", {
  id: uuid("id").defaultRandom().primaryKey(),
  personId: uuid("person_id")
    .references(() => person.id)
    .notNull(), // The person
  relatedPersonId: uuid("related_person_id")
    .references(() => person.id)
    .notNull(), // The person they're connected to
  type: text("type").notNull(), // e.g., "friend", "partner", "family"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdById: text("created_by_id").notNull(), // Who created this relationship
});

export { birthInfo, birthChart, scenarioResponse, person, relationship };
