import { pgTable, text, serial, integer, boolean, timestamp, date, numeric, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- AUTH SCHEMA (Preserved) ---
export * from "./models/auth";

// --- HOSTEL MANAGEMENT SCHEMA ---

// 1. Organizations (Tenant)
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerName: text("owner_name").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email"),
  address: text("address"),
  status: text("status").default("active").notNull(), // active, inactive
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Hostels (Branches)
export const hostels = pgTable("hostels", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // Boys, Girls, Co-ed
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. Floors
export const floors = pgTable("floors", {
  id: serial("id").primaryKey(),
  hostelId: integer("hostel_id").notNull().references(() => hostels.id),
  floorNumber: text("floor_number").notNull(), // Can be "Ground", "1", "2"
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  unq: uniqueIndex("floor_hostel_idx").on(t.hostelId, t.floorNumber),
}));

// 4. Rooms
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  floorId: integer("floor_id").notNull().references(() => floors.id),
  roomNumber: text("room_number").notNull(),
  capacity: integer("capacity").notNull(), // Total beds
  type: text("type").default("Non-AC"), // AC, Non-AC
  rentAmount: numeric("rent_amount").notNull(), // Base rent for this room
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  unq: uniqueIndex("room_floor_idx").on(t.floorId, t.roomNumber),
}));

// 5. Beds
export const beds = pgTable("beds", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => rooms.id),
  bedNumber: text("bed_number").notNull(), // A, B, C or 1, 2, 3
  status: text("status").default("available").notNull(), // available, occupied, maintenance
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  unq: uniqueIndex("bed_room_idx").on(t.roomId, t.bedNumber),
}));

// 6. Students
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email"),
  idProofType: text("id_proof_type"), // Aadhar, Passport, etc.
  idProofNumber: text("id_proof_number"),
  idProofPhotoUrl: text("id_proof_photo_url"), // URL to uploaded Aadhar/ID photo
  guardianName: text("guardian_name"),
  guardianMobile: text("guardian_mobile"),
  address: text("address"),
  photoUrl: text("photo_url"),
  status: text("status").default("active").notNull(), // active, vacated, expelled
  createdAt: timestamp("created_at").defaultNow(),
});

// 7. Allocations (Linking Students to Beds)
export const allocations = pgTable("allocations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  bedId: integer("bed_id").notNull().references(() => beds.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // Null means currently active
  status: text("status").default("active").notNull(), // active, vacated
  createdAt: timestamp("created_at").defaultNow(),
});

// 8. Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  allocationId: integer("allocation_id").references(() => allocations.id), // Optional link to specific stay
  amount: numeric("amount").notNull(),
  type: text("type").notNull(), // rent, deposit, mess, other
  method: text("method"),
  status: text("status").default("pending").notNull(), // pending, paid, overdue
  date: date("date").defaultNow().notNull(),
  dueDate: date("due_date"), // When payment is due
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 9. Tariffs
export const tariffs = pgTable("tariffs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  hostelId: integer("hostel_id").references(() => hostels.id), // Optional: Can be organization-wide or hostel-specific
  roomType: text("room_type").notNull(), // Single, Double, Triple, Dormitory
  tariffType: text("tariff_type").notNull(), // room_wise, share_wise
  sharingType: integer("sharing_type"), // 1 for 1-share, 2 for 2-share, etc. (null for room_wise)
  amount: numeric("amount").notNull(),
  effectiveDate: date("effective_date").notNull(),
  status: text("status").default("active").notNull(), // active, inactive
  createdAt: timestamp("created_at").defaultNow(),
});

// --- RELATIONS ---

export const organizationsRelations = relations(organizations, ({ many }) => ({
  hostels: many(hostels),
}));

export const hostelsRelations = relations(hostels, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [hostels.organizationId],
    references: [organizations.id],
  }),
  floors: many(floors),
}));

export const floorsRelations = relations(floors, ({ one, many }) => ({
  hostel: one(hostels, {
    fields: [floors.hostelId],
    references: [hostels.id],
  }),
  rooms: many(rooms),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  floor: one(floors, {
    fields: [rooms.floorId],
    references: [floors.id],
  }),
  beds: many(beds),
}));

export const bedsRelations = relations(beds, ({ one, many }) => ({
  room: one(rooms, {
    fields: [beds.roomId],
    references: [rooms.id],
  }),
  allocations: many(allocations), // History of allocations for this bed
}));

export const studentsRelations = relations(students, ({ many }) => ({
  allocations: many(allocations),
  payments: many(payments),
}));

export const allocationsRelations = relations(allocations, ({ one }) => ({
  student: one(students, {
    fields: [allocations.studentId],
    references: [students.id],
  }),
  bed: one(beds, {
    fields: [allocations.bedId],
    references: [beds.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, {
    fields: [payments.studentId],
    references: [students.id],
  }),
  allocation: one(allocations, {
    fields: [payments.allocationId],
    references: [allocations.id],
  }),
}));

// --- INSERT SCHEMAS ---

export const tariffsRelations = relations(tariffs, ({ one }) => ({
  organization: one(organizations, {
    fields: [tariffs.organizationId],
    references: [organizations.id],
  }),
  hostel: one(hostels, {
    fields: [tariffs.hostelId],
    references: [hostels.id],
  }),
}));

export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true });
export const insertHostelSchema = createInsertSchema(hostels).omit({ id: true, createdAt: true });
export const insertFloorSchema = createInsertSchema(floors).omit({ id: true, createdAt: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true, createdAt: true });
export const insertBedSchema = createInsertSchema(beds).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true });
export const insertAllocationSchema = createInsertSchema(allocations).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertTariffSchema = createInsertSchema(tariffs).omit({ id: true, createdAt: true });

// --- TYPES ---

export type Organization = typeof organizations.$inferSelect;
export type Hostel = typeof hostels.$inferSelect;
export type Floor = typeof floors.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Bed = typeof beds.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Allocation = typeof allocations.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Tariff = typeof tariffs.$inferSelect;

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type InsertHostel = z.infer<typeof insertHostelSchema>;
export type InsertFloor = z.infer<typeof insertFloorSchema>;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertBed = z.infer<typeof insertBedSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertAllocation = z.infer<typeof insertAllocationSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertTariff = z.infer<typeof insertTariffSchema>;

// Complex types for responses
export type HostelWithDetails = Hostel & { floorCount?: number, roomCount?: number, bedCount?: number };
export type RoomWithBeds = Room & { beds: Bed[] };
