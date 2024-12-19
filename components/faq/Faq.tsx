import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from '@chakra-ui/react'

const Faq = ({
  content,
}: {
  content: { question: string; answer: string | React.ReactNode }[]
}) => {
  return (
    <Accordion allowMultiple>
      {content.map((item) => (
        <AccordionItem key={item.question}>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                {item.question}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>{item.answer}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default Faq
