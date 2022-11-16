import * as React from "react"
import { library } from "@fortawesome/fontawesome-svg-core"
import {
  faAngleRight,
  faClipboard,
  faClipboardCheck,
  faR,
  faSquareCheck,
} from "@fortawesome/free-solid-svg-icons"
import { faSquare } from "@fortawesome/free-regular-svg-icons"
import {
  faCreativeCommons,
  faCreativeCommonsBy,
} from "@fortawesome/free-brands-svg-icons"
import Navigation from "./navigation"
import HeroBar from "./hero-bar"
import Footer from "./footer"

library.add(
  faAngleRight,
  faClipboard,
  faClipboardCheck,
  faSquare,
  faSquareCheck,
  faCreativeCommons,
  faCreativeCommonsBy,
  faR
)

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  if (isRootPath) {
    header = (
      <div>
        <Navigation />
        <HeroBar title={title} />
      </div>
    )
  } else {
    header = (
      <div>
        <Navigation />
      </div>
    )
  }

  return (
    <div
      className="global-wrapper"
      data-is-root-path={isRootPath}
      style={{ width: "1920px" }}
    >
      <header className="global-header">{header}</header>
      {children}
      <Footer />
    </div>
  )
}

export default Layout
