import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export function DataTable<T extends object>({
  columns,
  data,
}: {
  columns: Column<T>[];
  data: T[];
}) {
  return (
    <div className="rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-950/20 border-b border-slate-200 dark:border-slate-800">
            {columns.map((column) => (
              <TableHead key={column.key.toString()} className="font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
              {columns.map((column) => (
                <TableCell key={column.key.toString()} className="text-xs sm:text-sm">
                  {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "-")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
