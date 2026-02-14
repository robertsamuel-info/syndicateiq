import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../ui/Table';
import { Loan } from '../../../types';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { getRiskLevel } from '../../../lib/utils/calculateRiskScore';

interface LoansTableProps {
  loans: Loan[];
}

export function LoansTable({ loans }: LoansTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.borrower.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: Loan['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'at-risk':
        return <Badge variant="warning">At Risk</Badge>;
      case 'matured':
        return <Badge variant="info">Matured</Badge>;
      case 'defaulted':
        return <Badge variant="danger">Defaulted</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getRiskBadge = (riskScore: number) => {
    const level = getRiskLevel(riskScore);
    return (
      <Badge variant={level === 'low' ? 'success' : level === 'medium' ? 'warning' : 'danger'}>
        {riskScore.toFixed(0)}
      </Badge>
    );
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Portfolio Loans</h3>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial md:w-64">
              <Input
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="at-risk">At Risk</option>
              <option value="matured">Matured</option>
              <option value="defaulted">Defaulted</option>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>ESG Score</TableHead>
                <TableHead>Maturity Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    No loans found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-mono text-sm">{loan.loanId}</TableCell>
                    <TableCell className="font-medium">{loan.borrower}</TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell>{getRiskBadge(loan.riskScore)}</TableCell>
                    <TableCell>
                      <Badge variant={loan.esgScore >= 70 ? 'success' : loan.esgScore >= 50 ? 'warning' : 'danger'}>
                        {loan.esgScore}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(loan.maturityDate)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredLoans.length)} of {filteredLoans.length}{' '}
              loans
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
