"use client";
import {useState} from 'react';
export default function QuantityPicker(){const [q,setQ]=useState(1);return <div className="quantity-picker"><button type="button" aria-label="Decrease quantity" onClick={()=>setQ(Math.max(1,q-1))}>−</button><input id="quantity" name="quantity" type="number" min={1} max={99} value={q} onChange={e=>setQ(Math.min(99,Math.max(1,Number(e.target.value)||1)))} aria-label="Quantity"/><button type="button" aria-label="Increase quantity" onClick={()=>setQ(Math.min(99,q+1))}>+</button></div>}
