import {runtime,digest,error,sameOrigin} from "@/lib/interpreter-auth";
export async function POST(request:Request){
 if(!sameOrigin(request))return error("허용되지 않은 요청입니다.",403);
 try{
  const {DB,INTERPRETER_PIN,OPENAI_API_KEY}=runtime();
  if(!DB||!INTERPRETER_PIN||!OPENAI_API_KEY)return error("서버 연결 설정이 필요합니다. 관리자에게 문의해 주세요.",503);
  const raw=await request.text();if(raw.length>256)return error("요청이 너무 큽니다.",413);
  let pin,locale;try{({pin,locale}=JSON.parse(raw));}catch{return error("PIN을 입력해 주세요.",400);}
  const message=(ko:string,ja:string,en:string)=>locale==="ja"?ja:locale==="en"?en:ko;
  const now=Math.floor(Date.now()/1000),expires=now+900;
  // The version prefix clears counters created by the previous faulty logic.
  const clientKey=request.headers.get("cf-connecting-ip")||request.headers.get("x-real-ip")||request.headers.get("user-agent")||crypto.randomUUID();
  const id=await digest(`pin-limit-v2:${clientKey}`);
  await DB.prepare("DELETE FROM pin_attempts WHERE expires < ?").bind(now).run();
  await DB.prepare("DELETE FROM session_tickets WHERE expires < ?").bind(now).run();
  await DB.prepare("DELETE FROM text_sessions WHERE expires < ?").bind(now).run();
  const supplied=await digest(typeof pin==="string"?pin:"");const expected=await digest(INTERPRETER_PIN);
  let difference=0;for(let i=0;i<expected.length;i++)difference|=supplied.charCodeAt(i)^expected.charCodeAt(i);
  if(difference!==0){
   const row=await DB.prepare("INSERT INTO pin_attempts (id, attempts, expires) VALUES (?, 1, ?) ON CONFLICT(id) DO UPDATE SET attempts = attempts + 1, expires = ? RETURNING attempts").bind(id,expires,expires).first<{attempts:number}>();
   if(!row||row.attempts>=5)return error(message("PIN 입력 횟수를 초과했습니다. 15분 후 다시 시도해 주세요.","PINの入力回数を超えました。15分後に再試行してください。","Too many PIN attempts. Please try again in 15 minutes."),429);
   return error(message("PIN이 올바르지 않습니다. 다시 입력해 주세요.","PINが正しくありません。もう一度入力してください。","The PIN is incorrect. Please try again."),401);
  }
  // A correct PIN resets failed attempts immediately.
  await DB.prepare("DELETE FROM pin_attempts WHERE id = ?").bind(id).run();
  const ticket=crypto.randomUUID()+crypto.randomUUID(),textToken=crypto.randomUUID()+crypto.randomUUID();
  await DB.prepare("INSERT INTO session_tickets (id, expires) VALUES (?, ?)").bind(await digest(ticket),now+120).run();
  await DB.prepare("INSERT INTO text_sessions (id, expires) VALUES (?, ?)").bind(await digest(textToken),now+7200).run();
  return Response.json({ticket,textToken},{headers:{"Cache-Control":"no-store"}});
 }catch{return error("PIN 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.",503);}
}
