import Head from 'next/head'
import { memo, useState, useCallback, useEffect, useMemo } from 'react'
import VisNetworkReactComponent from 'vis-network-react'
import ListingDialog from '@components/main-list/listing-dialog'
import { Spinner } from '@components/ui/spinner'
import styles from './Network.module.css'

const options = {
  autoResize: true,
  nodes: {
    scaling: {
      min: 8,
      max: 32,
    },
    shape: 'hexagon',
    shadow: true,
    font: {
      size: 18,
    },
    widthConstraint: {
      maximum: 130,
    },
    labelHighlightBold: false,
  },
  edges: {
    color: '#000000',
    shadow: false,
    smooth: false,
    arrows: {
      to: {
        enabled: false,
      },
    },
  },
  groups: {
    category: {
      shape: 'box',
      shapeProperties: {
        borderRadius: 3,
      },
      size: 32,
      font: {
        size: 26,
      },
      margin: 10,
      borderWidthSelected: 2,
      widthConstraint: {
        maximum: 160,
      },
    },
  },
  physics: {
    forceAtlas2Based: {
      springLength: 100,
      damping: 1,
      gravitationalConstant: -130,
    },
    minVelocity: 0.85,
    solver: 'forceAtlas2Based',
    stabilization: {
      enabled: true,
      iterations: 500, // More iterations for better initial positioning
      updateInterval: 1,
    },
  },
  interaction: {
    zoomView: true,
    hover: true,
    dragView: true,
    navigationButtons: true,
    dragNodes: true,
    keyboard: {
      enabled: true,
      bindToWindow: true,
    },
    tooltipDelay: 100,
  },
  height: '100%',
}

const Network = ({ data, selectedId, setSelectedId }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [network, setNetwork] = useState<any>()
  const [isLoading, setIsLoading] = useState(true)

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)

  useEffect(() => {
    if (selectedId) {
      onOpen()
    }
  }, [selectedId])

  const events = useMemo(
    () => ({
      select: function (event) {
        const { nodes } = event
        setSelectedId(nodes[0])
      },
      click: function (event) {
        const { nodes } = event
        if (nodes[0]) {
          setSelectedId(nodes[0])
        }
      },
      hoverNode: function () {
        if (network) {
          network.canvas.body.container.style.cursor = 'pointer'
        }
      },
      blurNode: function () {
        if (network) {
          network.canvas.body.container.style.cursor = 'default'
        }
      },
      stabilizationIterationsDone: function () {
        setIsLoading(false)
        // Force redraw once stabilization is done to help with icon rendering
        setTimeout(() => {
          if (network) {
            network.redraw()
          }
        }, 100)
      },
    }),
    [network, setSelectedId],
  )

  const selectedItem = useMemo(
    () => data.nodes.find((node) => node.id === selectedId),
    [data.nodes, selectedId],
  )

  const onCloseDialog = useCallback(() => {
    setSelectedId(null)
    onClose()
  }, [setSelectedId])

  const getNetwork = useCallback(
    (network) => {
      setNetwork(network)
      // Reset loading state when network is reinitialized
      setIsLoading(true)
    },
    [setNetwork],
  )

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <div className={styles.graph}>
        <VisNetworkReactComponent
          events={events}
          data={data}
          options={options}
          getNetwork={getNetwork}
        />
        {isLoading && <Spinner />}
        {Boolean(selectedId) &&
          selectedItem?.group !== 'category' &&
          selectedItem?.group !== 'central-node' && (
            <ListingDialog
              isOpen={isOpen}
              item={selectedItem}
              onClose={onCloseDialog}
            />
          )}
      </div>
    </>
  )
}

export default memo(Network)
