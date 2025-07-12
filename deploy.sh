#!/bin/bash

# Deploy to the existing Vercel project
echo "Deploying Young Eagles PWA to Vercel..."

# Deploy using the existing project configuration
vercel --prod --yes

echo "Deployment complete!"
