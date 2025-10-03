# Japanese Learning PWA - Proxy Server

This is an optional proxy server that enables the Claude API integration feature in the Japanese Learning PWA.

## Quick Installation (Automated)

### 1. Copy server files to your Ubuntu server
```bash
# Upload the entire 'server' directory to your server
scp -r server/ user@your-server:/tmp/jp-learn-server/
```

### 2. Run the installation script
```bash
# SSH into your server
ssh user@your-server

# Run the automated installation
cd /tmp/jp-learn-server
sudo ./install.sh
```

The script will automatically:
- Install Node.js 20.x (if not already installed)
- Copy files to `/var/www/jp-learn-server`
- Install dependencies
- Set up systemd service
- Start the service
- Optionally configure firewall

### 3. Verify installation
```bash
sudo systemctl status jp-learn-proxy
```

## Uninstallation (Automated)

```bash
cd /tmp/jp-learn-server
sudo ./uninstall.sh
```

---

## Manual Installation (Alternative)

If you prefer to install manually, follow these steps:

### 1. Install Node.js (if not already installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Copy server files to your server
```bash
# Create directory
sudo mkdir -p /var/www/jp-learn-server

# Copy files (adjust path as needed)
sudo cp -r server/* /var/www/jp-learn-server/

# Set ownership
sudo chown -R www-data:www-data /var/www/jp-learn-server
```

### 3. Install dependencies
```bash
cd /var/www/jp-learn-server
sudo -u www-data npm install --production
```

### 4. Install systemd service
```bash
# Copy service file
sudo cp /var/www/jp-learn-server/jp-learn-proxy.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable jp-learn-proxy

# Start the service
sudo systemctl start jp-learn-proxy
```

### 5. Check service status
```bash
# View status
sudo systemctl status jp-learn-proxy

# View logs
sudo journalctl -u jp-learn-proxy -f
```

## Service Management Commands

```bash
# Start service
sudo systemctl start jp-learn-proxy

# Stop service
sudo systemctl stop jp-learn-proxy

# Restart service
sudo systemctl restart jp-learn-proxy

# Check status
sudo systemctl status jp-learn-proxy

# View logs
sudo journalctl -u jp-learn-proxy -n 100

# Follow logs in real-time
sudo journalctl -u jp-learn-proxy -f
```

## Configuration

### Change Port
Edit `/var/www/jp-learn-server/index.js` and modify the PORT constant:
```javascript
const PORT = 3001; // Change to your desired port
```

Then restart the service:
```bash
sudo systemctl restart jp-learn-proxy
```

### Change User
If you want to run the service as a different user, edit `/etc/systemd/system/jp-learn-proxy.service`:
```ini
User=your-username
```

Then reload and restart:
```bash
sudo systemctl daemon-reload
sudo systemctl restart jp-learn-proxy
```

## Firewall Configuration

If you're using UFW firewall, allow the port:
```bash
sudo ufw allow 3001/tcp
```

## Nginx Reverse Proxy (Optional)

If you want to proxy the server through Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then update the React app's API URL in `app/src/utils/claudeApi.ts`:
```javascript
const response = await fetch('https://your-domain.com/api/generate', {
```

## Troubleshooting

### Service won't start
Check logs:
```bash
sudo journalctl -u jp-learn-proxy -n 50
```

### Permission errors
Ensure correct ownership:
```bash
sudo chown -R www-data:www-data /var/www/jp-learn-server
```

### Port already in use
Check what's using the port:
```bash
sudo lsof -i :3001
```

Change the port in `index.js` if needed.

## Uninstall

```bash
# Stop and disable service
sudo systemctl stop jp-learn-proxy
sudo systemctl disable jp-learn-proxy

# Remove service file
sudo rm /etc/systemd/system/jp-learn-proxy.service

# Reload systemd
sudo systemctl daemon-reload

# Remove server files
sudo rm -rf /var/www/jp-learn-server
```
