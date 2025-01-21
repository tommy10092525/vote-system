"use client"

import React, { useEffect, useState } from 'react'
import VoteButton from './components/VoteButton'
import useSWR from "swr"
import ResultShow from './components/Result'
import { createBrowserClient } from '@supabase/ssr'
import { supabase } from '@/utils/supabase/supabaseClient'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { start, end, email } from './constants/constants'
import { ArrowLeftRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GetServerSideProps } from 'next'


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
  const [myMessage, setMyMessage] = useState<string>("")
  const [messages, setMessages] = useState<any[]>([])
  const [now, setNow] = useState(new Date())

  // 自分の投稿によるDBの変化にはtoastを表示しないようにする。
  const [latestMyAnswerNumber, setLatestMyAnswerNumber] = useState<{ addition: number, deletion: number }>({ addition: 0, deletion: 0 })
  const [latestPayload, setLatestPayload] = useState<any>(null)

  const [myAnswers, setMyAnswers] = useState<Vote[]>(() => {
    const initialArray = Array(10).fill(null).map((_, i) => ({
      num: i + 1,
      answer: "none" as const
    }));
    return initialArray;
  });
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  useEffect(() => {
    const savedVotes = localStorage.getItem("votes");
    if (savedVotes) {
      setMyAnswers(JSON.parse(savedVotes));
    }

    supabase.channel("votes").on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "votes"
    }, (payload) => {
      setLatestPayload(payload)
    }).subscribe()

    supabase.channel("posts").on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "posts"
    }, (payload) => {
      setMessages((prev: any) => {prev.push(payload.new); return prev})
      toast(`新しい投稿「${payload.new.message}」`)
    }).subscribe()


    supabase.from("result").select("*").then((res) => {
      console.log("res", res)
      let nextPublicVotes: PublicVote[] = []
      for (let i = 0; i < 10; i++) {
        nextPublicVotes.push({ num: i + 1, answer: "correct", count: 0 })
      }
      for (let i = 0; i < 10; i++) {
        nextPublicVotes.push({ num: i + 1, answer: "incorrect", count: 0 })
      }
      console.log("nextPublicVotes", nextPublicVotes)
      res.data?.map((item) => {
        nextPublicVotes.find((vote) => vote.num === item.num && item.answer === (vote.answer === "correct"))!.count = item.cnt
      })
      setPublicAnswers(nextPublicVotes)
    })

    supabase.from("posts").select("*").then(res => {
      console.log("res", res)
      if (res.data) {
        setMessages(res.data)
      }
    }
    )

    fetch("/kigyokeiei/api/post/", {method: "POST", body: JSON.stringify({ access: true })})

    setInterval(() => {
      setNow(new Date())
    }, 1000)

  }, [])

  useEffect(() => {
    if (!!latestPayload) {
      setPublicAnswers(prev => {
        let next = structuredClone(prev)
        for (let i of next) {
          if (i.num === latestPayload.new.num && (i.answer === "correct") === latestPayload.new.answer) {
            i.count += latestPayload.new.change
            break;
          }
        }
        return next
      })
      console.log(latestMyAnswerNumber)
      if (latestPayload.new.change > 0 && latestPayload.new.num === latestMyAnswerNumber.addition) {
        setLatestMyAnswerNumber({ addition: 0, deletion: latestMyAnswerNumber.deletion })
        setLatestPayload(null)
        return;
      } else if (latestPayload.new.change < 0 && latestPayload.new.num === latestMyAnswerNumber.deletion) {
        setLatestMyAnswerNumber({ addition: latestMyAnswerNumber.addition, deletion: 0 })
        setLatestPayload(null)
        return;
      } else {
      }
      if (latestPayload.new.change > 0) {
        // toast(`問${latestPayload.new.num}への投票(${latestPayload.new.answer ? "正しい" : "誤り"})を受信しました`)
      } else {
      }
    }
  }, [latestMyAnswerNumber, latestPayload]);
  async function handleMyAnswerChange(num: number, answer: "correct" | "incorrect" | "none", change: number) {
    fetch("/kigyokeiei/api/post/", {
      method: "POST",
      body: JSON.stringify({ problemId: num }),
    })
    if (answer === "none") {
      console.log("handleMyAnswerChange", answer);
      let nextMyAnswers = myAnswers.map((item) => item.num === num ? { ...item, answer: answer } : item)
      setMyAnswers(nextMyAnswers)
      localStorage.setItem("votes", JSON.stringify(nextMyAnswers))
      setLatestMyAnswerNumber({ addition: latestMyAnswerNumber.addition, deletion: num })
      // alert(`${num}の投票を削除しました`)
      await supabase.from("votes").insert({ num: num, answer: myAnswers[num - 1].answer === "correct", change: -1 })
    } else {
      if (change > 0) {
        setLatestMyAnswerNumber({ addition: num, deletion: latestMyAnswerNumber.deletion })
      } else {
        setLatestMyAnswerNumber({ addition: latestMyAnswerNumber.addition, deletion: num })
      }
      await supabase.from("votes").insert({ num: num, answer: answer === "correct", change: change })
      let nextMyAnswers = myAnswers.map((item) => item.num === num ? { ...item, answer: answer } : item)
      setMyAnswers(nextMyAnswers)
      localStorage.setItem("votes", JSON.stringify(nextMyAnswers))
    }
  }

  console.log(JSON.stringify(messages))

  return (
    <div className='bg-slate-100 p-3 w-full min-h-screen font-mono'>
      <div className='mx-auto max-w-xl'>
        <div className='bg-white shadow-md p-3 rounded-lg'>
          <div className='bg-gray-100 shadow-md p-3 rounded-lg'>
            <p className='text-2xl'>企業経営入門投票システム</p>
            <p>現在時刻:{now.toLocaleString()}</p>
            <p>{end < now ? "テスト終了済み" : (start > now ? `テスト開始まであと${Math.floor((start.getTime() - now.getTime()) / 86400000)}日${Math.floor((start.getTime() - now.getTime()) / 3600000) % 24}時間${Math.floor((start.getTime() - now.getTime()) / 60000) % 60}分${Math.floor((start.getTime() - now.getTime()) / 1000) % 60}秒` : `テスト終了まであと${Math.floor((now.getTime() - end.getTime()) / 86400000)}日${Math.floor((now.getTime() - end.getTime()) / 3600000) % 24}時間${Math.floor((now.getTime() - end.getTime()) / 60000) % 60}分${Math.floor((now.getTime() - end.getTime()) / 1000) % 60}秒`)}</p>
            <p>連絡先:{email}</p>
          </div>
        </div>
        <Tabs defaultValue="vote" className="mt-3 rounded-lg w-full">
          <TabsList className='bg-gray-200 w-full'>
            <TabsTrigger value="vote" className='w-full'>投票</TabsTrigger>
            <TabsTrigger value="post" className='w-full'>投稿</TabsTrigger>
          </TabsList>
          <TabsContent value="vote">
            <div className="">
              {myAnswers.map((item, index) => {
                return <div key={index} className='bg-white shadow-md my-3 p-3 rounded-lg'>
                  <div className='bg-gray-100 shadow-md p-3 rounded-lg'>
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
          </TabsContent>
          <TabsContent value="post">
            <div className='bg-white shadow-md my-3 p-3 rounded-lg'>
              <div className='bg-gray-100 shadow-md p-3 rounded-lg'>
                <p className='text-2xl'>投稿する</p>
                <div className='mt-3'>
                  <textarea className='hover:bg-blue-200 shadow p-3 rounded-lg w-full transition-all' onChange={
                    (e) => {
                      setMyMessage(e.target.value);
                    }
                  } value={myMessage} />
                  <div className='mt-3'>
                    <Button className='bg-blue-500 hover:bg-blue-700 shadow w-full text-white' onClick={async () => {
                      await supabase.from("posts").insert({ message: myMessage, emphasis: false })
                      fetch("/kigyokeiei/api/post/", {
                        method: "POST",
                        body: JSON.stringify({ message: myMessage }),
                      })
                      console.log("myMessage", myMessage)
                      setMyMessage("")
                    }}>投稿する</Button>
                  </div>
                </div>
              </div>
              <div className='bg-gray-100 shadow-md mt-3 p-3 rounded-lg'>
                <p className='text-2xl'>投稿一覧</p>
              </div>
              <div className='mt-3'>
                {messages ? messages.toReversed().map((item: { id: number, message: string, created_at: Date }, index: number) => {
                  return (
                    <div className='bg-gray-100 shadow-md my-4 p-3 rounded-lg' key={index}>
                      <p className="font-extralight">{item.id}</p>
                      <p className='text-lg'>{item.message}</p>
                      <p>{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  )
                }):null}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


export type { ResponseType, PublicVote, Vote }