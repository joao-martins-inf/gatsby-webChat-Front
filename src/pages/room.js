import Peer from "peerjs"
import React, { useRef, useEffect } from "react"
import io from "socket.io-client"
import Layout from "../components/layout"

import Video from "../components/video"

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
  debug: 3,
  config,
}

const Room = props => {
  const userVideo = useRef()
  const partnerVideo = useRef()
  const peerRef = useRef()
  const socketRef = useRef()
  const otherUser = useRef()
  const userStream = useRef()
  const peersRef = useRef({})
  //const muteBtn = useRef()

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
          socketRef.current.emit("join room", 10, id)
        })

        //A user connected to the room
        socketRef.current.on("user connected", userId => {
          connectToNewUser(userId, stream)
        })

        //Respond to calls, when user one calls anwser that call(sending our stream) and listens to is stream
        peerRef.current.on("call", call => {
          call.answer(stream)

          call.on("stream", otherUserVideoStream => {
            partnerVideo.current.srcObject = otherUserVideoStream
          })
        })

        //when user disconnects, close connection
        socketRef.current.on("user disconnected", userId => {
          if (peersRef.current[userId]) {
            peersRef.current[userId].close()
          }
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
  }

  function handleShareScrenBtnClick() {
    navigator.mediaDevices
      .getDisplayMedia({
        cursor: true,
      })
      .then(stream => {
        const screenTrack = stream.getTracks()[0]
        const track = userStream.current.getVideoTracks()[0]
        userStream.current.addTrack(screenTrack)
        userStream.current.removeTrack(track)
        userStream.current.getTracks().forEach(element => {
          console.log(element)
        })
        screenTrack.onended = function () {
          userStream.current.removeTrack(screenTrack)
          userStream.current.addTrack(track)
          userStream.current.getTracks().forEach(element => {
            console.log(element)
          })
        }
      })
  }

  function handleMsgBtnClick() {}

  function handleEndCallBtnclick() {}

  return (
    <>
      <div className="relative h-screen bg-black">
        <video
          className="z-0 h-full w-full flex-1 object-cover"
          autoPlay
          ref={partnerVideo}
        />
        <video
          className="z-10 w-40 absolute top-0 right-0"
          autoPlay
          ref={userVideo}
        />

        <div className="space-x-8 absolute bottom-0 p-4 object-bottom m-auto text-center left-0 right-0">
          <button onClick={handleMuteBtnclick}>
            <div class="rounded-full bg-gray-200 p-2">
              <svg
                class="w-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9 18v-1.06A8 8 0 0 1 2 9h2a6 6 0 1 0 12 0h2a8 8 0 0 1-7 7.94V18h3v2H6v-2h3zM6 4a4 4 0 1 1 8 0v5a4 4 0 1 1-8 0V4z" />
              </svg>
            </div>
          </button>
          <button onClick={handleCamBtnClick}>
            <div class="rounded-full bg-gray-200 p-2">
              <svg
                class="w-8"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M16 7l4-4v14l-4-4v3a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v3zm-8 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
              </svg>
            </div>
          </button>
          <button onClick={handleShareScrenBtnClick}>
            <div class="rounded-full bg-gray-200 p-2">
              <svg
                class="w-8"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M7 17H2a2 2 0 0 1-2-2V2C0 .9.9 0 2 0h16a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-5l4 2v1H3v-1l4-2zM2 2v11h16V2H2z" />
              </svg>
            </div>
          </button>
          <button>
            <div class="rounded-full bg-gray-200 p-2">
              <svg
                class="w-8"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-4 4v-4H2a2 2 0 0 1-2-2V3c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8zM5 7v2h2V7H5zm4 0v2h2V7H9zm4 0v2h2V7h-2z" />
              </svg>
            </div>
          </button>
          <button>
            <div class="rounded-full bg-gray-200 p-2">
              <svg
                class="w-8"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M20 18.35V19a1 1 0 0 1-1 1h-2A17 17 0 0 1 0 3V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4c0 .56-.31 1.31-.7 1.7L3.16 8.84c1.52 3.6 4.4 6.48 8 8l2.12-2.12c.4-.4 1.15-.71 1.7-.71H19a1 1 0 0 1 .99 1v3.35z" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}

export default Room
