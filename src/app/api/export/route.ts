import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkFeatureAccess } from "@/lib/access-control";

/**
 * API Route: Export Market Data
 * This route is protected and only accessible to Pro users with exportData feature
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user has access to export feature
    const { authorized, response, userId } = await checkFeatureAccess(req, "exportData");

    if (!authorized || !userId) {
      return response!;
    }

    const body = await req.json();
    const { data, format = "json" } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Format data based on requested format
    let exportData: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "csv":
        contentType = "text/csv";
        filename = "market-data.csv";
        exportData = convertToCSV(data);
        break;
      case "json":
        contentType = "application/json";
        filename = "market-data.json";
        exportData = JSON.stringify(data, null, 2);
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported format" },
          { status: 400 }
        );
    }

    return new NextResponse(exportData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

/**
 * Convert array of objects to CSV format
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(","));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // Escape values that contain commas or quotes
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}
