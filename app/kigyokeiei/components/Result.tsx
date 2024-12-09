import React from 'react'
import { PublicVote } from '../page'

type Props={num:number,publicAnswers:PublicVote[]}

export default function ResultShow(props:Props) {
  let {num,publicAnswers}=props;
  let trueCount=publicAnswers.find((item)=>item.num===num&&item.answer==="correct")!.count;
  let falseCount=publicAnswers.find((item)=>item.num===num&&item.answer==="incorrect")!.count;
  const d=Math.min(...[trueCount,falseCount,0]);
  trueCount+=Math.abs(d)
  falseCount+=Math.abs(d)
  return (
    <div className='bg-green-200 shadow my-1 p-2 rounded-xl w-full text-black'>
      {/* <p className='text-xl'>{`問${num}`}</p> */}
      <p>{`「正しい」:${trueCount}/「誤り」:${falseCount}`}</p>
      {
        trueCount +falseCount !== 0
          ? <p>{`${Math.round(100 * trueCount / (trueCount + falseCount))}%/${Math.round(100 * falseCount / (trueCount + falseCount))}%`}</p>
          : <></>}
    </div>
  )
}
