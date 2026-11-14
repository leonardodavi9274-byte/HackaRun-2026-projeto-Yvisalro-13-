import {navigate} from "./navigation.js";
export function AppLink({to,children,onClick,...props}){return <a href={to} {...props} onClick={e=>{onClick?.(e);if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();navigate(to);}}>{children}</a>;}
