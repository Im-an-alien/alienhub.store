import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a phone on the same Wi-Fi use the DEV server without Next.js blocking
  // the client JS as a cross-origin request (a common cause of "buttons don't
  // work on my phone"). Put your PC's LAN IP here.
  //   Windows: run `ipconfig` → copy the IPv4 Address (e.g. 192.168.1.23)
  //   Then open the site on your phone at  http://<that-ip>:3000
  allowedDevOrigins: [
    "192.168.68.101", // this PC's LAN IP (from the `next dev` Network URL)
    "192.168.68.107", // previous IP (kept in case DHCP hands it back)
    // PC's IP changes with DHCP. If the phone gets blocked again, add the new
    // "Network" IP shown by `next dev` here and restart the dev server.
  ],
};

export default nextConfig;
