import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Badge } from '@/components/ui/badge';
import AddClient from '@/components/dashboard/dialogs/AddClient';
import { useAppContext } from '@/context/AppContext';
import {
  Plus,
  Search,
  Phone,
  MapPin,
  ArrowUpRightIcon,
  Notebook,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleOff,
} from 'lucide-react';

import CustomPagination from '@/components/ui/custom-pagination';

function Clients() {
  const { clients, getClientOrders } = useAppContext();
  const navigate = useNavigate();

  const [showAddClient, setShowAddClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleClientClick = (client) => {
    navigate(`/dashboard/clients/${client.id}`);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.email &&
        client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(
      date.seconds ? date.seconds * 1000 : date
    ).toLocaleDateString('uz-UZ');
  };

  return (
    <div className="space-y-4 my-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Mijozlar ro'yxati
          </h2>
          <p className="text-muted-foreground">
            Tizimga yangi mijoz qo'shish uchun "Mijoz q'shish" tugmasini bosing.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddClient(true)}
          className="flex items-center"
        >
          Mijoz qo'shish
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Mijozlarni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients Table */}
      <div>
        {filteredClients.length > 0 ? (
          <div className="bg-background overflow-hidden rounded-md border [&>div]:max-h-[30rem]">
            <Table>
              <TableHeader>
                <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r bg-muted">
                  <TableHead className="w-10 text-center">№</TableHead>
                  <TableHead className="py-2 font-medium w-[18rem]">
                    Ism
                  </TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Manzil</TableHead>
                  <TableHead>Buyurtmalar</TableHead>
                  <TableHead>Qo'shilgan sana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client, index) => {
                  const clientOrders = getClientOrders(client.id);
                  return (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer *:border-border hover:bg-muted/50 [&>:not(:last-child)]:border-r"
                      onClick={() => handleClientClick(client)}
                    >
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="py-2 font-medium max-w-[18rem]">
                        <div className="flex items-center gap-2">
                          <span className="truncate block max-w-[18rem]">
                            {client.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs font-mono bg-muted ml-1"
                          >
                            {client.code}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {client.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.address ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">
                              {client.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge>{clientOrders.length} ta</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(client.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 lg:py-12 border rounded-lg">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CircleOff />
                </EmptyMedia>
                <EmptyTitle>No Projects Yet</EmptyTitle>
                <EmptyDescription>
                  You haven&apos;t created any projects yet. Get started by
                  creating your first project.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setShowAddClient(true)} size="sm">
                  Mijoz qo'shish
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        )}
      </div>

      <CustomPagination />

      {/* Add Client Dialog */}
      <AddClient open={showAddClient} onOpenChange={setShowAddClient} />
    </div>
  );
}

export default Clients;
