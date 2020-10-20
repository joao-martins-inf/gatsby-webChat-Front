import Peer from "peerjs"
import React, { useRef, useEffect, useState } from "react"
import io from "socket.io-client"
import Layout from "../components/layout"

import Video from "../components/video"
import WebChatBtn from "../components/webChatBtn"
import Chat from "../components/chat"

const RoomID = 10

// all Peerjs configs
const config = {
  iceServers: [
    { url: "stun:stun1.l.google.com:19302" },
    {
      url: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com",
    },
  ],
}

//setup PeerJs connection
const localConfig = {
  host: "/",
  port: "1235",
  /* host: "expertnetworkpeer.builduplabs.com", */
  path: "/",
  /* secure: true,
  key: "wyzr", */
  debug: 3,
  config,
}

const Room = props => {
  const userVideo = useRef()
  const partnerVideo = useRef()
  const peerRef = useRef()
  const socketRef = useRef()
  const otherUser = useRef()
  const myUserId = useRef()
  const userStream = useRef()
  const peersRef = useRef({})
  //const muteBtn = useRef()

  const [chatVisibility, setChatVisibility] = useState(true)
  const [msgs, setMsgs] = useState([])

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(stream => {
        userVideo.current.srcObject = stream
        userStream.current = stream

        //connect to socket host
        socketRef.current = io.connect("http://localhost:1234/")

        //set up peerJS
        peerRef.current = createPeer()

        //user joined the room
        peerRef.current.on("open", id => {
          socketRef.current.emit("join", RoomID, id)
          myUserId.current = id
        })

        //A user connected to the room
        socketRef.current.on("connected", userId => {
          connectToNewUser(userId, stream)
        })

        //Respond to calls, when user one calls anwser that call(sending our stream) and listens to is stream
        peerRef.current.on("call", call => {
          socketRef.current.emit("response")
          call.answer(stream)

          call.on("stream", otherUserVideoStream => {
            partnerVideo.current.srcObject = otherUserVideoStream
          })
        })

        socketRef.current.on("roomOwner", userId => {
          otherUser.current = userId
        })

        //when user disconnects, close connection
        socketRef.current.on("disconnected", userId => {
          if (peersRef.current[userId]) {
            peersRef.current[userId].close()
            //and redirect to the rating page
          }
        })

        //handle the other user cam changes
        socketRef.current.on("camChanged", () => {
          console.log("other user cam changede")
        })

        //receives chat msgs
        socketRef.current.on("message", data => {
          //appendMsg(`${data.userId}: ${data.message}`)
          setMsgs(prev => prev.concat(data.userId + ": " + data.message))
        })
      })
  }, [])

  //setUp peer
  function createPeer(/* userID */) {
    const peer = new Peer(undefined, localConfig)
    return peer
  }

  // when a user 2 joins, makes a call and listens to response from taht user
  function connectToNewUser(userId, stream) {
    otherUser.current = userId
    socketRef.current.emit("response")
    const call = peerRef.current.call(userId, stream)
    call.on("stream", partnerStream => {
      partnerVideo.current.srcObject = partnerStream
    })

    call.on("close", () => {
      partnerVideo.current.srcObject = null
    })

    peersRef.current[userId] = call
  }

  function handleMuteBtnclick() {
    userStream.current.getAudioTracks()[0].enabled = !userStream.current.getAudioTracks()[0]
      .enabled
  }

  function handleCamBtnClick() {
    userStream.current.getVideoTracks()[0].enabled = !userStream.current.getVideoTracks()[0]
      .enabled

    socketRef.current.emit("cam")
  }

  function handleShareScrenBtnClick() {
    navigator.mediaDevices
      .getDisplayMedia({
        cursor: true,
      })
      .then(stream => {
        //make a call to add  the screen
        peerRef.current.call(otherUser.current, stream)
        const screenTrack = stream.getTracks()[0]

        screenTrack.onended = function () {
          peerRef.current.call(otherUser.current, userStream.current)
        }
      })
  }

  function handleMsgBtnClick() {
    /* const chat = document.getElementById("chat")
    if (chat.classList.contains("hidden")) {
      chat.classList.remove("hidden")
      chat.classList.add("md:block")
    } else {
      chat.classList.add("hidden")
      chat.classList.remove("md:block")
    } */
    setChatVisibility(prev => !prev)
  }

  function handleEndCallBtnclick() {
    /*redirect to the rating page */
  }

  function handleSubmit(event) {
    const msgInput = document.getElementById("msg-input")
    event.preventDefault()
    const message = msgInput.value
    //appendMsg(`You: ${message}`)
    setMsgs(prev => prev.concat("You :" + message))
    //setMsgs(prev => prev.push("You :" + message))
    socketRef.current.emit("chat", message)
    msgInput.value = ""
  }
  /* 
  function appendMsg(message) {
    const msgContainer = document.getElementById("msg-container")
    const msgElem = document.createElement("div")
    msgElem.innerText = message
    msgContainer.append(msgElem)
  } */

  return (
    <div className="flex">
      <div id="video-container" className="relative h-screen bg-red-100 w-full">
        <Video vRef={partnerVideo} otherUser />
        <Video vRef={userVideo} />

        <div className="absolute bottom-0 object-bottom m-auto text-center left-0 right-0">
          <div className="space-x-8 m-auto mb-3">
            <WebChatBtn
              handleClick={handleMuteBtnclick}
              imgPath="M9 18v-1.06A8 8 0 0 1 2 9h2a6 6 0 1 0 12 0h2a8 8 0 0 1-7 7.94V18h3v2H6v-2h3zM6 4a4 4 0 1 1 8 0v5a4 4 0 1 1-8 0V4z"
            />
            <WebChatBtn
              handleClick={handleCamBtnClick}
              imgPath="M16 7l4-4v14l-4-4v3a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v3zm-8 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
            />
            <WebChatBtn
              handleClick={handleShareScrenBtnClick}
              imgPath="M7 17H2a2 2 0 0 1-2-2V2C0 .9.9 0 2 0h16a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-5l4 2v1H3v-1l4-2zM2 2v11h16V2H2z"
            />
            <WebChatBtn
              handleClick={handleMsgBtnClick}
              imgPath="M10 15l-4 4v-4H2a2 2 0 0 1-2-2V3c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8zM5 7v2h2V7H5zm4 0v2h2V7H9zm4 0v2h2V7h-2z"
            />
            <WebChatBtn
              handleClick={handleEndCallBtnclick}
              imgPath="M20 18.35V19a1 1 0 0 1-1 1h-2A17 17 0 0 1 0 3V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4c0 .56-.31 1.31-.7 1.7L3.16 8.84c1.52 3.6 4.4 6.48 8 8l2.12-2.12c.4-.4 1.15-.71 1.7-.71H19a1 1 0 0 1 .99 1v3.35z"
            />
          </div>
        </div>
      </div>
      <Chat
        hide={chatVisibility}
        closeClick={handleMsgBtnClick}
        msgs={msgs}
        submitClick={handleSubmit}
      />
    </div>
  )
}

export default Room
