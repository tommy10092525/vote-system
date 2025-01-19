import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Vote } from "../../page";
import { supabase } from "@/utils/supabase/supabaseClient";
import { GetServerSideProps } from "next";

type Post=Vote&{change:number}

export async function POST(request: Request) {
  console.log(request.headers)
  supabase.from("log").insert({
    ip:request.headers.get("x-forwarded-for"),
    host:request.headers.get("x-forwarded-host"),
    message:(await request.json()).message
  }).then(console.log)
  // return NextResponse.json(data)
  return NextResponse.json({success:true})
}