import React from "react"
import Layout from "../components/layout"
import { Link } from "gatsby"
import { v1 as uuid } from "uuid"

// import { Container } from './styles';

const CreateRoom = props => {
  const id = uuid()

  return (
    <Layout>
      <Link to={`/room/${id}`}>Create Room</Link>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <Link to={`/room/`}>Create Room</Link>
    </Layout>
  )
}

export default CreateRoom
