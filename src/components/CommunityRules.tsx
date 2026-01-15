import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface CommunityRule {
  id: string;
  community_id: string;
  rule_number: number;
  title: string;
  description: string | null;
  created_at: string;
}

interface CommunityRulesProps {
  communityId: string;
  createdBy: string | null;
}

const CommunityRules = ({ communityId, createdBy }: CommunityRulesProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CommunityRule | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const isCreator = user?.id === createdBy;

  const { data: rules = [] } = useQuery({
    queryKey: ["community-rules", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_rules")
        .select("*")
        .eq("community_id", communityId)
        .order("rule_number", { ascending: true });

      if (error) throw error;
      return data as CommunityRule[];
    },
  });

  const addRule = useMutation({
    mutationFn: async () => {
      const nextNumber = rules.length > 0 
        ? Math.max(...rules.map(r => r.rule_number)) + 1 
        : 1;

      const { error } = await supabase.from("community_rules").insert({
        community_id: communityId,
        rule_number: nextNumber,
        title: title.trim(),
        description: description.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-rules", communityId] });
      setEditModalOpen(false);
      setTitle("");
      setDescription("");
      toast.success(t("ruleAdded"));
    },
    onError: () => {
      toast.error(t("ruleAddError"));
    },
  });

  const updateRule = useMutation({
    mutationFn: async () => {
      if (!editingRule) return;

      const { error } = await supabase
        .from("community_rules")
        .update({
          title: title.trim(),
          description: description.trim() || null,
        })
        .eq("id", editingRule.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-rules", communityId] });
      setEditModalOpen(false);
      setEditingRule(null);
      setTitle("");
      setDescription("");
      toast.success(t("ruleUpdated"));
    },
    onError: () => {
      toast.error(t("ruleUpdateError"));
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from("community_rules")
        .delete()
        .eq("id", ruleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-rules", communityId] });
      toast.success(t("ruleDeleted"));
    },
    onError: () => {
      toast.error(t("ruleDeleteError"));
    },
  });

  const openAddModal = () => {
    setEditingRule(null);
    setTitle("");
    setDescription("");
    setEditModalOpen(true);
  };

  const openEditModal = (rule: CommunityRule) => {
    setEditingRule(rule);
    setTitle(rule.title);
    setDescription(rule.description || "");
    setEditModalOpen(true);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (editingRule) {
      updateRule.mutate();
    } else {
      addRule.mutate();
    }
  };

  if (rules.length === 0 && !isCreator) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{t("communityRules")}</h3>
        </div>
        {isCreator && (
          <Button variant="ghost" size="sm" onClick={openAddModal}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noRulesYet")}</p>
      ) : (
        <Accordion type="single" collapsible className="space-y-1">
          {rules.map((rule) => (
            <AccordionItem key={rule.id} value={rule.id} className="border-b-0">
              <div className="flex items-center gap-2">
                <AccordionTrigger className="flex-1 py-2 hover:no-underline">
                  <span className="text-sm text-left">
                    <span className="font-medium text-primary mr-2">
                      {rule.rule_number}.
                    </span>
                    {rule.title}
                  </span>
                </AccordionTrigger>
                {isCreator && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(rule);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRule.mutate(rule.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              {rule.description && (
                <AccordionContent className="text-sm text-muted-foreground pb-2 pt-0">
                  {rule.description}
                </AccordionContent>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRule ? t("editRule") : t("addRule")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("ruleTitle")}</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("ruleTitlePlaceholder")}
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("ruleDescription")}</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("ruleDescriptionPlaceholder")}
                maxLength={500}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || addRule.isPending || updateRule.isPending}
              >
                {editingRule ? t("saveChanges") : t("addRule")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityRules;
