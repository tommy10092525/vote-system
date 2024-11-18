import React from 'react'

type Props={num:number,trueCount:number,falseCount:number}

export default function ResultShow(props:Props) {
  let {num,trueCount,falseCount}=props;
  const d=Math.min(...[trueCount,falseCount,0]);
  trueCount+=Math.abs(d)
  falseCount+=Math.abs(d)
  return (
    <div className='bg-green-200 shadow my-1 p-2 rounded-xl w-44 text-black'>
      <p className='text-xl'>{`問${num}`}</p>
      <p>{`「正しい」:${trueCount}/「誤り」:${falseCount}`}</p>
      {
        trueCount +falseCount !== 0
          ? <p>{`${Math.round(100 * trueCount / (trueCount + falseCount))}%/${Math.round(100 * falseCount / (trueCount + falseCount))}%`}</p>
          : <></>}
    </div>
  )
}
