import React, { useEffect, useState } from 'react'
import {MyVote,ResponseType} from '../page';
import useSWR from 'swr';

type Props = { num: number
}
// 各コンポーネントでstateを保持する
const getUrl = "kigyokeiei/api/get"
const postUrl = "kigyokeiei/api/post"

const fetcher = async (url: string) => {
  return fetch(url).then((res) => res.json() as Promise<ResponseType | null>);
}

const VoteButton = (props: Props) => {

  const [isVoted, setIsVoted] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [myAnswer, setMyAnswer] = useState<boolean>(false);
  // const [count,setCount]=useState<{trueCount:number,falseCount:number}>({trueCount:0,falseCount:0})
  const { isLoading: isLoadingGet, data: votesGet } = useSWR(getUrl, fetcher,{refreshInterval:1000})

  useEffect(()=>{
    //マウント時にlocalStorageから投票データを復元する
    const localVotes=JSON.parse(localStorage.getItem("votes")||"[]");
    for(let i=0;i<localVotes.length;i++){
      if(localVotes[i].num===props.num){
        setIsVoted(true);
        setMyAnswer(localVotes[i].answer);
        break;
      }
    }
  },[])

  useEffect(()=>{
    //localStorageに投票データを保存する
    let localVotes:MyVote[]=JSON.parse(localStorage.getItem("votes")||"[]");
    let found=false;
    for(let i=0;i<localVotes.length;i++){
      if(localVotes[i].num===props.num){
        localVotes[i].answer=myAnswer;
        found=true;
        break;
      }
    }
    if(isVoted&&!found){
      localVotes.push({num:props.num,answer:myAnswer});
    }
    localStorage.setItem("votes", JSON.stringify(localVotes));
  },[myAnswer])



  let count={trueCount:0,falseCount:0}
  if(!!votesGet){
    let trueVotes=0;
    for(let i=0;i<votesGet.length;i++){
      if(votesGet[i].num===props.num&&votesGet[i].answer){
        trueVotes=votesGet[i].sum;
        break;
      }
    }
    let falseVotes=0;
    for(let i=0;i<votesGet.length;i++){
      if(votesGet[i].num===props.num&&!votesGet[i].answer){
        falseVotes=votesGet[i].sum;
        break;
      }
    }
    let d=Math.min(...[trueVotes,falseVotes,0]);
    trueVotes+=Math.abs(d)
    falseVotes+=Math.abs(d)
    count={trueCount:trueVotes,falseCount:falseVotes}
  }

  return (

    <div className={`w-full my-2 pl-2 float-left ${!isVoted ? "" : "border-blue-500 border-l-4"}`}>
      {/* <p>{JSON.stringify({isVoted:isVoted,myAnswer:myAnswer,count:count})}</p> */}
      <p>{`問${String(props.num)}${isPosting ? " 送信中..." : ""}`}</p>
      <div className='w-1/2 float-left p-1'>
        <button
          className={`w-full shadow p-1 rounded-md float-left text-black ${(isVoted && myAnswer&&!isPosting) ? "bg-blue-700" : "bg-blue-200"}`}
          onClick={()=>{
            if (!isVoted || !myAnswer) {
              // 投票済みでないか、自分の投票が「誤り」である場合は投票する
              setIsPosting(true);
              if (isVoted) {
                // 投票済みの場合は自分の投票を削除する
                fetch(postUrl, {
                  method: "POST",
                  body: JSON.stringify({
                    num: props.num,
                    answer: false,
                    change: -1
                  }), headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                  }
                }).then(()=>{
                })
              }
              // 投票する
              fetch(postUrl, {
                method: "POST",
                body: JSON.stringify({
                  num: props.num,
                  answer: true,
                  change: 1
                }), headers: {
                  'Content-type': 'application/json; charset=UTF-8'
                }
              }).then(function () {
                setMyAnswer(true)
              }).finally(function () {
                setIsPosting(false)
              })
              setIsVoted(true);
            }
          }}>{isVoted && myAnswer ? "「正しい」に投票済み" : "「正しい」に投票する"}</button>
      </div>
      <div className='w-1/2 float-left p-1'>
        <button
          className={`w-full shadow p-1 rounded-md float-left text-black ${isVoted && !myAnswer &&!isPosting ? "bg-pink-500" : "bg-pink-300"}`}
        onClick={function () {
          if (!isVoted || myAnswer) {
            // 投票済みでないか、自分の投票が「正しい」である場合は投票する
            setIsPosting(true)
            if (isVoted) {
              // 投票済みの場合は自分の投票を削除する
              fetch(postUrl, {
                method: "POST",
                body: JSON.stringify({
                  num: props.num,
                  answer: true,
                  change: -1
                }), headers: {
                  'Content-type': 'application/json; charset=UTF-8'
                }
              }).then(()=>{
              })
            }
            // 投票する
            fetch(postUrl, {
              method: "POST",
              body: JSON.stringify({
                num: props.num,
                answer: false,
                change: 1
              }), headers: {
                'Content-type': 'application/json; charset=UTF-8'
              }
            }).then(function () {
              setMyAnswer(false)
            }).finally(function () {
              setIsPosting(false)
            })
            setIsVoted(true);
          }
        }}>{isVoted && !myAnswer ? "「誤り」に投票済み" : "「誤り」に投票する"}</button>
      </div>
      <div className='w-full p-1'>
        <div className="float-left w-full bg-green-300 shadow my-1 p-2 rounded-md text-black">
          <p>{`「正しい」:${count.trueCount}/「誤り」:${count.falseCount}`}</p>
        {
          count.trueCount + count.falseCount !== 0
            ? <p>{`${Math.round(100 * count.trueCount / (count.trueCount + count.falseCount))}%/${Math.round(100 * count.falseCount / (count.trueCount + count.falseCount))}%`}</p>
            : <></>}
        </div>
      </div>
    </div>
  )
}

export default VoteButton
