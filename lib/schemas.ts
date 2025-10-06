import { z } from "zod";

export const actionFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  details: z.string().min(10, "Details must be at least 10 characters"),
  location: z.string().optional(),
  action_type: z.enum([
    "sublet",
    "mutual-aid",
    "childcare",
    "food-sharing",
    "vacant-use",
    "community-event",
  ], { required_error: "Action type is required" }),
  category_id: z.string().optional().transform((val) => val ? Number(val) : null),
}); 