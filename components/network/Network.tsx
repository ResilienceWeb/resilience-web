import { memo, useCallback, useEffect, useMemo } from 'react'
import VisNetworkReactComponent from 'vis-network-react'
import { useDisclosure } from '@chakra-ui/react'
import Dialog from '@components/main-list/dialog'
import styles from './Network.module.scss'

const options = {
  nodes: {
    shape: 'box',
    shapeProperties: {
      borderRadius: 3,
    },
    size: 32,
    font: {
      size: 26,
    },
    margin: 10,
    shadow: {
      enabled: true,
    },
    borderWidthSelected: 2,
  },
  edges: {
    color: '#000000',
    arrows: {
      to: {
        enabled: false,
      },
    },
  },
  physics: {
    forceAtlas2Based: {
      gravitationalConstant: -26,
      damping: 0.7,
      centralGravity: 0.001,
      springLength: 230,
      springConstant: 0.08,
    },
    maxVelocity: 146,
    minVelocity: 1,
    solver: 'forceAtlas2Based',
    stabilization: {
      enabled: true,
      iterations: 200,
      fit: true,
    },
    timestep: 0.15,
  },
  interaction: {
    zoomView: true,
    hover: true,
    dragView: true,
    navigationButtons: true,
    keyboard: {
      enabled: true,
      bindToWindow: true,
    },
  },
  layout: {
    improvedLayout: true,
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
  )
}

export default memo(Network)
