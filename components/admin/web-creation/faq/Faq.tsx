import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from '@chakra-ui/react'

const Faq = () => {
  return (
    <Accordion allowMultiple>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              🌱 What is a Resilience Web?
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          A Resilience Web is a digital mapping of environmental and social
          justice groups in a place, curated by people who live there. These
          webs are intended to help the discovery, collaboration and networking
          between activists and groups around issues that they care about
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              💵 How much does it cost to use the platform?
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          It's completely free! However we rely on grants, the hard work of
          volunteers and donations from people like you. If you can support the
          project with as little as £3/month we would be hugely grateful. Go to{' '}
          <a href="https://opencollective.com/resilience-web">
            our Open Collective
          </a>{' '}
          to donate.
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              ❓ I have some questions
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          Get in touch with us anytime via the button at the top right of the
          page. We are happy to set up a call to take you through what the
          platform can offer and listen to your feedback if you have any. You
          might also find the answer to your questions in{' '}
          <a href="https://resilienceweb.gitbook.io/knowledgebase">
            our Knowledgebase
          </a>
          .
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default Faq
