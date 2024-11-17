import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabase } from "@/utils/supabase/supabaseClient";

export async function GET() {
  const {data,count,error} = await supabase.from("votes").select(`
    num,
    answer,
    change.sum()`)
  
  return NextResponse.json(data)
}