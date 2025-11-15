export { default } from "next-auth/middleware";

// Protect these routes - users must be authenticated to access them
export const config = {
  matcher: [
    // Add protected routes here
    // "/dashboard/:path*",
    // "/profile/:path*",
  ],
};
