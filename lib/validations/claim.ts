import * as z from "zod"

export const claimFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  policyNumber: z.string().regex(/^POL-\d+$/, "Policy number must be in format POL-<number>"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  incidentDate: z.string().refine(
    (date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      return selectedDate <= today
    },
    { message: "Incident date cannot be in the future" }
  ),
  incidentType: z.enum(["collision", "theft", "vandalism", "fire", "natural", "mechanical"], {
    required_error: "Please select an incident type",
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  vehicleBrand: z.string().min(1, "Vehicle brand is required"),
  vehicleType: z.enum(["2-wheeler", "3-wheeler", "4-wheeler"], {
    required_error: "Please select a vehicle type",
  }),
  damagePhoto: z
    .instanceof(File)
    .refine((file) => file?.type === "image/jpeg", "Only JPG files are allowed")
    .optional(),
});

export type ClaimFormData = z.infer<typeof claimFormSchema>