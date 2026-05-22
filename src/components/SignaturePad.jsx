import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Eraser, PenLine } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

const SignaturePad = forwardRef(function SignaturePad({ initialValue = "", onDone, disabled = false }, ref) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [hasSignature, setHasSignature] = useState(Boolean(initialValue));
  const [drawing, setDrawing] = useState(false);

  useImperativeHandle(ref, () => ({
    clear: clearCanvas,
    isEmpty: () => !hasSignature,
    toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#10231d";
    context.lineWidth = 2.4;

    function syncCanvasSize() {
      const { width } = canvas.getBoundingClientRect();
      const snapshot = canvas.toDataURL("image/png");
      canvas.width = width * window.devicePixelRatio;
      canvas.height = 190 * window.devicePixelRatio;
      canvas.style.height = "190px";
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#10231d";
      context.lineWidth = 2.4;

      if (snapshot && snapshot !== "data:,") {
        const image = new Image();
        image.onload = () => {
          context.drawImage(image, 0, 0, width, 190);
        };
        image.src = snapshot;
      } else if (initialValue) {
        const image = new Image();
        image.onload = () => {
          context.drawImage(image, 0, 0, width, 190);
          setHasSignature(true);
        };
        image.src = initialValue;
      }
    }

    syncCanvasSize();
    window.addEventListener("resize", syncCanvasSize);
    return () => window.removeEventListener("resize", syncCanvasSize);
  }, [initialValue]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }

  function getPoint(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = "touches" in event ? event.touches[0] : event;
    return {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
    };
  }

  function handlePointerStart(event) {
    if (disabled) {
      return;
    }
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    event.preventDefault();
    const point = getPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    setDrawing(true);
  }

  function handlePointerMove(event) {
    if (disabled || !drawing) {
      return;
    }
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    event.preventDefault();
    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    setHasSignature(true);
  }

  function handlePointerEnd() {
    if (!drawing) {
      return;
    }
    setDrawing(false);
  }

  function handleDone() {
    onDone?.(canvasRef.current?.toDataURL("image/png") ?? "");
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{t("reports.signatureTitle")}</p>
          <p className="text-xs text-slate-500">{t("reports.signatureHelp")}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clearCanvas}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
          >
            <Eraser className="h-4 w-4" />
            {t("reports.clear")}
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-4 py-2 text-sm font-semibold text-white"
          >
            <PenLine className="h-4 w-4" />
            {t("reports.done")}
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerStart}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerEnd}
        onMouseLeave={handlePointerEnd}
        onTouchStart={handlePointerStart}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerEnd}
        className={`mt-4 w-full rounded-[1.5rem] border-2 border-dashed ${
          hasSignature ? "border-brand-teal/40" : "border-slate-200"
        } bg-slate-50 touch-none`}
      />
    </div>
  );
});

export default SignaturePad;
