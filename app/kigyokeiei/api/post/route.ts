import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { MyVote } from "../../page";
import { supabase } from "@/utils/supabase/supabaseClient";

type Post=MyVote&{change:number}

export async function POST(request: Request) {
  
  const data:Post=await request.json();
  console.log(data)
  const {error} = await supabase.from("votes").insert({
    num:data.num,
    answer:data.answer,
    change:data.change
  })
  console.log(error);
  return NextResponse.json({success:true})
}