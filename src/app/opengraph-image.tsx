import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ffffff 0%, #edfdf8 100%)",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "#15c39a",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                border: "3px solid white",
                borderRadius: "4px",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "40px",
              fontWeight: "800",
              color: "#111827",
              letterSpacing: "-1px",
            }}
          >
            {SITE.name}
          </span>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#15c39a",
              marginBottom: "4px",
            }}
          />
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "68px",
            fontWeight: "800",
            color: "#111827",
            lineHeight: "1.1",
            letterSpacing: "-2px",
            margin: "0 0 24px 0",
            maxWidth: "800px",
          }}
        >
          Stop forgetting English words.
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: "32px",
            color: "#6b7280",
            margin: "0 0 48px 0",
            fontWeight: "400",
          }}
        >
          {SITE.tagline}
        </p>

        {/* Features row */}
        <div
          style={{
            display: "flex",
            gap: "24px",
          }}
        >
          {["AI definitions", "Vietnamese translations", "CEFR levels", "Chrome extension"].map(
            (f) => (
              <div
                key={f}
                style={{
                  padding: "10px 20px",
                  background: "#edfdf8",
                  border: "1px solid #a8f4e1",
                  borderRadius: "100px",
                  fontSize: "20px",
                  color: "#0d8a6a",
                  fontWeight: "500",
                }}
              >
                {f}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
