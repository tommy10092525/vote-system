import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { MyVote } from "../../page";

type Post=MyVote&{change:number}

export async function POST(request: Request) {
  const supabase=await createClient();
  const data:Post=await request.json();
  console.log(data)
  const {error} = await supabase.from("votes").insert({num:data.num,answer:data.answer,change:data.change})
  console.log(error);
  return NextResponse.json([{num:1,answer:true},{num:2,answer:false}])
}