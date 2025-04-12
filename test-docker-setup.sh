
#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Starting Docker services..."
docker-compose up -d

echo "Waiting for services to start up (30 seconds)..."
sleep 30

echo "Testing backend health endpoint..."
BACKEND_RESPONSE=$(curl -s http://localhost:8000/health || echo "Failed to connect")

if [[ $BACKEND_RESPONSE == *"status"* ]]; then
  echo -e "${GREEN}Backend is running correctly!${NC}"
else
  echo -e "${RED}Backend may not be running correctly. Response: $BACKEND_RESPONSE${NC}"
fi

echo "Testing frontend availability..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "Failed to connect")

if [[ $FRONTEND_RESPONSE == "200" ]]; then
  echo -e "${GREEN}Frontend is running correctly!${NC}"
else
  echo -e "${RED}Frontend may not be running correctly. Response code: $FRONTEND_RESPONSE${NC}"
fi

echo "Docker services test completed. You can access:"
echo "- Frontend at: http://localhost:3000"
echo "- Backend at: http://localhost:8000"
echo ""
echo "To view logs:"
echo "docker-compose logs -f"
echo ""
echo "To stop services:"
echo "docker-compose down"
