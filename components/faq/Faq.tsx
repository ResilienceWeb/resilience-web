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
    <Accordion type="multiple" className="flex flex-col gap-3">
      {content.map((item) => (
        <AccordionItem
          key={item.question}
          value={item.question}
          className="rounded-lg border bg-white px-5 shadow-xs transition-colors last:border-b hover:border-gray-300 data-[state=open]:border-primary/40"
        >
          <AccordionTrigger className="rounded-md py-4 text-base font-semibold hover:no-underline focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none data-[state=open]:text-primary [&[data-state=open]>svg]:text-primary">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="max-w-prose pb-5 text-[15px] leading-relaxed text-gray-600">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default Faq
