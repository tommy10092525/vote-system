"use client"

import React, { useEffect, useState } from 'react'
import VoteButton from './components/VoteButton'
import useSWR from "swr"
import ResultShow from './components/Result'

type Response = { num: number, answer: boolean, sum: number }[]
type Result = { num: number, trueCount: number, falseCount: number }[]
type MyVote = { num: number, answer: boolean }

const fetcher = async (url: string) => {
  return fetch(url).then((res) => res.json() as Promise<Response | null>);
}

export default function () {


  let results: { num: number, myVote: MyVote ,isVoted:boolean}[] = [];
  for(let i=0;i<10;i++){
    results.push({num:i+1,myVote:{num:0,answer:false},isVoted:false})
  }
  console.log(localStorage.getItem("votes"))
  return (
    <div className='float-left bg-gray-900 p-3 w-full text-white'>
      <div className='max-w-xl mx-auto'>
      <p className='text-2xl'>企業経営入門投票システム</p>
      {/* <p>{localStorage.getItem("votes")}</p> */}
      {results.map(item => <VoteButton num={item.num} key={item.num}/>)}
      </div>
    </div>
  )
}

export type { ResultShow as Result, MyVote }
export { fetcher }