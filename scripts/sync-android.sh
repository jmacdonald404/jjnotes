#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Android folder sync...${NC}"

# Check if android folder exists
if [ ! -d "android" ]; then
    echo -e "${RED}Error: android folder not found${NC}"
    exit 1
fi

# Check if Firebase is configured
if [ ! -f "firebase.json" ]; then
    echo -e "${RED}Error: firebase.json not found. Run 'firebase init' first${NC}"
    exit 1
fi

# Deploy to Firebase Hosting
echo -e "${YELLOW}Deploying android folder to Firebase...${NC}"

if firebase deploy --only hosting:android-files; then
    echo -e "${GREEN}✅ Android folder synced successfully!${NC}"
    echo -e "${GREEN}Your Android files are available at: https://your-project-id.web.app${NC}"
else
    echo -e "${RED}❌ Sync failed${NC}"
    exit 1
fi
