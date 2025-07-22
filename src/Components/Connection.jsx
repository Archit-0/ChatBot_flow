// Connection component - This component draws the pretty SVG curve between two nodes.

export default function Connection({ connection, nodes }) {
  // Find the start and end nodes for this connection from our main nodes array.
  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  // If for some reason a node is missing, don't try to draw anything.
  if (!sourceNode || !targetNode) return null;

  // We need to approximate the node dimensions to calculate the connection points.
  const nodeWidth = 200;
  const nodeHeight = 60;

  // Calculate the start (source) and end (target) coordinates for the line.
  const sourceX = sourceNode.x + nodeWidth; // Right edge of the source node
  const sourceY = sourceNode.y + nodeHeight / 2; // Middle of the source node
  const targetX = targetNode.x; // Left edge of the target node
  const targetY = targetNode.y + nodeHeight / 2; // Middle of the target node

  // This is the secret sauce for making the line curvy instead of straight.
  // We're creating a cubic Bezier curve.
  const controlPointOffset = Math.abs(targetX - sourceX) * 0.5;
  const controlPoint1X = sourceX + controlPointOffset;
  const controlPoint2X = targetX - controlPointOffset;

  // The 'd' attribute of the SVG path. It looks scary but just means:
  // "M" = Move to the start point.
  // "C" = Draw a Cubic Bezier curve using the control points to the end point.
  const path = `M ${sourceX} ${sourceY} C ${controlPoint1X} ${sourceY}, ${controlPoint2X} ${targetY}, ${targetX} ${targetY}`;

  return (
    <g>
      <path
        d={path}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)" // This adds the little arrowhead at the end.
        className="hover:stroke-blue-600 cursor-pointer transition-colors"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
      />
    </g>
  );
}
