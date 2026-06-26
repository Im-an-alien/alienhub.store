import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a phone on the same Wi-Fi use the DEV server without Next.js blocking
  // the client JS as a cross-origin request (a common cause of "buttons don't
  // work on my phone"). Put your PC's LAN IP here.
  //   Windows: run `ipconfig` → copy the IPv4 Address (e.g. 192.168.1.23)
  //   Then open the site on your phone at  http://<that-ip>:3000
  allowedDevOrigins: [
    "192.168.68.107", // this PC's current LAN IP (from `next dev` Network URL)
    // If your PC's IP changes (run `ipconfig` to check), update this and restart.
  ],
};

export default nextConfig;
