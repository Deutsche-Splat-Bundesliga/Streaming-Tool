#!/bin/sh

echo "Starting Streaming Tool..."
echo "Checking dependencies..."

# Check for Node.js
echo "Checking for Node.js..."
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Install it now? (y/N)"
  read -r installNode
  if [ "$installNode" = "y" ] || [ "$installNode" = "Y" ]; then
    echo "Installing Node.js..."
    if command -v apt-get >/dev/null 2>&1; then
      sudo apt-get update && sudo apt-get install -y nodejs npm
    elif command -v brew >/dev/null 2>&1; then
      brew install node
    else
      echo "Package manager not found. Please install Node.js manually from https://nodejs.org"
      read -r -n 1 -s dummy
      exit 0
    fi
    if ! command -v node >/dev/null 2>&1; then
      echo "Node.js installation failed. Please install Node.js manually from https://nodejs.org. Press any key to close this window..."
      read -r -n 1 -s dummy
      exit 0
    fi
    echo "Node.js installed successfully!"
  else
    echo "Node.js is required. Press any key to close this window..."
    read -r -n 1 -s dummy
    exit 0
  fi
fi

# Check for .NET
echo "Checking for .NET..."
if ! command -v dotnet >/dev/null 2>&1; then
  echo ".NET is not installed. Install it now? (y/N)"
  read -r installDotNet
  if [ "$installDotNet" = "y" ] || [ "$installDotNet" = "Y" ]; then
    echo "Installing .NET 10 SDK..."
    if command -v apt-get >/dev/null 2>&1; then
      wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
      chmod +x dotnet-install.sh
      sudo ./dotnet-install.sh --version 10.0
      rm dotnet-install.sh
    elif command -v brew >/dev/null 2>&1; then
      brew install dotnet
    else
      echo "Package manager not found. Please install .NET 10 manually from https://dotnet.microsoft.com/en-us/download/dotnet/10.0"
      read -r -n 1 -s dummy
      exit 0
    fi
    if ! command -v dotnet >/dev/null 2>&1; then
      echo ".NET installation failed. Please install .NET 10 manually from https://dotnet.microsoft.com/en-us/download/dotnet/10.0. Press any key to close this window..."
      read -r -n 1 -s dummy
      exit 0
    fi
  else
    echo ".NET is required. Press any key to close this window..."
    read -r -n 1 -s dummy
    exit 0
  fi
fi

echo "Starting frontend..."
if [ -f "./Frontend/control-panel/package.json" ]; then
  (
    cd "./Frontend/control-panel" || exit 1
    npm install
    npm start
  ) &
else
  echo "Frontend project not found! Press any key to exit..."
  read -r -n 1 -s dummy
fi

echo "Starting backend..."
if [ -f "./Backend/DSB.StreamBackend/DSB.StreamBackend.csproj" ]; then
  (
    cd "./Backend/DSB.StreamBackend" || exit 1
    dotnet run
  ) &
else
  echo "Backend project not found! Stopping frontend..."
  pkill -f "npm start" > /dev/null 2>&1 || true
  echo "Press any key to exit..."
  read -r -n 1 -s dummy
fi

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://localhost:4200"
else
  echo "Please open http://localhost:4200 in your browser."
fi

echo "Website opened in the browser."
echo "Streaming Tool started. Press any key to close this window..."
read -r -n 1 -s dummy
exit 0
