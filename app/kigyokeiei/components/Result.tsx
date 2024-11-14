import React from 'react'

type Props={num:number,trueCount:number,falseCount:number}

export default function ResultShow(props:Props) {
  const {num,trueCount,falseCount}=props;
  return (
    <div>
      <p>{`問${num}`}</p>
      <p>{`「正しい」:${trueCount}/「誤り」:${falseCount}`}</p>
      {
        trueCount !== 0 && falseCount !== 0
          ? <p>{`${Math.round(100 * trueCount / (trueCount + falseCount))}%/${Math.round(100 * falseCount / (trueCount + falseCount))}%`}</p>
          : <></>}
    </div>
  )
}
