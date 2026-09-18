/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Mail, Phone, FilePlus2, Loader2 } from "lucide-react";
import { tokenManager } from "@/services/apiAuth";
import {
  useFieldOfficerBusinesses,
  useFieldOfficerInvoices,
} from "@/hooks/queries/useFieldOfficer";
import {  useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRevenueCategories } from "@/hooks/queries/useRevenueCategories";
import { Business, GenerateInvoiceData } from "@/services/apiFieldOfficer";
import { useRouter } from "next/navigation";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface LevyConfig {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  mode: string;
  isActive: boolean;
}

// â”€â”€ Schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const invoiceSchema = z.object({
  // Business
  businessId: z.string().optional(),
  businessName: z.string().optional(),
  ownerName: z.string().optional(),
  phone: z.string().min(5, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  wardId: z.string().optional(),
  businessCategory: z.string().optional(),

  // Invoice
  categoryId: z.string().min(1, "Category is required"),
  levyConfigId: z.string().optional(),
  description: z.string().optional(),
  overrideAmount: z.number().optional(),
  quantity: z.number().min(1),
  dueDate: z.string().min(1, "Due date is required"),

  // Notifications
  notifyEmail: z.boolean().default(true),
  notifySms: z.boolean().default(true),
  // notifyWhatsapp:  z.boolean().default(true),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<{ id: string; invoiceNumber: string }>("/operations/field/invoices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export default function NewInvoicePage() {
  const navigate = useRouter();
  const user = tokenManager.getUser();
  const qc = useQueryClient();

  const { categories = [], isLoading: categoriesLoading } = useRevenueCategories("LEVY");
  const { generateInvoiceAsync, isGenerating } = useFieldOfficerInvoices();
  const { useGetBusinesses } = useFieldOfficerBusinesses(user?.role === "field_officer");
  const { data: businessesData, isLoading: businessesLoading } = useGetBusinesses();
  const businesses = businessesData ?? [];

  const createInvoiceMutation = useCreateInvoice();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      // 1. Required string fields (prevents initial validation errors on render)
      phone: "",
      categoryId: "",

      // 2. Invoice defaults
      quantity: 1,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),

      // 3. Notification defaults
      notifyEmail: true,
      notifySms: true,
    },
  });

  const selectedCategoryId = watch("categoryId");
  const selectedLevyConfigId = watch("levyConfigId");
  const quantity = watch("quantity") || 1;
  const overrideAmt = watch("overrideAmount") || 0;

  // Find selected category and its levy configs
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  console.log(selectedCategory, "selectedCategory");
  const availableLevyConfigs = useMemo(
    () => selectedCategory?.levyConfigs?.filter((l) => l.isActive) ?? [],
    [selectedCategory],
  );

  // Find selected levy config for pricing
  const selectedLevyConfig = useMemo(
    () => availableLevyConfigs.find((l) => l.id === selectedLevyConfigId),
    [availableLevyConfigs, selectedLevyConfigId],
  );

  // Auto-select first levy config when category changes
  useEffect(() => {
    if (availableLevyConfigs.length > 0) {
      setValue("levyConfigId", availableLevyConfigs[0].id);
    } else {
      setValue("levyConfigId", undefined);
    }
  }, [selectedCategoryId, availableLevyConfigs, setValue]);

  const unitPrice = selectedLevyConfig ? Number(selectedLevyConfig.amount) : overrideAmt;
  const total = unitPrice * quantity;
  const needsOverride = selectedCategory && availableLevyConfigs.length === 0;

  // Handle business selection from dropdown
  const onBusinessSelect = (value: string) => {
    if (value === "new") {
      setValue("businessId", undefined);
      setValue("phone", "");
      setValue("businessName", "");
      setValue("ownerName", "");
      setValue("email", "");
      setValue("address", "");
      return;
    }
    const b = businesses.find((x: Business) => x.id === value);
    if (b) {
      setValue("businessId", b.id);
      setValue("businessName", b.businessName || "");
      setValue("ownerName", b.ownerName || "");
      setValue("phone", b.phone || "");
      setValue("email", b.email || "");
      setValue("address", b.address || "");
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    if (!user) return;

    try {
      const payload: GenerateInvoiceData = {
        categoryId: data.categoryId || "",
        levyConfigId: data.levyConfigId || undefined,
        description: data.description || undefined,
        quantity: data.quantity,
        dueDate: data.dueDate,
      };

      if (data.businessId) {
        // Existing business
        payload.businessId = data.businessId;
      } else {
        // New business  -  pass registration fields
        payload.businessName = data.businessName;
        payload.ownerName = data.ownerName;
        payload.phone = data.phone ;
        payload.email = data.email || undefined;
        payload.address = data.address || undefined;
        payload.wardId = data.wardId || undefined;
        payload.businessCategory = data.businessCategory || "General";
      }

      if (needsOverride && data.overrideAmount) {
        payload.overrideAmount = data.overrideAmount;
      }

      const invoice = await generateInvoiceAsync(payload);

      // toast.success(`Invoice ${invoice.invoiceNumber} generated`);
      navigate.push(`/dashboard/invoices/${invoice.invoiceNumber}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate invoice");
    }
  };

  return (
    <div>
      <PageHeader
        title="Generate Invoice"
        subtitle="Issue a levy invoice with dynamic virtual account and instant delivery"
      />
      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* â”€â”€ Customer / Business â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <Card className="p-6 bg-gradient-card border-border/40 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Customer Details</h3>
              <Select onValueChange={onBusinessSelect}>
                <SelectTrigger className="w-60 h-9">
                  <SelectValue placeholder="Select existing or new" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">+ New customer</SelectItem>
                  {businessesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    businesses.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.businessName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Owner / Customer Name</Label>
                <Input {...register("ownerName")} className="mt-1.5" />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  {...register("phone")}
                  className={`mt-1.5 ${errors.phone ? "border-red-500" : ""}`}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" {...register("email")} className="mt-1.5" />
              </div>
              <div>
                <Label>Business Name</Label>
                <Input {...register("businessName")} className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <Input {...register("address")} className="mt-1.5" />
              </div>
            </div>
          </Card>

          {/* â”€â”€ Levy Details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <Card className="p-6 bg-gradient-card border-border/40 space-y-5">
            <h3 className="font-semibold">Levy Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <Label>Levy Category *</Label>
                <Select value={selectedCategoryId} onValueChange={(v) => setValue("categoryId", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue
                      placeholder={categoriesLoading ? "Loading..." : "Select category"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Levy Config (pricing tier) */}
              <div>
                <Label>Pricing Tier</Label>
                <Select
                  value={selectedLevyConfigId}
                  onValueChange={(v) => setValue("levyConfigId", v)}
                  disabled={availableLevyConfigs.length === 0}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue
                      placeholder={
                        availableLevyConfigs.length === 0
                          ? "No config  -  enter amount below"
                          : "Select pricing tier"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLevyConfigs.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}  -  ₦{Number(l.amount).toLocaleString()} / {l.billingCycle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLevyConfig && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ₦{Number(selectedLevyConfig.amount).toLocaleString()} ·{" "}
                    {selectedLevyConfig.billingCycle}
                  </p>
                )}
              </div>

              {/* Override amount  -  only shown if no levy config */}
              {needsOverride && (
                <div>
                  <Label>Amount (₦) *</Label>
                  <Input
                    type="number"
                    {...register("overrideAmount", { valueAsNumber: true })}
                    placeholder="Enter amount manually"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    No treasurer config found. This amount will be used.
                  </p>
                </div>
              )}

              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  {...register("quantity", { valueAsNumber: true })}
                  className={`mt-1.5 ${errors.quantity ? "border-red-500" : ""}`}
                />
              </div>

              <div>
                <Label>Due Date *</Label>
                <Input type="date" {...register("dueDate")} className="mt-1.5" />
                {errors.dueDate && (
                  <p className="text-sm text-destructive mt-1">{errors.dueDate.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label>Description / Notes</Label>
                <Textarea rows={2} {...register("description")} className="mt-1.5" />
              </div>
            </div>
          </Card>
        </div>

        {/* â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-hero text-primary-foreground border-0">
            <div className="text-xs uppercase tracking-wider opacity-80">Invoice Total</div>
            <div className="text-4xl font-bold mt-2">₦{total.toLocaleString()}</div>
            <div className="mt-4 space-y-1.5 text-sm opacity-90">
              <div className="flex justify-between">
                <span>{selectedCategory?.name ?? " - "}</span>
                <span>₦{unitPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                 <span>x {quantity}</span>
                <span>x {quantity}</span>
              </div>
              {selectedLevyConfig && (
                <div className="flex justify-between">
                  <span>Cycle</span>
                  <span className="capitalize">{selectedLevyConfig.billingCycle}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/20 pt-1.5 mt-1.5 font-semibold">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-card border-border/40 space-y-3">
            <h4 className="font-semibold text-sm">Delivery channels</h4>
            <p className="text-xs text-muted-foreground">
              Customer receives invoice with payment link, dynamic account & QR.
            </p>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register("notifyEmail")} />{" "}
              <Mail className="h-3.5 w-3.5" /> Email
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register("notifySms")} /> <Phone className="h-3.5 w-3.5" />{" "}
              SMS
            </label>
            {/* <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register("notifyWhatsapp")} /> <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </label> */}
            <Button
              type="submit"
              disabled={isSubmitting || createInvoiceMutation.isPending}
              className="w-full bg-gradient-hero shadow-elegant"
            >
              {isSubmitting || createInvoiceMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1.5" /> Generate & Send
                </>
              )}
            </Button>
          </Card>

          <Card className="p-4 bg-info/5 border-info/30 text-xs space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-info">
              <FilePlus2 className="h-3.5 w-3.5" /> Auto-generated
            </div>
            <div>• Dynamic virtual account number</div>
            <div>• QR payment code</div>
            <div>• Unique payment link</div>
            <div>• SMS / Email / WhatsApp delivery</div>
          </Card>
        </div>
      </form>
    </div>
  );
}

