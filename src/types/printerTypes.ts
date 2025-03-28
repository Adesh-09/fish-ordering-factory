
import { z } from "zod";

export const printerSchema = z.object({
  name: z.string().min(2, "Printer name must be at least 2 characters"),
  ipAddress: z.string().optional(),
  bluetoothId: z.string().optional(),
  connectionType: z.enum(["usb", "network", "bluetooth"]),
  isDefault: z.boolean().default(false),
  paperWidth: z.enum(["58mm", "80mm"]),
  enabled: z.boolean().default(true),
  location: z.enum(["kitchen", "billing", "inventory"]),
});

export type PrinterConfig = z.infer<typeof printerSchema>;
