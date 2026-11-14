import {requestReset,completeReset} from '@/app/auth-actions';
import {emailReady} from '@/lib/email';
export function ForgotForm({team,sent,e}:{team?:boolean;sent?:boolean;e?:string}){
 if(!emailReady)return <p className="auth-small">Password reset by email is being set up. In the meantime {team?'ask the account owner to reset your access from the Team page':<>call <a href="tel:01661871481">01661 871 481</a> and we’ll help</>}.</p>;
 if(sent)return <p className="auth-notice ok" role="status">If there’s an account with that email, we’ve sent a link to choose a new password. It works for one hour. Check your spam folder if it hasn’t arrived in a few minutes.</p>;
 return <>{e==='email'&&<p className="auth-notice error" role="alert">Enter a valid email address.</p>}{e==='slow'&&<p className="auth-notice error" role="alert">Too many requests. Please wait 15 minutes.</p>}
  <form action={requestReset} className="auth-form">{team&&<input type="hidden" name="team" value="1"/>}<label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required/><button className="pill auth-submit">Email me a reset link <span aria-hidden="true">↗</span></button></form></>;
}
export function ResetForm({team,t,e,needCode}:{team?:boolean;t:string;e?:string;needCode:boolean}){
 const M:Record<string,string>={password:'Use at least 10 characters.',code:'That code isn’t right. Try the latest code from your authenticator app, or a backup code.',slow:'Too many attempts. Please wait 15 minutes.'};
 return <>{e&&M[e]&&<p className="auth-notice error" role="alert">{M[e]}</p>}
  <form action={completeReset} className="auth-form">{team&&<input type="hidden" name="team" value="1"/>}<input type="hidden" name="t" value={t}/>
   <label htmlFor="password">New password</label><input id="password" name="password" type="password" minLength={10} autoComplete="new-password" required/><span className="auth-hint">At least 10 characters. A short sentence works well.</span>
   {needCode&&<><label htmlFor="code">Code from your authenticator app</label><input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" required/><span className="auth-hint">Or one of your backup codes.</span></>}
   <button className="pill auth-submit">Save new password <span aria-hidden="true">↗</span></button></form></>;
}
