import { CERT_COLORS as C, certTexts, type CertData } from "./spec";

/**
 * OG-версия сертификата (1200×630) для satori/ImageResponse.
 * Тот же дизайн, что и Canvas-рендер: рамки, маскот, номер, печать.
 * satori не умеет текст по дуге — печать упрощена до круга с строками.
 */
export function OgCertificate({ data }: { data: CertData }) {
  const t = certTexts(data);
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        backgroundColor: C.bg,
        fontFamily: "Rubik",
        position: "relative",
      }}
    >
      {/* рамки */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          right: 24,
          bottom: 24,
          border: `10px solid ${C.frame}`,
          borderRadius: 26,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 44,
          right: 44,
          bottom: 44,
          border: `2px solid ${C.frameThin}`,
          borderRadius: 16,
        }}
      />

      {/* радуга в правом верхнем углу (полудуги через клип) */}
      <div
        style={{
          position: "absolute",
          top: 62,
          right: 66,
          width: 150,
          height: 75,
          overflow: "hidden",
          display: "flex",
        }}
      >
        {C.rainbow.map((color, i) => (
          <div
            key={color}
            style={{
              position: "absolute",
              top: 6 + i * 9,
              left: 6 + i * 9,
              width: 138 - i * 18,
              height: 138 - i * 18,
              border: `7px solid ${color}`,
              borderRadius: 9999,
            }}
          />
        ))}
      </div>

      {/* мини-маскот слева-снизу */}
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 420,
          width: 132,
          height: 60,
          display: "flex",
          transform: "rotate(-14deg)",
        }}
      >
        <div
          style={{
            width: 124,
            height: 52,
            backgroundColor: C.sausage,
            border: `4px solid ${C.sausageDark}`,
            borderRadius: 26,
            position: "relative",
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 14,
              width: 13,
              height: 13,
              backgroundColor: C.ink,
              borderRadius: 9999,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 66,
              top: 14,
              width: 13,
              height: 13,
              backgroundColor: C.ink,
              borderRadius: 9999,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 22,
              top: 28,
              width: 11,
              height: 11,
              backgroundColor: C.blush,
              borderRadius: 9999,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 86,
              top: 28,
              width: 11,
              height: 11,
              backgroundColor: C.blush,
              borderRadius: 9999,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 51,
              top: 26,
              width: 17,
              height: 9,
              borderBottom: `4px solid ${C.ink}`,
              borderBottomLeftRadius: 9999,
              borderBottomRightRadius: 9999,
            }}
          />
        </div>
      </div>

      {/* печать справа-снизу */}
      <div
        style={{
          position: "absolute",
          right: 96,
          top: 386,
          width: 168,
          height: 168,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotate(-12deg)",
          opacity: 0.85,
        }}
      >
        <div
          style={{
            width: 168,
            height: 168,
            border: `4px solid ${C.stamp}`,
            borderRadius: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: C.stamp,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700 }}>ОДОБРЕНО</div>
          <div
            style={{
              width: 124,
              height: 124,
              border: `2px solid ${C.stamp}`,
              borderRadius: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            <div style={{ fontSize: 19, fontWeight: 700 }}>МЕТЕО</div>
            <div style={{ fontSize: 19, fontWeight: 700 }}>РИТУАЛ</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>
            ОСАДКИ ОТМЕНЕНЫ
          </div>
        </div>
      </div>

      {/* контент */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 1200,
          paddingTop: 74,
        }}
      >
        <div
          style={{
            fontSize: 23,
            fontWeight: 700,
            color: C.accent,
            letterSpacing: 10,
          }}
        >
          {t.agency}
        </div>
        <div
          style={{
            fontSize: 82,
            fontWeight: 700,
            color: C.ink,
            marginTop: 14,
            letterSpacing: 4,
          }}
        >
          {t.title}
        </div>
        <div style={{ fontSize: 29, color: C.ink, marginTop: 2 }}>
          {t.subtitle}
        </div>
        <div
          style={{
            fontSize: 24,
            color: C.ink,
            marginTop: 26,
            width: 760,
            textAlign: "center",
            lineHeight: 1.35,
          }}
        >
          {t.certifies}
        </div>
        <div
          style={{
            fontFamily: "Caveat",
            fontSize: 60,
            fontWeight: 700,
            color: C.accent,
            marginTop: 10,
          }}
        >
          {t.name}
        </div>
        <div style={{ fontSize: 23, color: C.ink, marginTop: 8 }}>
          {t.forWedding}
        </div>
        <div
          style={{
            fontSize: 37,
            fontWeight: 700,
            color: C.ink,
            marginTop: 18,
          }}
        >
          {t.sausageNo}
        </div>
      </div>
    </div>
  );
}
