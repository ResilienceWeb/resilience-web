'use client'

import * as React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion'

interface FaqProps {
  content: { question: string; answer: string | React.ReactNode }[]
}

const Faq = ({ content }: FaqProps) => {
  return (
    <Accordion type="multiple">
      {content.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger className="text-left">
            {item.question}
          </AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default Faq
