import { Card } from '../../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../ui/Table';
import { AuditLogEntry } from '../../../types';
import { formatDate } from '../../../lib/utils/formatDate';

interface AuditTrailProps {
  entries: AuditLogEntry[];
}

export function AuditTrail({ entries }: AuditTrailProps) {
  const displayedEntries = entries.slice(0, 20);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-6">Audit Trail</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Loan ID</TableHead>
              <TableHead>Document Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  No audit entries found
                </TableCell>
              </TableRow>
            ) : (
              displayedEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm text-gray-400">
                    {formatDate(entry.timestamp, 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium text-white">{entry.action}</TableCell>
                  <TableCell className="text-gray-300">{entry.user}</TableCell>
                  <TableCell className="font-mono text-sm text-gray-400">
                    {entry.loanId || 'N/A'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">
                    {entry.documentHash.slice(0, 12)}...
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
