# SkyPack

**SkyPack** is a decentralized file-sharing platform that enables real-time file transfer between multiple devices. By creating virtual rooms, users can securely share files directly without relying on cloud storage or intermediaries. Leveraging WebRTC technology, SkyPack offers a fast, efficient, and private file sharing experience.

### Tech Stack
* Frontend Framework: React
* Styling: Tailwind CSS
* Peer-to-Peer Connection: WebRTC API
* Signaling Server: Websocket (Node.js)

### Project Goals
* Decentralized file sharing
* Real-time file transfer across multiple devices
* Secure file sharing without relying on cloud storage or third parties

### Installation
**Prerequisites:**
1. Clone the Signaling Server repository and follow the instructions to setup the signaling server:

    ```bash
    git clone [webrtc-signaling-server](https://github.com/vigneshkk18/webrtc-signaling-server.git)
    ```
2. Add the signaling server url as env variable

    ```.env
    VITE_SOCKET_URL = "[YOU_URL]/many-to-many"
    ```
3. Install dependencies
    ```bash
    npm install
    ```
4. Start the server:
    ```bash
    npm run dev
    ```

### Usage:
// Add Screenshots

