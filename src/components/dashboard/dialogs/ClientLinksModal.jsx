import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import AddClientLink from './AddClientLink';
import { useAppContext } from '@/context/AppContext';
import { Link, Plus, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientLinksModal({ open, onOpenChange, client }) {
  const { addClient, userUid } = useAppContext();
  const [showAddLink, setShowAddLink] = useState(false);

  if (!client) return null;

  const handleAddLink = async (linkData) => {
    try {
      const updatedClient = {
        ...client,
        clientLinks: [...(client.clientLinks || []), linkData],
      };
      await addClient(updatedClient, userUid);
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const copyPinCode = () => {
    navigator.clipboard.writeText(client.code.toString());
    toast('PIN kodi nusxalandi');
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast('Link nusxalandi');
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="sm:max-w-[600px] max-h-[100vh] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              {client.name} - Linklar ro'yxati
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-4">
            {/* Pin Code Section */}
            <div className="p-4 rounded-lg border space-y-4">
              <h4 className="text-base font-medium">Mijoz PIN kodi</h4>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-2xl font-mono">
                    {client.code}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyPinCode}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Nusxalash
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Bu kod mijozga beriladi va linklar orqali buyurtma qilish
                  uchun ishlatiladi
                </p>
              </div>
            </div>

            {/* Links Section */}
            <div className="p-4 rounded-lg border space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-medium">Mijoz linklari</h4>
                <Button
                  size="sm"
                  onClick={() => setShowAddLink(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Yangi link
                </Button>
              </div>

              {client.clientLinks && client.clientLinks.length > 0 ? (
                <div className="space-y-3">
                  {client.clientLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{link.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {link.link}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyLink(link.link)}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(link.link, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Hali linklar qo'shilmagan</p>
                  <p className="text-sm">
                    Yangi link qo'shish uchun tugmani bosing
                  </p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Link Modal */}
      <AddClientLink
        open={showAddLink}
        onOpenChange={setShowAddLink}
        onSubmit={handleAddLink}
      />
    </>
  );
}
