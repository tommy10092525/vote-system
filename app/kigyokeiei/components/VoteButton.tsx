import React, { useEffect, useState } from 'react'
import { MyVote, } from '../page';

type Props = { num: number, votes: MyVote[], handleVotes: (vote: MyVote) => void }
const url = "kigyokeiei/api/post"

const VoteButton = (props: Props) => {
  const { num, votes, handleVotes } = props;
  const [isVoted, setIsVoted] = useState<boolean>(false);
  const [myAnswer, setMyAnswer] = useState<boolean>(false);

  useEffect(function () {
    let f = false;
    for (const item of votes) {
      if (item.num === num) {
        setIsVoted(true);
        setMyAnswer(item.answer);
        f = true;
        break;
      }
    }
  }, [votes])


  return (

    <div className={`my-2 pl-2 ${isVoted ? "border-red-500" : "border-blue-500"} border-l-4`}>
      <p>問{String(num)}</p>
      <button
        className={`bg-blue-500 shadow m-1 p-1 rounded-md text-black ${(isVoted && myAnswer) ? "border-2 border-black" : ""}`}
        onClick={function () {
          if (!isVoted || !myAnswer) {
            if(isVoted){
              fetch(url, {
                method: "POST",
                body: JSON.stringify({
                  num: num,
                  answer: false,
                  change:-1
                }), headers: {
                  'Content-type': 'application/json; charset=UTF-8'
                }
              })
            }
            fetch(url, {
              method: "POST",
              body: JSON.stringify({
                num: num,
                answer: true,
                change:1
              }), headers: {
                'Content-type': 'application/json; charset=UTF-8'
              }
            }).then(function () {
              handleVotes({ num: num, answer: true,})
            })

          }
        }}>{isVoted && myAnswer ? "「正しい」に投票済み" : "「正しい」に投票する"}</button>
      <button
        className={`bg-orange-400 shadow m-1 p-1 rounded-md text-black ${isVoted && !myAnswer ? "border-2 border-black":""}`}
        onClick={() => {
          if (!isVoted || myAnswer) {
            if(isVoted){
              fetch(url, {
                method: "POST",
                body: JSON.stringify({
                  num: num,
                  answer: false,
                  change:-1
                }), headers: {
                  'Content-type': 'application/json; charset=UTF-8'
                }
              })
            }
            fetch(url, {
              method: "POST",
              body: JSON.stringify({
                num: num,
                answer: true,
                change:1
              }), headers: {
                'Content-type': 'application/json; charset=UTF-8'
              }
            }).then(function () {
              handleVotes({ num: num, answer: false ,});
            })
          }
        }}>{isVoted && !myAnswer ? "「誤り」に投票済み" : "「誤り」に投票する"}</button>

    </div>
  )
}

export default VoteButton
