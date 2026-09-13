import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCodeSVG({
  value,
  size = 100,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const [svg, setSvg] = useState<string>("");
  useEffect(() => {
    QRCode.toString(value || " ", {
      type: "svg",
      margin: 1,
      width: size,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [value, size]);
  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label={`QR code for ${value}`}
    />
  );
}
