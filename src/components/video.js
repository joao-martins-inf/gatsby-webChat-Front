import React from "react"

// import { Container } from './styles';

function Video() {
  return (
    <div className="group p-8 bg-black flex flex-row mx-auto items-center justify-center w-full h-full hover:bg-white">
      <img
        classename="-ml-2 inline-block h-auto w-auto rounded-full text-white shadow-solid"
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt=""
      ></img>
      <div className="group-hover:opacity-0 transition duration-100 ease-in-out absolute bottom-0 left-0 w-full bg-white text-lg">
        <div>TESTETETETETETETET</div>
      </div>
    </div>
  )
}

export default Video
