// Creates a simple, unique-ish ID. Good enough for our purposes.
export const generateId = () => Math.random().toString(36).substr(2, 9);

// A helper to make dragging feel "snappy" by aligning coordinates to a grid.
export const snapToGrid = (x, y, gridSize = 20) => ({
  x: Math.round(x / gridSize) * gridSize,
  y: Math.round(y / gridSize) * gridSize,
});
