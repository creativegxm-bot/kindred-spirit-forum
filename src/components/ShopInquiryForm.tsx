import { useState } from "react";
import { z } from "zod";
import { Phone, MessageSquare, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { wholesaleProducts } from "@/data/wholesaleProducts";

const CONTACT_PHONE = "908-987-7387";
const CONTACT_TEL = "+19089877387";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().max(150).optional(),
  product: z.string().trim().max(200),
  quantity: z.string().trim().max(50).optional(),
  message: z.string().trim().min(5, "Tell us what you need").max(1000),
});

interface Props {
  defaultProduct?: string;
}

const ShopInquiryForm = ({ defaultProduct = "" }: Props) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    product: defaultProduct,
    quantity: "",
    message: "",
  });

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Please fix the form",
        description: parsed.error.issues[0]?.message ?? "Invalid input",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const composed =
      `[Wholesale inquiry]\n` +
      `Product: ${parsed.data.product || "(not specified)"}\n` +
      `Quantity: ${parsed.data.quantity || "(not specified)"}\n\n` +
      parsed.data.message;

    const { error } = await supabase.from("advertise_inquiries").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company || null,
      message: composed,
    });
    if (!error) {
      supabase.functions
        .invoke("send-shop-inquiry", {
          body: {
            name: parsed.data.name,
            email: parsed.data.email,
            company: parsed.data.company || "",
            product: parsed.data.product || "",
            quantity: parsed.data.quantity || "",
            message: parsed.data.message,
          },
        })
        .catch((e) => console.error("notify failed", e));
    }
    setSubmitting(false);
    if (error) {
      toast({
        title: "Could not send",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setSubmitted(true);
    toast({ title: "Inquiry sent", description: "We'll be in touch shortly." });
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
          <Check className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-1 text-lg font-bold">Thanks — your inquiry is in.</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Want a faster reply? Call or text us directly.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <a href={`tel:${CONTACT_TEL}`}>
            <Button className="gap-2">
              <Phone className="h-4 w-4" /> Call {CONTACT_PHONE}
            </Button>
          </a>
          <a
            href={`sms:${CONTACT_TEL}?&body=${encodeURIComponent(
              "Hi, I just submitted a wholesale inquiry about: " +
                (form.product || "your products"),
            )}`}
          >
            <Button variant="secondary" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Text {CONTACT_PHONE}
            </Button>
          </a>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setForm({
                name: "",
                email: "",
                company: "",
                product: defaultProduct,
                quantity: "",
                message: "",
              });
            }}
          >
            Send another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <h2 className="mb-1 text-xl font-bold">Request a Wholesale Quote</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Tell us what you need and we'll get back fast. Prefer to talk?{" "}
        <a href={`tel:${CONTACT_TEL}`} className="text-primary underline">
          Call {CONTACT_PHONE}
        </a>{" "}
        or{" "}
        <a href={`sms:${CONTACT_TEL}`} className="text-primary underline">
          text us
        </a>
        .
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            maxLength={100}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            maxLength={255}
            required
          />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            maxLength={150}
          />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity / units</Label>
          <Input
            id="quantity"
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            placeholder="e.g. 500 pairs"
            maxLength={50}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="product">Product</Label>
          <Select
            value={form.product}
            onValueChange={(v) => update("product", v)}
          >
            <SelectTrigger id="product">
              <SelectValue placeholder="Select a product (or describe in the message)" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {wholesaleProducts.map((p) => (
                <SelectItem key={p.slug} value={p.title}>
                  {p.title}{" "}
                  <span className="text-muted-foreground">— {p.category}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Quantity, shipping zip, target price, deadlines…"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={submitting} className="mt-4 w-full sm:w-auto">
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          "Send Inquiry"
        )}
      </Button>
    </form>
  );
};

export default ShopInquiryForm;
