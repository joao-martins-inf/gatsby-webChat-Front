import React from "react"

export default function WebChatBtn(props) {
  return (
    <button onClick={props.handleClick}>
      <div class="rounded-full bg-gray-200 p-2">
        <svg class="w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d={props.imgPath} />
        </svg>
      </div>
    </button>
  )
}
