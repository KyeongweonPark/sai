import { env } from "cloudflare:workers";
export const runtime = () => env as unknown as {OPENAI_API_KEY?:string;INTERPRETER_PIN?:string;DB:{prepare:(sql:string)=>{bind:(...args:unknown[])=>{first:<T>()=>Promise<T|null>;run:()=>Promise<unknown>}}}};
export async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,"0")).join("");}
export function error(message:string,status:number){return Response.json({error:message},{status,headers:{"Cache-Control":"no-store"}});}
export function sameOrigin(request:Request){const origin=request.headers.get("origin");return !origin||origin===new URL(request.url).origin;}
