"use client";
import {useEffect,useState} from 'react';
/* Records when the form was shown, so instant bot submissions can be refused. */
export default function RegTime(){const [t,setT]=useState('');useEffect(()=>setT(String(Date.now())),[]);return <input type="hidden" name="t" value={t}/>;}
