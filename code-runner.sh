#!/bin/bash

# Accept the image name as a parameter
IMAGE_NAME=$1

# Check if an argument was provided
if [ -z "$IMAGE_NAME" ]; then
  echo "Usage: $0 <image_name>"
  exit 1
fi

if [ "$IMAGE_NAME" = python ]; then
  code_base_path="python"
elif [ "$IMAGE_NAME" = gcc ]; then
  code_base_path="cpp"
elif [ "$IMAGE_NAME" = openjdk ]; then
  code_base_path="java"
elif [ "$IMAGE_NAME" = node ]; then
  code_base_path="nodejs"
fi
cd "$code_base_path"


# Check for a running container of the given image
CONTAINER_ID=$(docker ps -q --filter ancestor="$IMAGE_NAME")

if [ -n "$CONTAINER_ID" ]; then
  # Container exists and is running
  echo "Running container found for image '$IMAGE_NAME' with ID: $CONTAINER_ID"
else
  # No running container found; create a new one
  echo "No running container found for image '$IMAGE_NAME'. Creating a new container..."
  NEW_CONTAINER_ID=$(docker run -d -v ~/dsa-ladder-backend/$code_base_path/code:/usr/src/myapp -w /usr/src/myapp "$IMAGE_NAME":latest sleep infinity)
  echo "New container created with ID: $NEW_CONTAINER_ID"
  CONTAINER_ID=$NEW_CONTAINER_ID
fi

# Return the container ID
echo "Container ID: $CONTAINER_ID"
docker exec -i "$CONTAINER_ID" sh ./script/script.sh

cd ~/dsa-ladder-backend