
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
  lastConnected: z.date().optional(),
  status: z.enum(["online", "offline", "error"]).default("offline"),
});

export type PrinterConfig = z.infer<typeof printerSchema>;

export interface PrintJob {
  id: string;
  content: string;
  printer: PrinterConfig;
  status: "pending" | "printing" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface PrintResult {
  success: boolean;
  message: string;
  job?: PrintJob;
}
