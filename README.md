# SWENG 411 Chess Project - Group 3

This is Group 3's class project for SWENG 411 (Software Engineering) in the Summer of 2025.

## Project Description

A multiplayer chess game implementation built with TypeScript, featuring a client-server architecture using Socket.IO for real-time communication.


## Requirements

Before running the project, ensure you have the following installed:

1. **Node.js** (version 14 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **npm** (comes with Node.js)
   - Used for package management

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Coolman4128/SWENG411Group3ChessProject.git
   cd SWENG411Group3ChessProject
   ```

2. Install dependencies for both client and server:
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   cd ..
   ```

## How to Run

### Quick Start (Recommended)

Simply run the build and run script:

```bash
build_and_run.bat
```

This script will:
1. Build the client TypeScript code
2. Set up the server public directory
3. Copy client files to the server
4. Copy the HTML file
5. Build the server TypeScript code
6. Start the server



## Accessing the Game

Once the server is running, open your web browser and navigate to:
```
http://localhost:3000
```


