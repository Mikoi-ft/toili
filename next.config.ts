import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma's generated query-engine binary lives in lib/generated/prisma.
  // Force Next.js to trace it into the serverless function bundle on Vercel,
  // otherwise runtime fails with "could not locate the Query Engine for
  // runtime rhel-openssl-3.0.x".
  outputFileTracingIncludes: {
    "/**": ["./lib/generated/prisma/**/*"],
  },
};

export default withNextIntl(nextConfig);
