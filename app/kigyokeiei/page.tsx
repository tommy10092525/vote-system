"use client"

import React, { useEffect, useState } from 'react'
import VoteButton from './components/VoteButton'
import useSWR from "swr"
import ResultShow from './components/Result'
import { createBrowserClient } from '@supabase/ssr'
import { supabase } from '@/utils/supabase/supabaseClient'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { start, end } from './constants/constants'
import { ArrowLeftRight } from 'lucide-react'

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

    const channel = supabase.channel("votes").on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "votes"
    }, (payload) => {
      setLatestPayload(payload)
    })

    channel.subscribe()
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

    setInterval(() => {
      setNow(new Date())
    }, 1000)

  }, [])

  useEffect(() => {
    if (!!latestPayload) {
      // alert(`payload:${JSON.stringify(latestPayload.new)}`)
      // setLatestPayload(latestPayload.new)
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
        // 受信した投票のnumと直近の自分の投票のnumが等しい場合toastを表示せず、additionを0にする。
        // alert("受信した投票のnumと直近の自分の投票のnumが等しい場合toastを表示せず、additionを0にする。")
        setLatestMyAnswerNumber({ addition: 0, deletion: latestMyAnswerNumber.deletion })
        setLatestPayload(null)
        return;
      } else if (latestPayload.new.change < 0 && latestPayload.new.num === latestMyAnswerNumber.deletion) {
        // 受信した投票の削除のnumと直近の自分の投票の削除のnumが等しい場合toastを表示せず、deletionを0にする。
        // alert("受信した投票の削除のnumと直近の自分の投票の削除のnumが等しい場合toastを表示せず、deletionを0にする。")
        setLatestMyAnswerNumber({ addition: latestMyAnswerNumber.addition, deletion: 0 })
        setLatestPayload(null)
        return;
      } else {
        // alert(`受信したnumと保持しているnumが違う${JSON.stringify(latestMyAnswerNumber)}`)
      }
      // alert(JSON.stringify(latestPayload))
      // alert(JSON.stringify(latestMyAnswerNumber))
      if (latestPayload.new.change > 0) {
        toast(`問${latestPayload.new.num}への投票(${latestPayload.new.answer ? "正しい" : "誤り"})を受信しました`)
      } else {
        // toast(`問${latestPayload.new.num}への投票(${latestPayload.new.answer ? "正しい" : "誤り"})が削除されました。`, {
        //   action: {
        //     label: "OK",
        //     onClick: () => { }
        //   },
        // })
      }
      // alert(`latestMyAnswerNumber:${JSON.stringify(latestMyAnswerNumber)}`)
    }
  }, [latestMyAnswerNumber, latestPayload]);
  async function handleMyAnswerChange(num: number, answer: "correct" | "incorrect" | "none", change: number) {
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
        // alert(`${num}の投票を追加します${JSON.stringify(latestMyAnswerNumber)}`)
        setLatestMyAnswerNumber({ addition: num, deletion: latestMyAnswerNumber.deletion })
        // alert(`${num}の投票を追加しました${JSON.stringify(latestMyAnswerNumber)}`)
      } else {
        // alert(`${num}の投票を削除します${JSON.stringify(latestMyAnswerNumber)}`)
        setLatestMyAnswerNumber({ addition: latestMyAnswerNumber.addition, deletion: num })
        // alert(`${num}の投票を削除しました${JSON.stringify(latestMyAnswerNumber)}`)
      }
      await supabase.from("votes").insert({ num: num, answer: answer === "correct", change: change })
      let nextMyAnswers = myAnswers.map((item) => item.num === num ? { ...item, answer: answer } : item)
      setMyAnswers(nextMyAnswers)
      localStorage.setItem("votes", JSON.stringify(nextMyAnswers))
    }
  }


  return (
    <div className=' p-3 w-full bg-slate-100'>
      <div className='max-w-xl mx-auto'>
        <p className='text-2xl'>企業経営入門投票システム</p>
        <p>現在時刻:{now.toLocaleString()}</p>
        <p>{end < now ? "テスト終了済み" : (start > now ? `テスト開始まであと${Math.floor((start.getTime() - now.getTime()) / 86400000)}日${Math.floor((start.getTime() - now.getTime()) / 3600000) % 24}時間${Math.floor((start.getTime() - now.getTime()) / 60000) % 60}分${Math.floor((start.getTime() - now.getTime()) / 1000) % 60}秒` : `テスト終了まであと${Math.floor((now.getTime() - end.getTime()) / 86400000)}日${Math.floor((now.getTime() - end.getTime()) / 3600000) % 24}時間${Math.floor((now.getTime() - end.getTime()) / 60000) % 60}分${Math.floor((now.getTime() - end.getTime()) / 1000) % 60}秒`)}</p>
        {/* <p>{JSON.stringify(latestMyAnswerNumber)}</p>
        <p>{JSON.stringify(latestPayload)}</p> */}
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