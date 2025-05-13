import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { truncateText } from "@/lib/utils";

interface Column {
  header: string;
  accessor: string;
  format?: (value: any) => string;
  align?: "left" | "center" | "right";
}

interface DataTableProps {
  title?: string;
  data: any[];
  columns: Column[];
}

export default function DataTable({ title, data, columns }: DataTableProps) {
  // Function to safely get nested property value using dot notation
  const getPropertyValue = (obj: any, path: string) => {
    const keys = path.split(".");
    return keys.reduce((acc, key) => {
      if (acc === null || acc === undefined) return acc;
      
      // Handle array index notation like keys.0
      if (key.includes("[") && key.includes("]")) {
        const arrayKey = key.substring(0, key.indexOf("["));
        const index = parseInt(key.substring(key.indexOf("[") + 1, key.indexOf("]")));
        return acc[arrayKey] ? acc[arrayKey][index] : undefined;
      }
      
      // Handle simple array index like keys.0
      if (!isNaN(parseInt(key))) {
        return acc[parseInt(key)];
      }
      
      return acc[key];
    }, obj);
  };

  // Apply text alignment class based on column setting
  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case "right":
        return "text-right";
      case "center":
        return "text-center";
      default:
        return "text-left";
    }
  };

  return (
    <Card>
      {title && (
        <CardHeader className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <a href="#" className="text-primary-600 hover:text-primary-900 text-sm font-medium">
            View all
          </a>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${getAlignmentClass(column.align)}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => {
                      const value = getPropertyValue(row, column.accessor);
                      const displayValue = column.format ? column.format(value) : value;
                      
                      return (
                        <td
                          key={colIndex}
                          className={`px-6 py-4 whitespace-nowrap text-sm ${colIndex === 0 ? "font-medium text-gray-900" : "text-gray-500"} ${getAlignmentClass(column.align)}`}
                        >
                          {column.header.toLowerCase() === "page" || column.header.toLowerCase() === "query" ? (
                            <div className="truncate max-w-xs">
                              {truncateText(displayValue, 50)}
                            </div>
                          ) : (
                            displayValue
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
