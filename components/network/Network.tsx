import Head from 'next/head'
import { memo, useCallback, useEffect, useMemo } from 'react'
import VisNetworkReactComponent from 'vis-network-react'
import { useDisclosure } from '@chakra-ui/react'
import Dialog from '@components/main-list/dialog'
import styles from './Network.module.scss'

const options = {
  autoResize: true,
  nodes: {
    scaling: {
      min: 16,
      max: 32,
    },
    shape: 'hexagon',
    shadow: true,
    font: {
      multi: true,
    },
    widthConstraint: {
      maximum: 120,
    },
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
      damping: 1.3,
      gravitationalConstant: -130,
    },
    minVelocity: 0.85,
    solver: 'forceAtlas2Based',
    stabilization: false,
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
  },
  height: '100%',
}

const Network = ({ data, selectedId, setSelectedId, setNetwork }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (selectedId) {
      onOpen()
    }
  }, [onOpen, selectedId])

  const events = useMemo(
    () => ({
      select: function (event) {
        const { nodes } = event
        setSelectedId(nodes[0])
      },
      showPopup: function (_event) {
        console.log('show popup?')
      },
    }),
    [setSelectedId],
  )

  const selectedItem = useMemo(
    () => data.nodes.find((node) => node.id === selectedId),
    [data.nodes, selectedId],
  )

  const onCloseDialog = useCallback(() => {
    setSelectedId(null)
    onClose()
  }, [onClose, setSelectedId])

  const getNetwork = useCallback((network) => setNetwork(network), [setNetwork])

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
          getNetwork={getNetwork}
          data={data}
          options={options}
        />
        {Boolean(selectedId) && !selectedItem?.isDescriptive && (
          <Dialog isOpen={isOpen} item={selectedItem} onClose={onCloseDialog} />
        )}
      </div>
    </>
  )
}

export default memo(Network)
