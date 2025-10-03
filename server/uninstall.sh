#!/bin/bash

# Japanese Learning PWA - Proxy Server Uninstallation Script

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="/var/www/jp-learn-server"
SERVICE_NAME="jp-learn-proxy"
PORT=3001

echo -e "${RED}========================================${NC}"
echo -e "${RED}Japanese Learning PWA - Proxy Server${NC}"
echo -e "${RED}Uninstallation Script${NC}"
echo -e "${RED}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root (use sudo)${NC}"
    exit 1
fi

# Confirm uninstallation
echo -e "${YELLOW}This will completely remove the proxy server.${NC}"
echo -e "${YELLOW}Are you sure you want to continue? (yes/no)${NC}"
read -r response

if [[ ! "$response" =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${GREEN}Uninstallation cancelled.${NC}"
    exit 0
fi

echo ""

# Stop service
if systemctl is-active --quiet $SERVICE_NAME; then
    echo -e "${YELLOW}Stopping service...${NC}"
    systemctl stop $SERVICE_NAME
    echo -e "${GREEN}✓ Service stopped${NC}"
fi

# Disable service
if systemctl is-enabled --quiet $SERVICE_NAME 2>/dev/null; then
    echo -e "${YELLOW}Disabling service...${NC}"
    systemctl disable $SERVICE_NAME
    echo -e "${GREEN}✓ Service disabled${NC}"
fi

# Remove service file
if [ -f "/etc/systemd/system/$SERVICE_NAME.service" ]; then
    echo -e "${YELLOW}Removing service file...${NC}"
    rm /etc/systemd/system/$SERVICE_NAME.service
    echo -e "${GREEN}✓ Service file removed${NC}"
fi

# Reload systemd
echo -e "${YELLOW}Reloading systemd...${NC}"
systemctl daemon-reload
systemctl reset-failed
echo -e "${GREEN}✓ Systemd reloaded${NC}"

# Remove installation directory
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Removing installation directory...${NC}"
    rm -rf "$INSTALL_DIR"
    echo -e "${GREEN}✓ Installation directory removed${NC}"
fi

# Remove firewall rule if UFW is active
if command -v ufw &> /dev/null && ufw status | grep -q "Status: active"; then
    if ufw status | grep -q "$PORT/tcp"; then
        echo -e "${YELLOW}UFW firewall rule detected. Do you want to remove port $PORT rule? (y/n)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            ufw delete allow $PORT/tcp
            echo -e "${GREEN}✓ Firewall rule removed${NC}"
        fi
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Uninstallation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}The proxy server has been completely removed from your system.${NC}"
echo ""
