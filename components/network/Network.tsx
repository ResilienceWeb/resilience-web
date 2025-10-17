import { memo, useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { BsArrowsFullscreen } from 'react-icons/bs'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import VisNetworkReactComponent from 'vis-network-react'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import ListingDialog from '@components/main-list/listing-dialog'
import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'
import styles from './Network.module.css'

const options = {
  autoResize: true,
  layout: {
    improvedLayout: false,
  },
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
      color: '#c3c4c7',
      size: 32,
      font: {
        size: 26,
      },
      margin: 10,
      borderWidthSelected: 2,
      widthConstraint: {
        maximum: 160,
      },
      mass: 1,
    },
    'related-web': {
      shape: 'circularImage',
      shapeProperties: {
        borderRadius: 3,
      },
      color: '#fff',
      image: '/logo-circle.png',
      size: 40,
      font: {
        size: 20,
      },
      margin: 10,
      borderWidthSelected: 2,
      widthConstraint: {
        maximum: 160,
      },
      mass: 1,
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
      iterations: 300, // More iterations for better initial positioning
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
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [network, setNetwork] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const graphRef = useRef<HTMLDivElement>(null)

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
        if (nodes.length === 0) {
          return
        }
        const selectedNodeId = nodes[0]

        if (
          typeof selectedNodeId === 'string' &&
          selectedNodeId.includes('related-web')
        ) {
          const webSlug = selectedNodeId.match(/related-web-(.*)/)?.[1] || ''
          router.push(`${PROTOCOL}://${webSlug}.${REMOTE_HOSTNAME}`)
        } else {
          setSelectedId(selectedNodeId)
        }
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
    [network, router, setSelectedId],
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

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      graphRef.current
        ?.requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
          )
        })
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullScreen(false))
        .catch((err) => {
          console.error(
            `Error attempting to exit full-screen mode: ${err.message} (${err.name})`,
          )
        })
    }
  }, [])

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
    }
  }, [])

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <div className={styles.graph} ref={graphRef}>
        <Button
          variant="outline"
          onClick={toggleFullScreen}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000, // Ensure button is above the graph
          }}
        >
          <BsArrowsFullscreen />
          {isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        </Button>
        <VisNetworkReactComponent
          events={events}
          data={data}
          options={options}
          getNetwork={getNetwork}
        />
        {isLoading && <Spinner />}
        {Boolean(selectedId) &&
          selectedItem?.group !== 'category' &&
          selectedItem?.group !== 'related-web' &&
          selectedItem?.group !== 'central-node' && (
            <ListingDialog
              isOpen={isOpen}
              item={selectedItem}
              onClose={onCloseDialog}
              isFullScreen={isFullScreen}
            />
          )}
      </div>
    </>
  )
}

export default memo(Network)
