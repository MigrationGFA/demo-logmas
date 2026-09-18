/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // Replace with your project's toast library if different
import { usePermitConfigs } from "@/hooks/queries/useTreasurer";
import { useRevenueCategories } from "@/hooks/queries/useRevenueCategories";

// 1. Defined strict schema validation matching backend design
const permitConfigSchema = z.object({
  name: z.string().min(3, "Configuration name must be at least 3 characters"),
  code: z
    .string()
    .min(2, "Identifier code is required")
    .regex(/^[A-Z0-9_]+$/, "Code can only contain alphanumeric characters and underscores"),
  categoryId: z.string().min(1, "Revenue category is required"),
  baseAmount: z.number().min(0, "Base pricing matrix rate cannot be negative"),
});

type PermitConfigFormData = z.infer<typeof permitConfigSchema>;

interface PermitConfigDialogProps {
  existing?: any;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function PermitConfigDialog({
  existing,
  trigger,
  onSuccess,
}: PermitConfigDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Assumes your custom hook exposes the standard mutateAsync or you can append Async directly
  const { createPermitConfigAsync, isCreating, isUpdating, updatePermitConfigAsync } =
    usePermitConfigs();
  const isEditing = !!existing;
  const isLoading = isCreating || isUpdating;

    const { categories:data, isLoading: isGettingCat } = useRevenueCategories("PERMIT");

  // 2. Safely pull dynamically populated permit categories from TanStack Cache
  const cachedCat = data

  const categories = useMemo(() => {
    return (
      cachedCat?.filter((ele: any) => ele.type === "PERMIT").map((ele: any) => ({
        value: ele.id,
        label: ele.name,
      })) ?? []
    );
  }, [cachedCat]);

  // 3. Initialize React Hook Form with Zod schema architecture
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PermitConfigFormData>({
    resolver: zodResolver(permitConfigSchema),
    defaultValues: {
      name: "",
      code: "",
      categoryId: "",
      baseAmount: 10000,
    },
  });

  // 4. Sync form fields state with database object context when dialog changes visibility
  useEffect(() => {
    if (existing && open) {
      reset({
        name: existing.name || "",
        code: existing.code || "",
        categoryId: existing.categoryId || existing.category?.id || "",
        baseAmount: existing.baseAmount ?? 0,
      });
    } else if (!open) {
      reset();
    }
  }, [existing, open, reset]);

  // Auto-generate system identifier code from name when creating a new record
  const watchedName = watch("name");
  const watchedCategoryId = watch("categoryId");

  useEffect(() => {
    if (!isEditing && watchedName && watchedCategoryId) {
      // 1. Find the selected category object from your array to get its readable name
      const activeCategory = categories.find((c: any) => c.value === watchedCategoryId);

      // 2. Generate Prefix Initials (e.g., "Annual Trade Permit" -> "ATP")
      const prefix = activeCategory
        ? activeCategory.label
            .split(/[\s - \-_]+/) // Split by spaces or dashes
            .map((word: string) => word[0])
            .join("")
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
        : "PERMIT";

      // 3. Clean up the config name for the suffix (e.g., "Retail Store" -> "RETAIL_STORE")
      const suffix = watchedName
        .toUpperCase()
        .trim()
        .replace(/[^A-Z0-9\s-_]/g, "") // Clear symbols
        .replace(/[\s - \-_]+/g, "_"); // Standardize spaces to underscores

      // 4. Assemble: "ATP_RETAIL_STORE"
      setValue("code", `${prefix}_${suffix}`, { shouldValidate: true });
    }
  }, [watchedName, watchedCategoryId, isEditing, categories, setValue]);

  // 5. Consolidated execution block matching your async Levy template
  const onSubmit = async (data: PermitConfigFormData) => {
    try {
      if (isEditing) {
        const updatedValue = await updatePermitConfigAsync({
          id: existing.id,
          data: {
            name: data.name,
            code: data.code,
            baseAmount: data.baseAmount,
            // isAc: data.isAc  // strips out empty input values safely
          },
        });

        if (updatedValue) {
          setOpen(false);
        }
      } else {
        const payload = {
          ...(existing || {}), // Keeps auto-generated structural IDs or timestamps intact
          name: data.name,
          code: data.code.toUpperCase().trim(),
          categoryId: data.categoryId,
          baseAmount: data.baseAmount,
        };

        // Utilize mutateAsync to manage control flow properly on success
        const newData = await createPermitConfigAsync(payload);
        if (newData) {
          setOpen(false);
        }

        //   toast.success(isEditing ? "Permit updated successfully!" : "Permit created successfully!");
        //   setOpen(false);
      }
      onSuccess?.();
    } catch (error) {
      // Handled cleanly via your global mutation fallback boundary wrappers
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-gradient-hero">
            <Plus className="h-4 w-4 mr-1.5" /> Add Configuration
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Permit Configuration" : "New Permit Configuration"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>Configuration Name</Label>
            <Input
              {...register("name")}
              placeholder="e.g. Annual Trade Permit  -  Retail"
              className={`mt-1.5 ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label>Unique System Identifier Code</Label>
            <Input
              {...register("code")}
              placeholder="Autogenerated from name..."
              readOnly // Prevents user edits
              className={`mt-1.5 font-mono uppercase bg-muted cursor-not-allowed ${errors.code ? "border-red-500" : ""}`}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <Label>Revenue Category</Label>
            <Select
              value={watch("categoryId")}
              onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
              disabled={isGettingCat || isEditing}
            >
              <SelectTrigger className={`mt-1.5 ${errors.categoryId ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select permit category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c: any) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <Label>Base Pricing Matrix Rate</Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ₦
              </span>
              <Input
                type="number"
                {...register("baseAmount", { valueAsNumber: true })}
                className={`pl-7 ${errors.baseAmount ? "border-red-500" : ""}`}
              />
            </div>
            {errors.baseAmount && (
              <p className="text-xs text-red-500 mt-1">{errors.baseAmount.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-hero" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isLoading ? "Saving..." : isEditing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

