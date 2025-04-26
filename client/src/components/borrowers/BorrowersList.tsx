import React, { useState } from "react";
import { Link } from "wouter";
import { Search, Edit, Trash2, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Borrower, Loan } from "@/types";
import { getInitials } from "@/utils/formatters";

interface BorrowersListProps {
  borrowers: Borrower[];
  loans: Loan[];
  onDeleteBorrower: (id: number) => Promise<void>;
}

const BorrowersList: React.FC<BorrowersListProps> = ({
  borrowers,
  loans,
  onDeleteBorrower,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [borrowerToDelete, setBorrowerToDelete] = useState<Borrower | null>(null);

  // Filter borrowers based on search query
  const filteredBorrowers = borrowers.filter((borrower) =>
    borrower.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get active loans count for each borrower
  const getActiveLoansCount = (borrowerId: number) => {
    return loans.filter(
      (loan) => loan.borrowerId === borrowerId && loan.status !== "paid"
    ).length;
  };

  const handleDeleteClick = (borrower: Borrower) => {
    setBorrowerToDelete(borrower);
  };

  const handleConfirmDelete = async () => {
    if (borrowerToDelete) {
      await onDeleteBorrower(borrowerToDelete.id);
      setBorrowerToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Mutuários</CardTitle>
          <Button asChild>
            <Link href="/borrowers/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Mutuário
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar mutuário..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-center">Empréstimos Ativos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBorrowers.length > 0 ? (
                  filteredBorrowers.map((borrower) => {
                    const activeLoansCount = getActiveLoansCount(borrower.id);
                    
                    return (
                      <TableRow key={borrower.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center text-white">
                              <span className="text-xs font-medium">
                                {getInitials(borrower.name)}
                              </span>
                            </div>
                            <div className="ml-3 font-medium">
                              {borrower.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{borrower.email || "—"}</div>
                            <div className="text-muted-foreground">
                              {borrower.phone || "—"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {activeLoansCount > 0 ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              {activeLoansCount}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <Link href={`/borrowers/${borrower.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(borrower)}
                              disabled={activeLoansCount > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhum mutuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={borrowerToDelete !== null}
        onOpenChange={(open) => !open && setBorrowerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              mutuário {borrowerToDelete?.name} do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BorrowersList;
