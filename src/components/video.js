import React from "react"

export default function Video(props) {
  return (
    <video
      className={
        props.otherUser
          ? "z-0 h-full w-full flex-1 object-cover rounded"
          : "z-10 w-40 absolute top-0 right-0 rounded mr-2 mt-2"
      }
      autoPlay
      ref={props.vRef}
      muted={!props.otherUser}
    ></video>
  )
}
