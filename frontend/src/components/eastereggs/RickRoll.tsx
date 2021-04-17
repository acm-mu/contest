import React, { useState } from "react"
import { Modal } from "semantic-ui-react"

export const RickRoll = ({ trigger }: { trigger: JSX.Element }): JSX.Element => {
  const [isOpen, setOpen] = useState(false)
  return <Modal
    trigger={trigger}
    open={isOpen}
    size='tiny'
    dimmer='blurring'
    onClose={() => setOpen(false)}
    onOpen={() => setOpen(true)}
    content={
      <iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
    }
  />
}