import {handler} from './api.mjs';

// Service credentials are supplied by Supabase's Edge runtime, never by the client.
// The router verifies Auth tokens and administrator membership on protected routes.
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'GET, POST, PUT, PATCH, OPTIONS'};
Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(Number(req.headers.get('content-length')||0)>7000000)return Response.json({error:'Request too large'},{status:413,headers:cors});
  const url=new URL(req.url);
  const path=url.pathname.replace(/^\/functions\/v1\/store-api/,'').replace(/^\/store-api/,'');
  const response=await handler({httpMethod:req.method,path:'/api'+path,headers:Object.fromEntries(req.headers),queryStringParameters:Object.fromEntries(url.searchParams),body:['GET','HEAD'].includes(req.method)?undefined:await req.text()});
  return new Response(response.body,{status:response.statusCode,headers:{...cors,...response.headers}});
});

