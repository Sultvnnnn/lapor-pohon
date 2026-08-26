import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*.loca.lt",
    "*.trycloudflare.com",
    "*.lhr.life",
    "*.ngrok-free.app",
    "*.pinggy.link",
    "*.localhost.run",
  ],
  /* config options here */

};

export default nextConfig;
