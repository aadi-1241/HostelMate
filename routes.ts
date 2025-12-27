import { z } from 'zod';
import { 
  insertOrganizationSchema, insertHostelSchema, insertFloorSchema, insertRoomSchema, insertBedSchema, 
  insertStudentSchema, insertAllocationSchema, insertPaymentSchema,
  organizations, hostels, floors, rooms, beds, students, allocations, payments 
} from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // Organizations
  organizations: {
    list: {
      method: 'GET' as const,
      path: '/api/organizations',
      responses: { 200: z.array(z.custom<typeof organizations.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/organizations',
      input: insertOrganizationSchema,
      responses: { 201: z.custom<typeof organizations.$inferSelect>() },
    },
  },

  // Hostels
  hostels: {
    list: {
      method: 'GET' as const,
      path: '/api/hostels',
      input: z.object({ organizationId: z.string().optional() }).optional(),
      responses: { 200: z.array(z.custom<typeof hostels.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/hostels',
      input: insertHostelSchema,
      responses: { 201: z.custom<typeof hostels.$inferSelect>() },
    },
    get: {
      method: 'GET' as const,
      path: '/api/hostels/:id',
      responses: { 200: z.custom<typeof hostels.$inferSelect>() },
    },
  },

  // Floors
  floors: {
    list: {
      method: 'GET' as const,
      path: '/api/hostels/:hostelId/floors',
      responses: { 200: z.array(z.custom<typeof floors.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/floors',
      input: insertFloorSchema,
      responses: { 201: z.custom<typeof floors.$inferSelect>() },
    },
  },

  // Rooms
  rooms: {
    list: {
      method: 'GET' as const,
      path: '/api/floors/:floorId/rooms',
      responses: { 200: z.array(z.custom<typeof rooms.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/rooms',
      input: insertRoomSchema,
      responses: { 201: z.custom<typeof rooms.$inferSelect>() },
    },
  },

  // Beds
  beds: {
    list: {
      method: 'GET' as const,
      path: '/api/rooms/:roomId/beds',
      responses: { 200: z.array(z.custom<typeof beds.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/beds',
      input: insertBedSchema,
      responses: { 201: z.custom<typeof beds.$inferSelect>() },
    },
    bulkCreate: {
      method: 'POST' as const,
      path: '/api/beds/bulk',
      input: z.object({ roomId: z.number(), count: z.number(), prefix: z.string().optional() }),
      responses: { 201: z.array(z.custom<typeof beds.$inferSelect>()) },
    },
    available: {
      method: 'GET' as const,
      path: '/api/beds/available',
      responses: { 200: z.array(z.object({
        bedId: z.number(),
        bedNumber: z.string(),
        roomNumber: z.string(),
        floorNumber: z.string(),
        hostelName: z.string(),
        hostelLocation: z.string(),
        hostelType: z.string(),
        rentAmount: z.string(),
      })) },
    }
  },

  // Students
  students: {
    list: {
      method: 'GET' as const,
      path: '/api/students',
      responses: { 200: z.array(z.custom<typeof students.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/students',
      input: insertStudentSchema,
      responses: { 201: z.custom<typeof students.$inferSelect>() },
    },
    updatePhoto: {
      method: 'PATCH' as const,
      path: '/api/students/:studentId/photo',
      responses: { 200: z.custom<typeof students.$inferSelect>() },
    },
  },

  // Users/Roles
  users: {
    assignRole: {
      method: 'PATCH' as const,
      path: '/api/users/:userId/role',
      responses: { 200: z.custom<any>() },
    },
  },

  // Payments
  payments: {
    markAsPaid: {
      method: 'PATCH' as const,
      path: '/api/payments/:paymentId/mark-paid',
      responses: { 200: z.custom<any>() },
    },
  },

  // Allocations
  allocations: {
    list: {
      method: 'GET' as const,
      path: '/api/allocations',
      responses: { 200: z.array(z.object({
        allocationId: z.number(),
        studentId: z.number(),
        studentName: z.string(),
        studentMobile: z.string(),
        bedId: z.number(),
        bedNumber: z.string(),
        roomNumber: z.string(),
        floorNumber: z.string(),
        hostelName: z.string(),
        hostelLocation: z.string(),
        startDate: z.string(),
        endDate: z.string().nullable(),
        status: z.string(),
      })) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/allocations',
      input: insertAllocationSchema,
      responses: { 201: z.object({
        allocationId: z.number(),
        studentId: z.number(),
        studentName: z.string(),
        bedId: z.number(),
        bedNumber: z.string(),
        hostelName: z.string(),
        roomNumber: z.string(),
        startDate: z.string(),
      }) },
    },
    byStudent: {
      method: 'GET' as const,
      path: '/api/students/:studentId/allocations',
      responses: { 200: z.array(z.object({
        allocationId: z.number(),
        studentName: z.string(),
        bedNumber: z.string(),
        roomNumber: z.string(),
        floorNumber: z.string(),
        hostelName: z.string(),
        startDate: z.string(),
        endDate: z.string().nullable(),
      })) },
    }
  },
  
  // Dashboard
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats',
      responses: { 
        200: z.object({
          totalHostels: z.number(),
          totalRooms: z.number(),
          totalBeds: z.number(),
          occupiedBeds: z.number(),
          availableBeds: z.number(),
        }) 
      },
    },
    hostelOccupancy: {
      method: 'GET' as const,
      path: '/api/dashboard/hostel-occupancy',
      responses: {
        200: z.array(z.object({
          hostelId: z.number(),
          hostelName: z.string(),
          hostelLocation: z.string(),
          hostelType: z.string(),
          totalBeds: z.number(),
          occupiedBeds: z.number(),
          availableBeds: z.number(),
          occupancyRate: z.number(),
        }))
      },
    },
    floorOccupancy: {
      method: 'GET' as const,
      path: '/api/dashboard/floor-occupancy/:hostelId',
      responses: {
        200: z.array(z.object({
          floorId: z.number(),
          floorNumber: z.string(),
          totalBeds: z.number(),
          occupiedBeds: z.number(),
          availableBeds: z.number(),
          occupancyRate: z.number(),
        }))
      },
    },
    duePayments: {
      method: 'GET' as const,
      path: '/api/dashboard/due-payments',
      responses: {
        200: z.array(z.object({
          paymentId: z.number(),
          studentId: z.number(),
          studentName: z.string(),
          studentMobile: z.string(),
          hostelName: z.string().nullable(),
          floorNumber: z.string().nullable(),
          roomNumber: z.string().nullable(),
          amount: z.string(),
          type: z.string(),
          status: z.string(),
          dueDate: z.string().nullable(),
        }))
      },
    },
    todaysPayments: {
      method: 'GET' as const,
      path: '/api/dashboard/todays-payments',
      responses: {
        200: z.array(z.object({
          paymentId: z.number(),
          studentId: z.number(),
          studentName: z.string(),
          studentMobile: z.string(),
          hostelName: z.string().nullable(),
          floorNumber: z.string().nullable(),
          roomNumber: z.string().nullable(),
          bedNumber: z.string().nullable(),
          amount: z.string(),
          type: z.string(),
          status: z.string(),
          date: z.string().nullable(),
        }))
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
