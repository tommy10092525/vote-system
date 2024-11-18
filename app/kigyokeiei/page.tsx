"use client"

import React, { useEffect, useState } from 'react'
import VoteButton from './components/VoteButton'
import useSWR from "swr"
import ResultShow from './components/Result'

type Response = { num: number, answer: boolean, sum: number }[]
type Result = { num: number, trueCount: number, falseCount: number }[]
type MyVote = { num: number, answer: boolean }

async function fetcher(url: string) {
  return fetch(url).then((res) => res.json() as Promise<Response | null>);
}

export default function () {
  const [votes, setVotes] = useState<MyVote[]>([]);
  useEffect(function () {
    const restoredVotes = localStorage.getItem("votes")
    if (!!restoredVotes) {
      console.log("restored!")
      try {
        setVotes(JSON.parse(restoredVotes));
      } catch {
        localStorage.setItem("votes", JSON.stringify([]))
      }
    } else {
      localStorage.setItem("votes", JSON.stringify([]));
    }
  }, [])
  useEffect(function () {
    localStorage.setItem("votes", JSON.stringify(votes));
  }, [votes])
  const url = "/kigyokeiei/api/get"
  const { data, error, isLoading } = useSWR(url, fetcher,{refreshInterval:5000});
  let results: Result = [];
  let resultElement = [];
  if (!isLoading && !!data) {
    console.log(data)
    for (let i = 1; i <= 10; i++) {
      let result = { num: i, trueCount: 0, falseCount: 0 };
      results.push(result);
    }
    for (let item of data) {
      for (let j of results) {
        if (j.num === item.num) {
          if (item.answer) {
            j.trueCount += item.sum;
          } else {
            j.falseCount += item.sum;
          }
        }
      }
    }
    console.log(results);
    for (let i of results) {
      resultElement.push(

        <ResultShow
          num={i.num}
          trueCount={i.trueCount}
          falseCount={i.falseCount}
          key={i.num}
        />
      )
    }
  }




  let e = [];
  if (!!error) {
    console.log(JSON.stringify(error));
  }
  for (let i = 1; i <= 10; i++) {
    e.push(<VoteButton
      num={i}
      votes={votes}
      key={i}
      handleVotes={function (vote: MyVote) {
                let nextVotes = JSON.parse(JSON.stringify(votes));
        let f = true;
        for (let item of nextVotes) {
          if (vote.num === item.num) {
            item.answer = vote.answer;
            f = false;
            break;
          }
        }
        if (f) {
          nextVotes.push(vote);
        }
        setVotes(nextVotes);
      }} />
    )
  }
  return (
    <div className='float-left bg-gray-900 p-3 w-full text-white'>
      <p>企業経営入門投票システム</p>
      <div className='float-left w-1/2'>
        {e.map(item => item)}
      </div>
      {/* <button
        className='border-2 bg-red-600 shadow-lg border-black rounded-md text-black'
        onClick={() => {
          setVotes([]);
          window.location.reload()
        }}>キャッシュを削除する</button> */}
      <div className='float-left w-1/2'>
        <p className='text-xl'>投票結果</p>
        {!isLoading ? <>
          {resultElement.map(item => item)}
        </> : <>Loading...</>}
      </div>
    </div>
  )
}

export type { ResultShow as Result, MyVote }
