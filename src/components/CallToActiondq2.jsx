import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

/**
 * CallToAction.jsx
 * - Preserves your countdown + animations
 * - Fires BOTH:
 *     1) nbpix('event','raw_call')
 *     2) ratag('conversion', { to: 3105 })
 *   on pointerdown (safest before navigation to tel:).
 * - Top-right chips show in-UI verification timestamps for each event.
 *
 * REQUIREMENTS:
 *   - index.html already includes:
 *       * NB Pixel snippet (your existing one)
 *       * RaTag base snippet (see instructions)
 *
 * Props:
 *   finalMessage (boolean): when true, starts 3:00 countdown
 *   switchNumber (boolean): toggles between two numbers (href + label)
 */
const CallToAction = ({ finalMessage, switchNumber }) => {
  const [time, setTime] = useState(180);

  // UI verification timestamps
  const [nbFiredAt, setNbFiredAt] = useState(null);
  const [raFiredAt, setRaFiredAt] = useState(null);

  // Choose numbers based on switchNumber
  const NUMBER_PRIMARY = "+18333668513";   // displays when switchNumber === false
  const NUMBER_FALLBACK = "+13236897861";  // displays when switchNumber === true

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

  // --- NB Pixel: raw_call ---
  const fireRawCallNBPixel = () => {
    try {
      const meta = {
        href: telHref,
        ts: Date.now(),
        ua: typeof navigator !== "undefined" && navigator.userAgent
          ? navigator.userAgent.slice(0, 120)
          : "na",
      };
      if (typeof window !== "undefined" && typeof window.nbpix === "function") {
        window.nbpix("event", "raw_call", meta);
      } else if (typeof window !== "undefined" && window.nbpix) {
        // queued per their snippet; guard to avoid reference errors
        window.nbpix("event", "raw_call", meta);
      }
      setNbFiredAt(new Date());
      // Optional: console.log("[nbpix] event 'raw_call' fired for", telHref);
    } catch (_) {
      // swallow; do not block navigation
    }
  };

  // --- RaTag: conversion (to: 3105) ---
  const fireRaTagConversion = () => {
     console.log("[ratag] firing conversion to:3105");
    try {
      // Provide a no-op callback; we're not redirecting because tel: will open dialer.
      const callback = function () {};
      if (typeof window !== "undefined" && typeof window.ratag === "function") {
        window.ratag("conversion", { to: 3105, callback });
      } else if (typeof window !== "undefined" && window._ratagData) {
        // queue call if ratag loader still initializing
        window._ratagData.push(["conversion", { to: 3105, callback }]);
      }
      setRaFiredAt(new Date());
      // Optional: console.log("[ratag] conversion fired (to: 3105)");
    } catch (_) {
      // swallow; do not block navigation
    }
  };

  // Fire both pixels on pointerdown so they queue before tel: navigation
  const handlePointerDown = () => {
    fireRawCallNBPixel();
    fireRaTagConversion();
  };

  return (
    <motion.div
      className="relative flex flex-col items-center pt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
     
      {/* <div className="absolute -top-2 right-2 space-y-1">
        <div className="rounded-full bg-black/80 text-white text-[11px] px-2 py-1">
          NB: {nbFiredAt ? `sent ${nbFiredAt.toLocaleTimeString()}` : "idle"}
        </div>
        <div className="rounded-full bg-black/80 text-white text-[11px] px-2 py-1">
          RT: {raFiredAt ? `sent ${raFiredAt.toLocaleTimeString()}` : "idle"}
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

      {/* Fire pixels on pointerdown; click-capture fallback for older browsers */}
      <motion.a
        href={telHref}
        onPointerDown={handlePointerDown}
        onClickCapture={(e) => {
          if (!("onpointerdown" in window)) handlePointerDown();
        }}
        className="mt-4 bg-green-500 text-white text-lg font-bold py-3 px-6 rounded-md w-full max-w-md text-center transition hover:bg-green-600 relative"
        style={{ height: "120%", fontSize: "140%" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Call now ${displayNumber}`}
        data-nbpix-event="raw_call"
        data-ratag-event="conversion:3105"
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
