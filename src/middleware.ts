import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
      match all paths except for
      1. /api routes
      2. /_next (nextjs internals)  
      3. /_static (inside /public)
      4. All route files inside /public (e.g. favicon.ico)
      5. Static files with extensions (e.g. .svg, .png, .jpg, .ico)
    */
    "/((?!api/|_next/|_static/|_vercel|media/).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Skip rewriting if this is a static file (has a file extension)
  // This prevents /logo.svg, /favicon.ico, etc. from being rewritten
  if (url.pathname.includes(".") && !url.pathname.endsWith("/")) {
    return NextResponse.next();
  }

  //extract the hostname, i.e. omkar-farms.harvestly.com
  const hostname = req.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";

  if (hostname.endsWith(`.${rootDomain}`)) {
    const tenantSubdomain = hostname.replace(`.${rootDomain}`, "");
    return NextResponse.rewrite(
      new URL(`/tenants/${tenantSubdomain}${url.pathname}`, req.url)
    );
  }

  return NextResponse.next();
}
