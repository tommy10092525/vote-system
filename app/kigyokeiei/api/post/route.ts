import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Vote } from "../../page";
import { supabase } from "@/utils/supabase/supabaseClient";
import { GetServerSideProps } from "next";

type Post=Vote&{change:number}

export async function POST(request: Request) {
  // console.log(request)
  const data=await(request.json())
  console.log(data)
  if(data.access){
    supabase.from("log_access").insert({
      ip:request.headers.get("x-forwarded-for"),
    }).then(i=>{
      console.log(i)
      console.log("log_access")
    })
  }else if(data.problemId){
    supabase.from("log_post").insert({
      ip:request.headers.get("x-forwarded-for"),
      problem_id:data.problemId,
    }).then(i=>{
      console.log(i)
      console.log("log_post")
    })
  }else{
    supabase.from("log_message").insert({
      ip:request.headers.get("x-forwarded-for"),
      message:data.message
    }).then(i=>{
      console.log(i)
      console.log("log_message")
      console.log(data.message)
    })
  }
  // return NextResponse.json(data)
  return NextResponse.json({success:true})
}