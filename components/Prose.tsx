import React from 'react';
/* Renders the simple formatting used in the blog editor:
   ## Heading, ### Subheading, - bullet, 1. numbered, > quote, ![alt](image), [text](link), **bold**, *italic*. */
function inline(text:string,key=0):React.ReactNode[]{
 const out:React.ReactNode[]=[];const re=/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;let last=0,m:RegExpExecArray|null,i=0;
 while((m=re.exec(text))){if(m.index>last)out.push(text.slice(last,m.index));const t=m[0];
  if(t.startsWith('**'))out.push(<strong key={key+'-'+i++}>{t.slice(2,-2)}</strong>);
  else if(t.startsWith('*'))out.push(<em key={key+'-'+i++}>{t.slice(1,-1)}</em>);
  else{const mm=/^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(t)!;const href=/^(https?:\/\/|\/|mailto:|tel:)/.test(mm[2])?mm[2]:'#';out.push(<a key={key+'-'+i++} href={href} {...(href.startsWith('http')?{target:'_blank',rel:'noopener'}:{})}>{mm[1]}</a>);}
  last=m.index+t.length;}
 if(last<text.length)out.push(text.slice(last));return out;
}
export default function Prose({text}:{text:string}){
 const blocks=text.replace(/\r/g,'').split(/\n{2,}/).map(b=>b.trim()).filter(Boolean);
 return <div className="prose">{blocks.map((b,i)=>{
  if(b.startsWith('### '))return <h3 key={i}>{inline(b.slice(4),i)}</h3>;
  if(b.startsWith('## '))return <h2 key={i}>{inline(b.slice(3),i)}</h2>;
  const img=/^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(b);if(img&&/^(\/|https?:\/\/)/.test(img[2]))return <figure key={i}><img src={img[2]} alt={img[1]} loading="lazy"/>{img[1]&&<figcaption>{img[1]}</figcaption>}</figure>;
  const lines=b.split('\n');
  if(lines.every(l=>/^[-*] /.test(l)))return <ul key={i}>{lines.map((l,j)=><li key={j}>{inline(l.slice(2),i*100+j)}</li>)}</ul>;
  if(lines.every(l=>/^\d+\. /.test(l)))return <ol key={i}>{lines.map((l,j)=><li key={j}>{inline(l.replace(/^\d+\. /,''),i*100+j)}</li>)}</ol>;
  if(lines.every(l=>l.startsWith('> ')))return <blockquote key={i}>{inline(lines.map(l=>l.slice(2)).join(' '),i)}</blockquote>;
  return <p key={i}>{lines.flatMap((l,j)=>j?[<br key={'b'+j}/>,...inline(l,i*100+j)]:inline(l,i*100+j))}</p>;
 })}</div>;
}
