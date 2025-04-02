#!/bin/bash

# Script to reorganize GraphQL operations into queries and mutations directories

# Create necessary directories
mkdir -p app/queries app/mutations
mkdir -p user/queries user/mutations
mkdir -p project/queries project/mutations
mkdir -p repository/queries repository/mutations
mkdir -p issue/queries issue/mutations
mkdir -p label/queries label/mutations
mkdir -p column/queries column/mutations
mkdir -p collaborator/queries collaborator/mutations

# Function to move files based on their content
move_file() {
  file=$1
  if grep -q "^query" "$file"; then
    # Get the directory name (e.g., app, user, etc.)
    dir=$(dirname "$file")
    filename=$(basename "$file")
    # Create the queries directory if it doesn't exist
    mkdir -p "$dir/queries"
    # Copy the file to the new location (we'll delete originals later)
    cp "$file" "$dir/queries/$filename"
    echo "Moved $file to $dir/queries/$filename"
  elif grep -q "^mutation" "$file"; then
    # Get the directory name
    dir=$(dirname "$file")
    filename=$(basename "$file")
    # Create the mutations directory if it doesn't exist
    mkdir -p "$dir/mutations"
    # Copy the file to the new location
    cp "$file" "$dir/mutations/$filename"
    echo "Moved $file to $dir/mutations/$filename"
  else
    echo "Could not determine operation type for: $file"
  fi
}

# Process files in each domain directory
for domain in app user project repository issue label column collaborator; do
  if [ -d "$domain" ]; then
    for file in "$domain"/*.graphql; do
      if [ -f "$file" ]; then
        move_file "$file"
      fi
    done
  fi
done

echo "Reorganization complete!"
echo "Please verify that all files were moved correctly before deleting the originals." 