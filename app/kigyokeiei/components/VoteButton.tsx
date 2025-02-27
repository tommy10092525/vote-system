import React, { useEffect, useState } from 'react'
import {Vote,PublicVote,ResponseType} from '../page';
import useSWR from 'swr';
import {Button} from '@/components/ui/button';
import { start, end } from '../constants/constants';
import { toast } from 'sonner';

type Props = {
  num: number,
  myAnswers:Vote[],
  publicAnswers:PublicVote[],
  handleMyAnswerChange:(num:number,answer:"correct"|"incorrect"|"none",change:number)=>Promise<void>
}


const VoteButton = (props: Props) => {
  const myAnswer = props.myAnswers.find((item)=>item.num===props.num)?.answer;
  const [isPosting, setIsPosting] = useState(false);
  const now=new Date()
  return (
    <div className={`w-full my-2 pl-2 ${myAnswer==="none" ? "" : "border-blue-500 border-l-4"}`}>
      <p className='text-2xl'>{`問${String(props.num)}${isPosting ? " 送信中..." : ""}`}</p>
      <div className='p-1 w-full'>
        <Button
          className={`w-full shadow p-1 rounded-md text-black ${myAnswer==="correct" ? "bg-green-500" : "bg-green-200"} hover:bg-green-600`}
          onClick={() => {
            (async()=>{
              if (!isPosting && (myAnswer === "none" || myAnswer === "incorrect")) {
                setIsPosting(true);
                if (myAnswer === "incorrect") {
                  // 前回の投票を相殺
                  await props.handleMyAnswerChange(props.num, "incorrect", -1);
                }
                // 新しい投票を送信
                await props.handleMyAnswerChange(props.num, "correct", 1);
                setIsPosting(false);
                return toast(`問${props.num}に「正しい」に投票しました`);
              }
            })()
          }}
        >
          {myAnswer === "correct" ? "「正しい」に投票済み" : "「正しい」に投票する"}
        </Button>
      </div>
      <div className='p-1 w-full'>
        <Button
          className={`w-full shadow p-1 rounded-md text-black ${myAnswer==="incorrect" ? "bg-red-400" : "bg-red-200"} hover:bg-red-600`}
          onClick={() => {
            (async()=>{
              if (!isPosting && (myAnswer === "none" || myAnswer === "correct")) {
                setIsPosting(true);
                if (myAnswer === "correct") {
                  // 前回の投票を相殺
                  await props.handleMyAnswerChange(props.num, "correct", -1);
                }
                // 新しい投票を送信
                await props.handleMyAnswerChange(props.num, "incorrect", 1);
                setIsPosting(false);
                return toast(`問${props.num}に「誤り」に投票しました`);
              }
            })()
          }}
        >
          {myAnswer === "incorrect" ? "「誤り」に投票済み" : "「誤り」に投票する"}
        </Button>
        {myAnswer!=="none" ?
          <Button className='bg-gray-400 mt-5 p-1 rounded-full w-full text-white' onClick={()=>{
            props.handleMyAnswerChange(props.num, "none", -1);
            return toast(`問${props.num}の投票を削除しました`)
        }}>自分の投票を削除する</Button>
        :<></>
        }
      </div>
    </div>
  );
};

export default VoteButton
