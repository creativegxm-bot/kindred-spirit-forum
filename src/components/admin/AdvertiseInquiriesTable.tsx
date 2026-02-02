import { useEffect, useState } from "react";
import { Loader2, Mail, Building2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AdvertiseInquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  created_at: string;
}

const AdvertiseInquiriesTable = () => {
  const { language } = useLanguage();
  const [inquiries, setInquiries] = useState<AdvertiseInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      const { data, error } = await supabase
        .from("advertise_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching inquiries:", error);
        setError(language === "tr" ? "Başvurular yüklenemedi" : "Failed to load inquiries");
      } else {
        setInquiries(data || []);
      }
      setLoading(false);
    };

    fetchInquiries();
  }, [language]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (inquiries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {language === "tr" ? "Henüz başvuru yok" : "No inquiries yet"}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {language === "tr" ? `${inquiries.length} Başvuru` : `${inquiries.length} Inquiries`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === "tr" ? "Tarih" : "Date"}</TableHead>
              <TableHead>{language === "tr" ? "İsim" : "Name"}</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>{language === "tr" ? "Şirket" : "Company"}</TableHead>
              <TableHead>{language === "tr" ? "Mesaj" : "Message"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(inquiry.created_at), "dd/MM/yyyy HH:mm")}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{inquiry.name}</TableCell>
                <TableCell>
                  <a 
                    href={`mailto:${inquiry.email}`}
                    className="text-primary hover:underline"
                  >
                    {inquiry.email}
                  </a>
                </TableCell>
                <TableCell>
                  {inquiry.company ? (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      {inquiry.company}
                    </div>
                  ) : (
                    <Badge variant="secondary">
                      {language === "tr" ? "Belirtilmedi" : "Not specified"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate" title={inquiry.message}>
                  {inquiry.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdvertiseInquiriesTable;
