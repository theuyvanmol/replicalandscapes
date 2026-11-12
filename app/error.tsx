"use client";
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){return <main className="commerce-main"><h1>Let’s try that again.</h1><p>We could not load or update the store. Please check your connection and try again.</p><button className="pill" onClick={reset}>Try again</button><a href="/shop">Back to shop</a></main>}
