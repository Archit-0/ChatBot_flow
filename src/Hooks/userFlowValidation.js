export default function useFlowValidation({
  nodes,
  connections,
  setValidationMessage,
  setNodes,
}) {
  const validateFlow = () => {
    if (nodes.length === 0) {
      setValidationMessage("Error: No nodes in the flow!");
      return false;
    }

    setNodes((prev) => prev.map((node) => ({ ...node, hasError: false })));

    if (nodes.length > 1) {
      const nodesWithoutIncoming = nodes.filter(
        (node) => !connections.some((conn) => conn.target === node.id)
      );
      const nodesWithoutOutgoing = nodes.filter(
        (node) => !connections.some((conn) => conn.source === node.id)
      );

      if (nodesWithoutIncoming.length > 1) {
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            hasError: nodesWithoutIncoming.includes(node),
          }))
        );
        setValidationMessage(
          "Error: Multiple nodes without incoming connections!"
        );
        return false;
      }

      if (nodesWithoutOutgoing.length > 1) {
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            hasError: nodesWithoutOutgoing.includes(node),
          }))
        );
        setValidationMessage(
          "Error: Multiple nodes without outgoing connections!"
        );
        return false;
      }

      const connectedNodeIds = new Set();
      connections.forEach((conn) => {
        connectedNodeIds.add(conn.source);
        connectedNodeIds.add(conn.target);
      });

      const isolatedNodes = nodes.filter(
        (node) => !connectedNodeIds.has(node.id)
      );
      if (isolatedNodes.length > 0 && nodes.length > 1) {
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            hasError: isolatedNodes.includes(node),
          }))
        );
        setValidationMessage("Error: Some nodes are isolated!");
        return false;
      }
    }

    const emptyNodes = nodes.filter((node) => !node.content.trim());
    if (emptyNodes.length > 0) {
      setNodes((prev) =>
        prev.map((node) => ({ ...node, hasError: emptyNodes.includes(node) }))
      );
      setValidationMessage("Error: Some nodes have empty content!");
      return false;
    }

    setValidationMessage("Success: Flow validated and saved!");
    return true;
  };

  const handleSave = (validateFn) => {
    const isValid = validateFn();
    if (isValid) {
      console.log("Flow saved", { nodes, connections });
      setTimeout(() => setValidationMessage(""), 3000);
    } else {
      setTimeout(() => setValidationMessage(""), 5000);
    }
  };

  return { validateFlow, handleSave };
}
