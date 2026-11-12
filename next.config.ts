import type { NextConfig } from 'next';
const config: NextConfig = { poweredByHeader: false, outputFileTracingIncludes: {'/*':['./content/**/*.html','./lib/catalogue.json']} };
export default config;
