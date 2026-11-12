import type { NextConfig } from 'next';
const config: NextConfig = { poweredByHeader: false, async rewrites(){return [{source:'/studio',destination:'/studio/index.html'}]}, async redirects(){return [{source:'/room-studio',destination:'/studio',permanent:false}]}, outputFileTracingIncludes: {'/*':['./content/**/*.html','./lib/catalogue.json']} };
export default config;
