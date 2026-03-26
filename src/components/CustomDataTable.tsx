// components/CustomDataTable.tsx
import React from "react";
import DataTable, { TableProps } from "react-data-table-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import LoadingState from "@/components/LoadingState";

const useCustomStyles = (
  primaryTableColor: string,
  secondaryTableColor: string,
  primaryTextColor: string,
  secondaryTextColor: string
) => ({
  table: {
    style: {
      backgroundColor: "transparent",
    },
  },
  headRow: {
    style: {
      backgroundColor: primaryTableColor,
      minHeight: "48px",
      borderBottom: `1px solid ${primaryTableColor}50`,
    },
  },
  headCells: {
    style: {
      color: secondaryTextColor,
      fontSize: "14px",
      fontWeight: "600",
      padding: "12px 16px",
    },
  },
  rows: {
    style: {
      minHeight: "48px",
      borderBottom: `1px solid ${primaryTableColor}20`,
      fontSize: "14px",
      color: primaryTextColor,
      "&:nth-of-type(odd)": {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
      },
      "&:nth-of-type(even)": {
        backgroundColor: "rgba(255, 255, 255, 0.3)",
      },
      "&:hover": {
        backgroundColor: `${primaryTableColor}10`,
        cursor: "pointer",
      },
    },
  },
  cells: {
    style: {
      padding: "12px 16px",
    },
  },
  pagination: {
    style: {
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      borderTop: `1px solid ${primaryTableColor}20`,
      color: primaryTextColor,
      minHeight: "56px",
    },
    pageButtonsStyle: {
      borderRadius: "5px",
      height: "40px",
      width: "40px",
      padding: "8px",
      margin: "2px",
      cursor: "pointer",
      transition: "0.3s",
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      color: primaryTextColor,
      fill: primaryTextColor,
      border: `1px solid ${primaryTableColor}30`,
      "&:hover:not(:disabled)": {
        backgroundColor: `${primaryTableColor}20`,
      },
      "&:disabled": {
        color: secondaryTextColor,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        cursor: "not-allowed",
        opacity: 0.5,
      },
    },
  },
  noData: {
    style: {
      padding: "24px",
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      color: primaryTextColor,
    },
  },
  progress: {
    style: {
      backgroundColor: "rgba(255, 255, 255, 0.4)",
    },
  },
});

interface CustomDataTableProps<T> extends Omit<TableProps<T>, "customStyles"> {
  title?: string;
  description?: string;
  loadingMessage?: string;
  loadingSubmessage?: string;
}

const CustomDataTable = <T,>({
  title,
  description,
  progressPending,
  ...props
}: CustomDataTableProps<T>) => {
  const { primaryTableColor, secondaryTableColor, primaryTextColor, secondaryTextColor } =
    useTheme();
  
  const customStyles = useCustomStyles(
    primaryTableColor,
    secondaryTableColor,
    primaryTextColor,
    secondaryTextColor
  );

  return (
    <Card className="overflow-hidden border-white/40 bg-white/70 backdrop-blur-sm">
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className="p-0">
        <DataTable
          {...props}
          customStyles={customStyles}
          responsive
          highlightOnHover
          progressPending={progressPending}
          progressComponent={
            <LoadingState
              message={"Loading data..."}
              submessage={"Please wait a moment"}
              fullScreen={false}
            />
          }
        />
      </CardContent>
    </Card>
  );
};

export default CustomDataTable;