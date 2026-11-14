/** Pisos em ordem decrescente, como na tela 09; o ativo é indicado por aria-pressed e texto. */
export function FloorSelector({floors,activeId,onSelect}){
 return <div className="floor-selector" role="group" aria-label="Pisos">
  {[...floors].reverse().map(floor=>{const active=floor.id===activeId;return <button type="button" key={floor.id} aria-pressed={active}
   aria-label={`${floor.name}${active?" selecionado":""}`} onClick={()=>onSelect(floor.id)}>{floor.label}</button>;})}
 </div>;
}
