import React, { useState, useRef } from "react"
import { Icon, IconFillColors } from "../../icons/Icon"
import "./ContentAccordion.scss"

interface ContentAccordionProps {
  customBarContent?: React.ReactNode
  customExpandedContent?: React.ReactNode
  disableAccordion?: boolean
  accordionTheme?: AccordionTheme
  barClass?: string
}

export type AccordionTheme = "blue" | "gray"

/**
 * An accordion that consists of header bar content and expandable content
 * Two existing themes under our design system are available
 */
const ContentAccordion = (props: ContentAccordionProps) => {
  const [accordionOpen, setAccordionOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleTable = () => {
    if (!props.disableAccordion) {
      setAccordionOpen(!accordionOpen)
      buttonRef?.current?.focus()
    }
  }

  return (
    <div className={`mb-4`}>
      <button
        onClick={toggleTable}
        className={`w-full text-left ${props.disableAccordion && "cursor-default"}`}
        ref={buttonRef}
        aria-expanded={accordionOpen}
        data-test-id={"content-accordion-button"}
      >
        <div
          className={`flex justify-between ${props.barClass} ${
            props.accordionTheme === "blue" && "accordion-blue-theme__bar"
          } ${props.accordionTheme === "gray" && "accordion-gray-theme__bar"} ${
            accordionOpen && "accordion-open"
          }`}
        >
          {props.customBarContent}
          {!props.disableAccordion && (
            <>
              {accordionOpen ? (
                <Icon
                  symbol={"closeSmall"}
                  size={"base"}
                  fill={IconFillColors.primary}
                  className={"pt-1 flex items-center"}
                  dataTestId={"accordion-close"}
                  key={"accordion-close"}
                />
              ) : (
                <Icon
                  symbol={"arrowDown"}
                  size={"base"}
                  fill={IconFillColors.primary}
                  className={"flex items-center"}
                  dataTestId={"accordion-open"}
                  key={"accordion-open"}
                />
              )}
            </>
          )}
        </div>
      </button>
      {accordionOpen && <div>{props.customExpandedContent}</div>}
    </div>
  )
}

export { ContentAccordion as default, ContentAccordion }
