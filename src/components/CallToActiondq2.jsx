import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

/**
 * CallToAction.jsx
 * - Preserves your countdown + animations
 * - Fires EXACT: nbpix('event','raw_call') on pointerdown (safest before navigation)
 * - Shows a small "event sent" chip in UI for quick verification
 *
 * Props:
 *   finalMessage   (boolean): when true, starts 3:00 countdown
 *   switchNumber   (boolean): toggles between two numbers (href + label)
 */
const CallToAction = ({ finalMessage, switchNumber }) => {
  const [time, setTime] = useState(180);
  const [firedAt, setFiredAt] = useState(null); // for on-screen verification

  // Choose numbers based on switchNumber
  const NUMBER_PRIMARY = "+18333668513"; // displays when switchNumber === false
  const NUMBER_FALLBACK = "+13236897861"; // displays when switchNumber === true

  const displayNumber = useMemo(
    () => (switchNumber ? "(323) 689-7861" : "(833) 366-8513"),
    [switchNumber]
  );

  const telHref = useMemo(
    () => (switchNumber ? `tel:${NUMBER_FALLBACK}` : `tel:${NUMBER_PRIMARY}`),
    [switchNumber]
  );

  // Countdown only when finalMessage is true
  useEffect(() => {
    if (!finalMessage) return;
    if (time <= 0) return;

    const timer = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [time, finalMessage]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // NB Pixel safe trigger
  const fireRawCallNBPixel = () => {
    console.log("[nbpix] event 'raw_call' fired for", telHref);

    try {
      // EXACT event + name (with a bit of helpful meta)
      const meta = {
        href: telHref,
        ts: Date.now(),
        ua: navigator.userAgent ? navigator.userAgent.slice(0, 120) : "na",
      };
      if (typeof window !== "undefined" && typeof window.nbpix === "function") {
        window.nbpix("event", "raw_call", meta);
      } else {
        // If pixel not yet ready, calling still queues per their snippet
        // but guard anyway to avoid reference errors:
        if (typeof window !== "undefined" && window.nbpix) {
          window.nbpix("event", "raw_call", meta);
        }
      }
      setFiredAt(new Date());
    } catch (e) {
      // swallow errors to not block call navigation
      // (optional) console.warn("NB Pixel raw_call error:", e);
    }
  };

  return (
    <motion.div
      className="relative flex flex-col items-center pt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Tiny verification chip (shows the last time raw_call was sent) */}
      {/* <div className="absolute -top-2 right-2">
        <div className="rounded-full bg-black/80 text-white text-[11px] px-2 py-1">
          NB: {firedAt ? `sent ${firedAt.toLocaleTimeString()}` : "idle"}
        </div>
      </div> */}

      <motion.div
        className="bg-green-100 text-green-700 text-center p-3 rounded-md w-full max-w-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <p className="font-semibold">
          Tap on the button below to make a quick call & that&apos;s it. You&apos;ll
          be qualified on the call by a licensed agent in minutes 👇
        </p>
      </motion.div>

      {/* IMPORTANT: fire pixel on pointerdown so it queues before dialer takes over */}
      <motion.a
        href={telHref}
        onPointerDown={fireRawCallNBPixel}
        onClickCapture={(e) => {
          // Fallback for browsers without pointer events (rare),
          // ensures we still attempt to fire the event:
          if (!("onpointerdown" in window)) fireRawCallNBPixel();
        }}
        className="mt-4 bg-green-500 text-white text-lg font-bold py-3 px-6 rounded-md w-full max-w-md text-center transition hover:bg-green-600 relative"
        style={{ height: "120%", fontSize: "140%" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Call now ${displayNumber}`}
        data-nbpix-event="raw_call"
      >
        CALL {displayNumber}
      </motion.a>

      <motion.p
        className="mt-4 text-gray-600 text-center text-sm w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Due to high call volume, your official agent is waiting for only{" "}
        <span className="font-bold">3 minutes</span>, then your spot will not be
        reserved.
      </motion.p>

      <motion.p
        className="mt-2 text-red-500 font-bold text-lg"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        {formatTime(time)}
      </motion.p>
    </motion.div>
  );
};

export default CallToAction;
