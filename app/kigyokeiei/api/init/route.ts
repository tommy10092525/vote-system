import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";


export async function GET(request: Request) {
  const supabase = await createClient();
  for(let i=0;i<=10;i++){
    await supabase.from("votes").insert({num:i,answer:true,change:0})
    await supabase.from("votes").insert({num:i,answer:false,change:0})
  }
  return NextResponse.json({status:"success!"})
}