/**
 * ============================================================
 * © 2025 Diploy — a brand of Bisht Technologies Private Limited
 * Original Author: BTPL Engineering Team
 * Website: https://diploy.in
 * Contact: cs@diploy.in
 *
 * Distributed under the Envato / CodeCanyon License Agreement.
 * Licensed to the purchaser for use as defined by the
 * Envato Market (CodeCanyon) Regular or Extended License.
 *
 * You are NOT permitted to redistribute, resell, sublicense,
 * or share this source code, in whole or in part.
 * Respect the author's rights and Envato licensing terms.
 * ============================================================
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { Info } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  existingData?: any;
  onSuccess: () => void;
}

export default function StorageSettingsModal({
  open,
  onOpenChange,
  existingData,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    id: existingData?.id || "",
    provider: existingData?.provider || "storj",
    spaceName: existingData?.spaceName || "",
    endpoint: existingData?.endpoint || "",
    region: existingData?.region || "",
    accessKey: existingData?.accessKey || "",
    secretKey: existingData?.secretKey || "",
    isActive: existingData?.isActive || false,
  });

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Provider presets
  const providerPresets: Record<string, { endpoint: string; region: string; example: string }> = {
    storj: {
      endpoint: "https://gateway.storjshare.io",
      region: "auto",
      example: "Storj DCS: endpoint=https://eu1.storj.io, region=auto"
    },
    digitalocean: {
      endpoint: "https://nyc3.digitaloceanspaces.com",
      region: "nyc3",
      example: "DigitalOcean Spaces: endpoint=https://[region].digitaloceanspaces.com"
    },
    aws: {
      endpoint: "https://s3.amazonaws.com",
      region: "us-east-1",
      example: "AWS S3: endpoint=https://s3.[region].amazonaws.com"
    },
    minio: {
      endpoint: "http://localhost:9000",
      region: "us-east-1",
      example: "MinIO: endpoint=http://your-server:9000"
    },
    custom: {
      endpoint: "",
      region: "",
      example: "Custom S3-compatible storage"
    }
  };

  const handleProviderChange = (provider: string) => {
    const preset = providerPresets[provider];
    setForm((prev) => ({
      ...prev,
      provider,
      endpoint: preset.endpoint,
      region: preset.region,
    }));
  };

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/storage-settings/update", form);
      if (!res.ok) throw new Error("Failed to update");
      toast({ title: "Updated", description: "Storage configuration saved." });
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update storage.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure S3-Compatible Storage</DialogTitle>
          <DialogDescription>
            Connect to Storj, DigitalOcean Spaces, AWS S3, or any S3-compatible storage
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Provider Selector */}
          <div className="space-y-2">
            <Label>Storage Provider</Label>
            <Select value={form.provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="storj">Storj DCS (Decentralized)</SelectItem>
                <SelectItem value="digitalocean">DigitalOcean Spaces</SelectItem>
                <SelectItem value="aws">AWS S3</SelectItem>
                <SelectItem value="minio">MinIO</SelectItem>
                <SelectItem value="custom">Custom S3-Compatible</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>{providerPresets[form.provider]?.example}</span>
            </p>
          </div>

          {/* Bucket/Space Name */}
          <div className="space-y-2">
            <Label>Bucket/Space Name *</Label>
            <Input
              value={form.spaceName}
              onChange={(e) => handleChange("spaceName", e.target.value)}
              placeholder="e.g., whatsa, my-bucket"
            />
            <p className="text-xs text-muted-foreground">
              {form.provider === 'storj' && 'Your Storj bucket name (e.g., "whatsa")'}
              {form.provider === 'digitalocean' && 'Your Space name from DigitalOcean'}
              {form.provider === 'aws' && 'Your S3 bucket name'}
            </p>
          </div>

          {/* Endpoint */}
          <div className="space-y-2">
            <Label>Endpoint URL *</Label>
            <Input
              value={form.endpoint}
              onChange={(e) => handleChange("endpoint", e.target.value)}
              placeholder="https://gateway.storjshare.io"
            />
            <p className="text-xs text-muted-foreground">
              {form.provider === 'storj' && 'Storj Gateway: https://gateway.storjshare.io or regional like https://eu1.storj.io'}
              {form.provider === 'digitalocean' && 'Format: https://[region].digitaloceanspaces.com'}
              {form.provider === 'aws' && 'Format: https://s3.[region].amazonaws.com'}
            </p>
          </div>

          {/* Region */}
          <div className="space-y-2">
            <Label>Region *</Label>
            <Input
              value={form.region}
              onChange={(e) => handleChange("region", e.target.value)}
              placeholder="auto"
            />
            <p className="text-xs text-muted-foreground">
              {form.provider === 'storj' && 'Use "auto" for Storj'}
              {form.provider === 'digitalocean' && 'e.g., nyc3, sgp1, fra1'}
              {form.provider === 'aws' && 'e.g., us-east-1, eu-west-1'}
            </p>
          </div>

          {/* Access Key */}
          <div className="space-y-2">
            <Label>Access Key ID *</Label>
            <Input
              value={form.accessKey}
              onChange={(e) => handleChange("accessKey", e.target.value)}
              placeholder="Enter your access key"
              type="text"
            />
          </div>

          {/* Secret Key */}
          <div className="space-y-2">
            <Label>Secret Access Key *</Label>
            <Input
              type="password"
              value={form.secretKey}
              onChange={(e) => handleChange("secretKey", e.target.value)}
              placeholder="Enter your secret key"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-0.5">
              <Label>Enable Cloud Storage</Label>
              <p className="text-xs text-muted-foreground">
                When enabled, uploaded files will be stored in cloud storage
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(val) => handleChange("isActive", val)}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || user?.username === "demoadmin" || user?.username === "demouser" || !form.spaceName || !form.endpoint || !form.accessKey || !form.secretKey}
          >
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
