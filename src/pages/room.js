import Peer from "peerjs"
import React, { useRef, useEffect } from "react"
import io from "socket.io-client"
import Layout from "../components/layout"

import Video from "../components/video"

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

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(stream => {
        userVideo.current.srcObject = stream
        userStream.current = stream

        //connect to socket host
        socketRef.current = io.connect("http://localhost:1234/")
        /* socketRef.current = io.connect("http://localhost:1234/")
         */
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
        //listens to sharing
        /* socketRef.current.on("screen", userId => {
            
        }) */

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
          appendMsg(`${data.userId}: ${data.message}`)
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
    const chat = document.getElementById("chat")
    if (chat.classList.contains("hidden")) {
      chat.classList.remove("hidden")
      chat.classList.add("md:block")
    } else {
      chat.classList.add("hidden")
      chat.classList.remove("md:block")
    }
  }

  function handleEndCallBtnclick() {
    /*redirect to the rating page */
  }

  function handleSubmit(event) {
    const msgInput = document.getElementById("msg-input")
    event.preventDefault()
    const message = msgInput.value
    appendMsg(`You: ${message}`)
    socketRef.current.emit("chat", message)
    msgInput.value = ""
  }

  function appendMsg(message) {
    const msgContainer = document.getElementById("msg-container")
    const msgElem = document.createElement("div")
    msgElem.innerText = message
    msgContainer.append(msgElem)
  }

  return (
    <div className="flex">
      <div id="video-container" className="relative h-screen bg-red-100 w-full">
        <video
          className="z-0 h-full w-full flex-1 object-cover rounded bg-red-500"
          autoPlay
          ref={partnerVideo}
        />
        <video
          className="z-10 w-40 absolute top-0 right-0 rounded mr-2 mt-2 bg-orange-400"
          autoPlay
          muted
          ref={userVideo}
        />

        <div className="absolute bottom-0 object-bottom m-auto text-center left-0 right-0">
          <div className="space-x-8 m-auto mb-3">
            <button onClick={handleMuteBtnclick}>
              <div class="rounded-full bg-white p-2 tranform hover:scale-125 transition ease-in-out duration-500">
                <svg
                  class="w-8"
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
            <button onClick={handleMsgBtnClick}>
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
      </div>
      <div
        className="bg-white w-full h-full absolute z-20 hidden md:static md:w-auto"
        id="chat"
      >
        <button onClick={handleMsgBtnClick}>
          <svg
            class="w-4 m-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
          </svg>
        </button>
        <div className="m-4 flex-row top-0 bottom-0 h-full">
          <div id="msg-container"></div>

          <form onSubmit={handleSubmit} className="flex bottom-0">
            <input
              id="msg-input"
              type="text"
              className="w-full px-4 py-2 leading-tight bg-gray-500 opacity-50 m-2"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-2"
            >
              Send
            </button>
          </form>
        </div>
      </div>
      {/* <div
        className="bg-white md:right-0 md:w-64 md:left-auto md:static md:h-full md:top-0 h-full w-full hidden left-0 top-0"
        id="chat"
      >
        oi
      </div> */}
    </div>
  )
}

export default Room
