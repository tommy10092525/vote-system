"use client"

import React, { useEffect, useState } from 'react'
import VoteButton from './components/VoteButton'
import useSWR from "swr"
import ResultShow from './components/Result'
import { createBrowserClient } from '@supabase/ssr'
import { supabase } from '@/utils/supabase/supabaseClient'
type ResponseType = { num: number, answer: boolean, sum: number }[]
type Vote = { num: number, answer: "correct" | "incorrect" | "none" }
type PublicVote = { num: number, answer: "correct" | "incorrect" | "none", count: number }


export default function () {
  const [publicAnswers, setPublicAnswers] = useState<PublicVote[]>(() => {
    const initialArray: PublicVote[] = Array(10).fill(null).map((_, i) => ({
      num: i + 1,
      answer: "correct",
      count: 0
    }));
    for (let i = 0; i < 10; i++) {
      initialArray.push({ num: i + 1, answer: "incorrect", count: 0 })
    }
    return initialArray;
  });

  const [myAnswers, setMyAnswers] = useState<Vote[]>(() => {
    const initialArray = Array(10).fill(null).map((_, i) => ({
      num: i + 1,
      answer: "none" as const
    }));
    return initialArray;
  });
  const [latestAnswer, setLatestAnswer] = useState<string>("");
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  useEffect(() => {
    const savedVotes = localStorage.getItem("votes");
    if (savedVotes) {
      setMyAnswers(JSON.parse(savedVotes));
    }

    const channel = supabase.channel("votes").on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "votes"
    }, (payload) => {
      console.log("payload",payload)
      setPublicAnswers(prev => {
        let next = structuredClone(prev)
        for (let i of next) {
          if (i.num === payload.new.num && (i.answer==="correct")===payload.new.answer) {
            i.count += payload.new.change
            break;
          }
        }
        return next
      })
    })
    channel.subscribe()
    supabase.from("result").select("*").then((res) => {
      let nextPublicVotes: PublicVote[] = []
      for (let i = 0; i < 10; i++) {
        nextPublicVotes.push({ num: i + 1, answer: "correct", count: 0 })
      }
      for (let i = 0; i < 10; i++) {
        nextPublicVotes.push({ num: i + 1, answer: "incorrect", count: 0 })
      }
      res.data?.map((item) => {
        nextPublicVotes.find((vote) => vote.num === item.num && item.answer === (vote.answer === "correct"))!.count = item.cnt
      })
      setPublicAnswers(nextPublicVotes)
    })

  }, [])
  async function handleMyAnswerChange(num: number, answer: "correct" | "incorrect" | "none", change: number) {
    if(answer==="none"){
      await supabase.from("votes").insert({num:num,answer:myAnswers[num-1].answer==="correct",change:-1})
      console.log("handleMyAnswerChange",answer);
      let nextMyAnswers = myAnswers.map((item) => item.num === num ? { ...item, answer: answer } : item)
      setMyAnswers(nextMyAnswers)
      localStorage.setItem("votes", JSON.stringify(nextMyAnswers))
    }else{
      await supabase.from("votes").insert({num:num,answer:answer==="correct",change:change})
      let nextMyAnswers = myAnswers.map((item) => item.num === num ? { ...item, answer: answer } : item)
      setMyAnswers(nextMyAnswers)
      localStorage.setItem("votes", JSON.stringify(nextMyAnswers))
    }
    
  }


  return (
    <div className=' p-3 w-full bg-slate-100'>
      <div className='max-w-xl mx-auto'>
        <p className='text-2xl'>企業経営入門投票システム</p>
        <div className="">
          {myAnswers.map((item, index) => {
            return <div key={index} className='bg-white p-3 rounded-lg my-3 shadow-md'>
              <div className='bg-gray-100 p-3 rounded-lg shadow-md'>
                <VoteButton
                  num={index + 1}
                  myAnswers={myAnswers}
                  publicAnswers={publicAnswers}
                  handleMyAnswerChange={handleMyAnswerChange}
                />
              </div>
              <ResultShow
                num={index + 1}
                publicAnswers={publicAnswers}
              />
            </div>
          })}

        </div>
      </div>
        
    </div>
  )
}

export type { ResponseType, PublicVote, Vote }