import { memo, useEffect } from 'react'
import Graph from 'graphology'
import {
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
} from '@react-sigma/core'
import { useLayoutForceAtlas2 } from '@react-sigma/layout-forceatlas2'
import '@react-sigma/core/lib/react-sigma.min.css'

const sigmaStyle = { height: '100%', width: '100%' }

const GraphEvents = ({ setSelectedId }) => {
  const registerEvents = useRegisterEvents()

  useEffect(() => {
    registerEvents({
      clickNode: (event) => setSelectedId(Number(event.node)),
    })
  }, [registerEvents, setSelectedId])

  return null
}

const LoadGraph = ({ data }) => {
  const { assign } = useLayoutForceAtlas2({
    iterations: 100,
    settings: {
      linLogMode: true,
    },
  })
  const loadGraph = useLoadGraph()

  useEffect(() => {
    const graph = new Graph()

    data.nodes.forEach((node) => {
      graph.addNode(node.id, {
        x: Math.floor(Math.random() * 10) + 1,
        y: Math.floor(Math.random() * 10) + 1,
        size: 5,
        label: node.label,
        color: node.color,
      })
    })

    data.edges.forEach((edge) => {
      if (
        data.nodes.some((node) => node.id === edge.from) &&
        data.nodes.some((node) => node.id === edge.to)
      ) {
        graph.addEdge(edge.from, edge.to)
      }
    })

    loadGraph(graph)
    assign()
  }, [loadGraph, assign, data])

  return null
}

const NetworkSigma = ({ data, setSelectedId }) => {
  return (
    <>
      <SigmaContainer
        style={sigmaStyle}
        settings={{ allowInvalidContainer: true }}
      >
        <LoadGraph data={data} />
        <GraphEvents setSelectedId={setSelectedId} />
      </SigmaContainer>
    </>
  )
}

export default memo(NetworkSigma)
