#!/bin/bash
# VPS Setup Script - Run as root on fresh Ubuntu 22.04
# Usage: sudo bash setup-vps.sh

set -e

echo "=== VPS Setup Script ==="
echo ""

# 1. System update
echo "[1/6] Updating system..."
apt update && apt upgrade -y

# 2. Create deploy user
echo "[2/6] Creating deploy user..."
if id "deploy" &>/dev/null; then
    echo "User 'deploy' already exists, skipping."
else
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo deploy
    echo "deploy ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/deploy
    mkdir -p /home/deploy/.ssh
    chmod 700 /home/deploy/.ssh
    echo "User 'deploy' created."
    echo ""
    echo ">>> Add your SSH public key to /home/deploy/.ssh/authorized_keys"
    echo ">>> Example: cat ~/.ssh/id_rsa.pub | ssh root@YOUR_VPS 'tee /home/deploy/.ssh/authorized_keys'"
    echo ">>> Then: chown deploy:deploy /home/deploy/.ssh/authorized_keys && chmod 600 /home/deploy/.ssh/authorized_keys"
fi

# 3. Install Docker
echo "[3/6] Installing Docker..."
if command -v docker &>/dev/null; then
    echo "Docker already installed, skipping."
else
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker deploy
    echo "Docker installed."
fi

# 4. Configure firewall
echo "[4/6] Configuring firewall..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw status

# 5. Setup swap
echo "[5/6] Setting up 2GB swap..."
if [ -f /swapfile ]; then
    echo "Swap already exists, skipping."
else
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo "Swap created."
fi

# 6. Create app directory
echo "[6/6] Creating app directory..."
mkdir -p /home/deploy/app
chown deploy:deploy /home/deploy/app

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Add SSH key for deploy user"
echo "2. SSH as deploy: ssh deploy@YOUR_VPS"
echo "3. Clone repo: git clone https://github.com/YOUR_REPO.git app"
echo "4. Create .env: cp .env.production.example .env && nano .env"
echo "5. Start: docker compose -f docker-compose.prod.yml up -d"
