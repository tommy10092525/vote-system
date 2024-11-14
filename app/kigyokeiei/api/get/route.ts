import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase=await createClient();
  const {data,count,error} = await supabase.from("votes").select(`
    num,
    answer,
    change.sum()`)
  
  return NextResponse.json(data)
}