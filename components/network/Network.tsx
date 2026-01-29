import { memo, useState, useCallback, useEffect, useMemo, useRef } from 'react'
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d'
import { BsArrowsFullscreen } from 'react-icons/bs'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { forceRadial } from 'd3-force'
import { useResizeObserver } from 'usehooks-ts'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { getIconUnicode } from '@helpers/icons'
import ListingDialog from '@components/main-list/listing-dialog'
import { Button } from '@components/ui/button'
import styles from './Network.module.css'

type NodeType = {
  id: string | number
  label: string
  color: string
  group?: string
  category?: {
    color: string
    label: string
  }
  val?: number
  x?: number
  y?: number
  fx?: number
  fy?: number
  [key: string]: any
}

type LinkType = {
  source: string | number
  target: string | number
  dashes?: boolean
}

type GraphData = {
  nodes: NodeType[]
  links: LinkType[]
}

const Network = ({ data, selectedId, setSelectedId }) => {
  const router = useRouter()
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [hoveredNode, setHoveredNode] = useState<NodeType | null>(null)
  const graphRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<ForceGraphMethods<NodeType, LinkType>>(null)

  const { width = 0, height = 0 } = useResizeObserver({ ref: graphRef })

  // Derive isOpen from selectedId to avoid useEffect/setState pattern
  const isOpen = Boolean(selectedId)

  // Transform vis-network data format to react-force-graph format
  const graphData: GraphData = useMemo(() => {
    if (!data) return { nodes: [], links: [] }

    // Transform nodes with appropriate sizing based on group
    const nodes: NodeType[] = data.nodes.map((node) => {
      let val = 8 // Default size for listings

      if (node.group === 'central-node') {
        val = 40
      } else if (node.group === 'category') {
        val = 15
      } else if (node.group === 'related-web') {
        val = 15
      }

      return {
        ...node,
        val,
      }
    })

    // Create a set of valid node IDs for quick lookup
    const nodeIds = new Set(nodes.map((n) => n.id))

    // Transform edges to links (react-force-graph uses source/target instead of from/to)
    // Filter out links that reference non-existent nodes
    const links: LinkType[] = data.edges
      .filter((edge) => {
        const sourceExists = nodeIds.has(edge.from)
        const targetExists = nodeIds.has(edge.to)
        if (!sourceExists || !targetExists) {
          // Silent filter - these are typically relation edges with mismatched IDs
          return false
        }
        return true
      })
      .map((edge) => ({
        source: edge.from,
        target: edge.to,
        dashes: edge.dashes || false,
      }))

    return { nodes, links }
  }, [data])

  const handleNodeClick = useCallback(
    (node: NodeType) => {
      if (typeof node.id === 'string' && node.id.includes('related-web')) {
        const webSlug = node.id.match(/related-web-(.*)/)?.[1] || ''
        router.push(`${PROTOCOL}://${webSlug}.${REMOTE_HOSTNAME}`)
      } else if (
        node.group !== 'category' &&
        node.group !== 'central-node' &&
        node.group !== 'related-web'
      ) {
        setSelectedId(node.id)
      }
    },
    [router, setSelectedId],
  )

  const handleNodeHover = useCallback((node: NodeType | null) => {
    if (node && (node.group === 'category' || node.group === 'central-node')) {
      // Don't show pointer cursor for categories as they are not clickable
      setHoveredNode(null)
      document.body.style.cursor = 'default'
      return
    } else {
      setHoveredNode(node)
      document.body.style.cursor = node ? 'pointer' : 'default'
    }
  }, [])

  const selectedItem = useMemo(
    () => data?.nodes.find((node) => node.id === selectedId),
    [data?.nodes, selectedId],
  )

  const onCloseDialog = useCallback(() => {
    setSelectedId(null)
  }, [setSelectedId])

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

  // Custom node canvas rendering
  const nodeCanvasObject = useCallback(
    (node: NodeType, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.label
      const fontSize = 4

      // Calculate node radius based on val
      const nodeRadius = Math.sqrt(node.val || 8) * 2

      // Draw node circle
      ctx.beginPath()
      ctx.arc(node.x || 0, node.y || 0, nodeRadius, 0, 2 * Math.PI, false)

      // Fill color based on group or category
      if (node.group === 'central-node') {
        ctx.fillStyle = '#fcba03'
      } else if (node.group === 'category') {
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#c3c4c7'
        ctx.lineWidth = 2 / globalScale
      } else if (node.group === 'related-web') {
        ctx.fillStyle = '#6366f1' // Indigo for related webs
      } else {
        ctx.fillStyle = node.color || '#999'
      }

      ctx.fill()

      // Add subtle border
      ctx.strokeStyle =
        hoveredNode?.id === node.id ? '#000' : 'rgba(0, 0, 0, 0.2)'
      ctx.lineWidth = hoveredNode?.id === node.id ? 2 / globalScale : 0.5

      // Override border to be thicker for categories
      if (node.group === 'category') {
        ctx.strokeStyle = '#999'
        ctx.lineWidth = 1.5 / globalScale
      }

      ctx.stroke()

      // Draw icon inside the circle
      // For listings: comes as object with code
      // For categories: comes as string name, need to look up
      const iconCode =
        node.icon?.code ||
        (node.group === 'category' ? getIconUnicode(node.icon) : null)

      if (
        iconCode &&
        node.group !== 'central-node' &&
        node.group !== 'related-web'
      ) {
        const iconSize = nodeRadius * 1.0
        ctx.font = `900 ${iconSize}px "Font Awesome 5 Free"`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = node.group === 'category' ? '#666' : '#fff'
        ctx.fillText(iconCode, node.x || 0, node.y || 0)
      }

      // Draw label underneath the circle
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      // Truncate label if too long
      const maxLabelLength = node.group === 'central-node' ? 30 : 20
      const displayLabel =
        label.length > maxLabelLength
          ? label.substring(0, maxLabelLength) + '...'
          : label

      // Position label below the node
      const labelY = (node.y || 0) + nodeRadius + 3

      // Text styling based on group
      if (node.group === 'central-node') {
        ctx.font = `bold ${fontSize * 1.5}px Inter, sans-serif`
        ctx.fillStyle = '#333'
      } else if (node.group === 'category') {
        ctx.font = `600 ${fontSize * 1.2}px Inter, sans-serif`
        ctx.fillStyle = '#333'
      } else if (node.group === 'related-web') {
        ctx.font = `${fontSize}px Inter, sans-serif`
        ctx.fillStyle = '#444'
      } else {
        // Listing nodes - draw text with background for readability
        ctx.font = `${fontSize}px Inter, sans-serif`
        const textMetrics = ctx.measureText(displayLabel)
        const textWidth = textMetrics.width
        const textHeight = fontSize

        // Draw background rectangle
        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)'
        const padding = 2
        const borderRadius = 3
        const rectX = (node.x || 0) - textWidth / 2 - padding
        const rectY = labelY - padding / 2
        const rectWidth = textWidth + padding * 2
        const rectHeight = textHeight + padding

        // Rounded rectangle
        ctx.beginPath()
        ctx.moveTo(rectX + borderRadius, rectY)
        ctx.lineTo(rectX + rectWidth - borderRadius, rectY)
        ctx.quadraticCurveTo(
          rectX + rectWidth,
          rectY,
          rectX + rectWidth,
          rectY + borderRadius,
        )
        ctx.lineTo(rectX + rectWidth, rectY + rectHeight - borderRadius)
        ctx.quadraticCurveTo(
          rectX + rectWidth,
          rectY + rectHeight,
          rectX + rectWidth - borderRadius,
          rectY + rectHeight,
        )
        ctx.lineTo(rectX + borderRadius, rectY + rectHeight)
        ctx.quadraticCurveTo(
          rectX,
          rectY + rectHeight,
          rectX,
          rectY + rectHeight - borderRadius,
        )
        ctx.lineTo(rectX, rectY + borderRadius)
        ctx.quadraticCurveTo(rectX, rectY, rectX + borderRadius, rectY)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = '#fff'
      }

      ctx.fillText(displayLabel, node.x || 0, labelY)
    },
    [hoveredNode],
  )

  // Custom link rendering for dashed lines
  const linkCanvasObject = useCallback(
    (
      link: LinkType & { source: NodeType; target: NodeType },
      ctx: CanvasRenderingContext2D,
    ) => {
      const start = link.source
      const end = link.target

      if (!start.x || !start.y || !end.x || !end.y) return

      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.lineWidth = 1

      if (link.dashes) {
        ctx.setLineDash([5, 5])
      } else {
        ctx.setLineDash([])
      }

      ctx.stroke()
      ctx.setLineDash([]) // Reset dash
    },
    [],
  )

  // Configure forces for better spacing
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // Moderate repulsion between nodes
      fgRef.current.d3Force('charge')?.strength(-110)
      // Variable link distance based on node types
      fgRef.current.d3Force('link')?.distance((link: any) => {
        const source = link.source
        const target = link.target
        // Shorter distance for central-to-category links
        if (
          source.group === 'central-node' ||
          target.group === 'central-node'
        ) {
          return 20
        }
        // Normal distance for category-to-listing links
        return 50
      })
      // Add radial force to keep categories at consistent distance from center
      const radial = forceRadial(120, 0, 0).strength((node: any) => {
        // Only apply to category nodes
        return node.group === 'category' ? 0.3 : 0
      })
      fgRef.current.d3Force('radial', radial as any)
      // Reheat simulation to apply new forces
      fgRef.current.d3ReheatSimulation()
    }
  }, [graphData])

  // Zoom to fit after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fgRef.current) {
        fgRef.current.zoomToFit(400, 50)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [graphData])

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
            zIndex: 1000,
          }}
        >
          <BsArrowsFullscreen />
          {isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        </Button>
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          width={width}
          height={height}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(node, color, ctx) => {
            const nodeRadius = Math.sqrt(node.val || 8) * 2
            ctx.beginPath()
            ctx.arc(node.x || 0, node.y || 0, nodeRadius, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()
          }}
          linkCanvasObject={linkCanvasObject}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          nodeId="id"
          nodeLabel=""
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          backgroundColor="#ffffff"
        />
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
