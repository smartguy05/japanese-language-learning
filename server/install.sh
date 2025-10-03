#!/bin/bash

# Japanese Learning PWA - Proxy Server Installation Script
# This script automates the installation of the proxy server on Ubuntu

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="/var/www/jp-learn-server"
SERVICE_NAME="jp-learn-proxy"
SERVICE_USER="www-data"
PORT=3001

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Japanese Learning PWA - Proxy Server${NC}"
echo -e "${GREEN}Installation Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root (use sudo)${NC}"
    exit 1
fi

# Function to check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        echo -e "${GREEN}✓ Node.js is already installed: $NODE_VERSION${NC}"
        return 0
    else
        return 1
    fi
}

# Install Node.js if needed
if ! check_nodejs; then
    echo -e "${YELLOW}Node.js not found. Installing Node.js 20.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}✓ Node.js installed successfully${NC}"
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create installation directory
echo -e "${YELLOW}Creating installation directory...${NC}"
mkdir -p "$INSTALL_DIR"

# Copy files
echo -e "${YELLOW}Copying server files...${NC}"
cp "$SCRIPT_DIR/index.js" "$INSTALL_DIR/"
cp "$SCRIPT_DIR/package.json" "$INSTALL_DIR/"

# Set ownership
echo -e "${YELLOW}Setting file ownership...${NC}"
chown -R $SERVICE_USER:$SERVICE_USER "$INSTALL_DIR"

# Install dependencies
echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
cd "$INSTALL_DIR"
sudo -u $SERVICE_USER npm install --production

# Install systemd service
echo -e "${YELLOW}Installing systemd service...${NC}"
cp "$SCRIPT_DIR/jp-learn-proxy.service" /etc/systemd/system/

# Reload systemd
echo -e "${YELLOW}Reloading systemd...${NC}"
systemctl daemon-reload

# Enable service
echo -e "${YELLOW}Enabling service to start on boot...${NC}"
systemctl enable $SERVICE_NAME

# Start service
echo -e "${YELLOW}Starting service...${NC}"
systemctl start $SERVICE_NAME

# Wait a moment for service to start
sleep 2

# Check service status
if systemctl is-active --quiet $SERVICE_NAME; then
    echo -e "${GREEN}✓ Service started successfully!${NC}"
else
    echo -e "${RED}✗ Service failed to start. Checking logs...${NC}"
    journalctl -u $SERVICE_NAME -n 20
    exit 1
fi

# Configure firewall if UFW is active
if command -v ufw &> /dev/null && ufw status | grep -q "Status: active"; then
    echo -e "${YELLOW}UFW firewall detected. Do you want to allow port $PORT? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        ufw allow $PORT/tcp
        echo -e "${GREEN}✓ Firewall rule added${NC}"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Service Status: ${GREEN}Running${NC}"
echo -e "Installation Directory: ${YELLOW}$INSTALL_DIR${NC}"
echo -e "Service Name: ${YELLOW}$SERVICE_NAME${NC}"
echo -e "Port: ${YELLOW}$PORT${NC}"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  View status:  ${GREEN}sudo systemctl status $SERVICE_NAME${NC}"
echo -e "  View logs:    ${GREEN}sudo journalctl -u $SERVICE_NAME -f${NC}"
echo -e "  Restart:      ${GREEN}sudo systemctl restart $SERVICE_NAME${NC}"
echo -e "  Stop:         ${GREEN}sudo systemctl stop $SERVICE_NAME${NC}"
echo -e "  Uninstall:    ${GREEN}sudo $SCRIPT_DIR/uninstall.sh${NC}"
echo ""
echo -e "${GREEN}The proxy server is now running on http://localhost:$PORT${NC}"
echo -e "${YELLOW}Make sure your React app is configured to use this URL.${NC}"
echo ""
