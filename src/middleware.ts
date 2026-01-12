import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware that doesn't require authentication for the main page
export function middleware(request: NextRequest) {
  // Allow all requests to pass through - no authentication required for homepage
  return NextResponse.next();
}

// Only apply middleware to specific protected routes (currently none)
export const config = {
  matcher: [
    // Add protected routes here when needed
    // "/dashboard/:path*",
    // "/profile/:path*",
  ],
};
