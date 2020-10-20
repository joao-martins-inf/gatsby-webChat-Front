import React from "react"

export default function Chat(props) {
  console.log(props.msgs)
  return (
    <div
      className={
        props.hide
          ? "bg-white w-full h-full absolute z-20 hidden md:static md:w-auto"
          : "bg-white w-full h-full absolute z-20 md:static md:w-auto md:block"
      }
    >
      <button onClick={props.closeClick}>
        <svg
          class="w-4 m-3"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
        </svg>
      </button>
      <div className="m-4 flex-row top-0 bottom-0 h-full">
        <ul id="msg-container" className="flex-col space-y-2">
          {/* {Array.from(Array(props.msgs)).map((msg, index) => {
            return <li key={index}>{msg}</li>
          })} */}
          {props.msgs.map((msg, index) => {
            return <li key={index}>{msg}</li>
          })}
        </ul>

        <form onSubmit={props.submitClick} className="flex bottom-0">
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
  )
}
