// Changes with every deploy so browsers always fetch the latest design scripts and styles.
export const V='?v='+(process.env.VERCEL_GIT_COMMIT_SHA||process.env.VERCEL_DEPLOYMENT_ID||'dev').slice(0,8);
