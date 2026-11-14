export function FormField({id,label,error,hint,children,...props}){
 return <div className="form-field"><label htmlFor={id}>{label}</label>{children||<input id={id} {...props} aria-invalid={Boolean(error)} aria-describedby={error?id+"-error":hint?id+"-hint":undefined}/>}
 {hint&&<small id={id+"-hint"}>{hint}</small>}{error&&<span className="field-error" id={id+"-error"} role="alert">{error}</span>}</div>;
}
