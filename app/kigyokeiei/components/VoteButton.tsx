import React, { useEffect, useState } from 'react'
import {Vote,PublicVote,ResponseType} from '../page';
import useSWR from 'swr';

type Props = {
  num: number,
  myAnswers:Vote[],
  publicAnswers:PublicVote[],
  handleMyAnswerChange:(num:number,answer:"correct"|"incorrect",change:number)=>Promise<void>
}


const VoteButton = (props: Props) => {
  const myAnswer = props.myAnswers.find((item)=>item.num===props.num)?.answer;
  const [isPosting, setIsPosting] = useState(false);

  return (
    <div className={`w-full my-2 pl-2 ${myAnswer==="none" ? "" : "border-blue-500 border-l-4"}`}>
      <p className='text-2xl'>{`問${String(props.num)}${isPosting ? " 送信中..." : ""}`}</p>
      <div className='w-full p-1'>
        <button
          className={`w-full shadow p-1 rounded-md text-black ${myAnswer==="correct" ? "bg-blue-700" : "bg-blue-200"}`}
          onClick={async () => {
            console.log("correct")
            if (!isPosting && (myAnswer === "none" || myAnswer === "incorrect")) {
              setIsPosting(true);
              if (myAnswer === "incorrect") {
                // 前回の投票を相殺
                await props.handleMyAnswerChange(props.num, "incorrect", -1);
              }
              // 新しい投票を送信
              await props.handleMyAnswerChange(props.num, "correct", 1);
              setIsPosting(false);
            }
          }}
        >
          {myAnswer === "correct" ? "「正しい」に投票済み" : "「正しい」に投票する"}
        </button>
      </div>
      <div className='w-full p-1'>
        <button
          className={`w-full shadow p-1 rounded-md text-black ${myAnswer==="incorrect" ? "bg-pink-700" : "bg-pink-200"}`}
          onClick={async () => {
            console.log("incorrect")
            if (!isPosting && (myAnswer === "none" || myAnswer === "correct")) {
              setIsPosting(true);
              if (myAnswer === "correct") {
                // 前回の投票を相殺
                await props.handleMyAnswerChange(props.num, "correct", -1);
              }
              // 新しい投票を送信
              await props.handleMyAnswerChange(props.num, "incorrect", 1);
              setIsPosting(false);
            }
          }}
        >
          {myAnswer === "incorrect" ? "「誤り」に投票済み" : "「誤り」に投票する"}
        </button>
      </div>
    </div>
  );
};

export default VoteButton
