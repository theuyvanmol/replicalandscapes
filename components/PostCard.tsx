import {smallImg,type Post} from '@/lib/content';
export default function PostCard({p,i}:{p:Post;i:number}){return <article className="ed-card">
 <a className="ed-card-img" href={'/blog/'+p.slug} aria-label={p.title}>{p.cover?<img src={smallImg(p.cover)} alt="" loading="lazy" decoding="async"/>:<span className="ed-noimg"/>}<span className="image-arrow" aria-hidden="true">↗</span></a>
 <span className="editorial-number">{String(i+1).padStart(2,'0')} / {p.category.toUpperCase()}</span>
 <h3><a href={'/blog/'+p.slug}>{p.title}</a></h3>{p.excerpt&&<p>{p.excerpt}</p>}
 <a className="text-link" href={'/blog/'+p.slug}>Read the story ↗</a></article>;}
