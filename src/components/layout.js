import React from "react"
import { Link } from "gatsby"

const ListLink = props => (
  <li
    style={{
      display: `inline-block`,
      marginRight: `1rem`,
    }}
  >
    <Link to={props.to}>{props.children}</Link>
  </li>
)

export default function Layout({ children }) {
  return (
    <div
      style={{
        margin: `3rem auto`,
        padding: `0 1rem`,
      }}
    >
      <header style={{ marginBottom: `1.5rem` }}>
        <Link to="/" style={{ textShadow: `none` }}>
          <h3 style={{ display: `inline` }}>MySweetSite</h3>
        </Link>
        <ul style={{ listStyle: `none`, float: `right` }}>
          <ListLink to="/">Home</ListLink>
          <ListLink to="/createRoom/">Rooms</ListLink>
        </ul>
      </header>
      {children}
    </div>
  )
}
