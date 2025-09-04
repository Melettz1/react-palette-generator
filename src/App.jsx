import React, { useState, useEffect } from 'react'

function randHex(){
  return '#'+Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0').toUpperCase();
}

export default function App(){
  const [count, setCount] = useState(5);
  const [colors, setColors] = useState([]);
  const [locks, setLocks] = useState([]);
  const [saved, setSaved] = useState([]);

  useEffect(()=>{
    generate(count);
    loadSaved();
  },[]);

  function generate(n){
    const arr = Array.from({length:n}, ()=>randHex());
    const lks = Array(n).fill(false);
    setColors(arr);
    setLocks(lks);
  }

  function toggleLock(i){
    const lks = [...locks];
    lks[i] = !lks[i];
    setLocks(lks);
  }

  async function copy(hex){
    try{
      await navigator.clipboard.writeText(hex);
      alert(hex + ' copiado!');
    }catch{
      alert('Falha ao copiar');
    }
  }

  function save(){
    const name = prompt('Nome da paleta (opcional):') || 'Paleta';
    const pal = { name, colors, created: new Date().toISOString() };
    const arr = JSON.parse(localStorage.getItem('palettes')||'[]');
    arr.push(pal);
    localStorage.setItem('palettes', JSON.stringify(arr));
    loadSaved();
  }

  function loadSaved(){
    const arr = JSON.parse(localStorage.getItem('palettes')||'[]');
    setSaved(arr);
  }

  function applyPalette(pal){
    setColors(pal.colors);
    setLocks(Array(pal.colors.length).fill(false));
  }

  function deletePalette(idx){
    const arr = JSON.parse(localStorage.getItem('palettes')||'[]');
    arr.splice(idx,1);
    localStorage.setItem('palettes', JSON.stringify(arr));
    loadSaved();
  }

  function exportPNG(){
    const canvas = document.createElement('canvas');
    const w = 100 * colors.length;
    const h = 100;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    colors.forEach((c,i)=>{
      ctx.fillStyle = c;
      ctx.fillRect(i*100,0,100,h);
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palette.png';
    a.click();
  }

  function exportASE(){
    // Simple ASE-like text (not full binary ASE)
    const content = colors.join('\n');
    const blob = new Blob([content], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'palette.ase.txt';
    a.click();
  }

  return (
    <div style={{padding:'16px',maxWidth:'1000px',margin:'auto'}}>
      <h1>Palette Generator</h1>
      <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
        <label>Quantidade: <input type="number" value={count} min={2} max={8}
          onChange={e=>setCount(parseInt(e.target.value)||5)} /></label>
        <button onClick={()=>generate(count)}>Gerar</button>
        <button onClick={save}>Salvar paleta</button>
        <button onClick={exportPNG}>Exportar PNG</button>
        <button onClick={exportASE}>Exportar ASE</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:`repeat(auto-fit,minmax(120px,1fr))`,gap:'10px'}}>
        {colors.map((c,i)=>(
          <div key={i} style={{background:c,height:'140px',borderRadius:'10px',
            display:'flex',flexDirection:'column',justifyContent:'space-between',cursor:'pointer'}}
            onClick={()=>copy(c)}>
            <div style={{padding:'8px',background:'rgba(0,0,0,0.2)',display:'flex',justifyContent:'space-between'}}>
              <span>{c}</span>
              <span onClick={e=>{e.stopPropagation();toggleLock(i)}}>{locks[i]?'🔒':'🔓'}</span>
            </div>
          </div>
        ))}
      </div>

      <h2>Paletas salvas</h2>
      <ul style={{listStyle:'none',padding:0}}>
        {saved.map((p,idx)=>(
          <li key={idx} style={{marginBottom:'10px',padding:'8px',background:'#111',borderRadius:'8px'}}>
            <div>{p.name} — {(new Date(p.created)).toLocaleString()}</div>
            <div style={{display:'flex',gap:'6px',marginTop:'4px'}}>
              {p.colors.map((c,i)=>(<div key={i} style={{width:'24px',height:'24px',background:c}}></div>))}
            </div>
            <div style={{marginTop:'6px'}}>
              <button onClick={()=>applyPalette(p)}>Aplicar</button>
              <button style={{marginLeft:'6px'}} onClick={()=>deletePalette(idx)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
