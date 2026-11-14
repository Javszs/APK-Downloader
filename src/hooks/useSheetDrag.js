import { useRef, useState } from "react";

export default function useSheetDrag(onDismiss, threshold = 80) {
  const startY = useRef(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  function handlePointerDown(event) {
    if (event.button !== 0 || event.target.closest("button")) return;
    startY.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (startY.current === null) return;
    setDragOffset(Math.max(0, event.clientY - startY.current));
  }

  function finishDrag(event, cancelled = false) {
    if (startY.current === null) return;
    const distance = Math.max(0, event.clientY - startY.current);
    startY.current = null;
    setIsDragging(false);
    setDragOffset(0);
    if (!cancelled && distance >= threshold) onDismiss();
  }

  return {
    dragStyle: isDragging ? { transform: `translateY(${dragOffset}px)`, transition: "none" } : undefined,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp: finishDrag,
    handlePointerCancel: (event) => finishDrag(event, true),
  };
}
