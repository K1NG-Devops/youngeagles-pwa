#!/bin/bash

# Deploy pre-built dist folder to Vercel
echo "Deploying pre-built dist folder to Vercel..."

# Create a temporary deployment directory
rm -rf .vercel-deploy
mkdir -p .vercel-deploy

# Copy dist contents to deployment directory
cp -r dist/* .vercel-deploy/

# Create a minimal package.json for Vercel
cat > .vercel-deploy/package.json << EOF
{
  "name": "youngeagles-static",
  "version": "1.0.0",
  "scripts": {
    "build": "echo 'Already built'"
  }
}
EOF

# Create vercel.json for static deployment
cat > .vercel-deploy/vercel.json << EOF
{
  "version": 2,
  "buildCommand": "echo 'Already built'",
  "outputDirectory": ".",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    },
    {
      "source": "/ads.txt",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/plain"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
EOF

# Deploy to Vercel with project name 'youngeagles'
cd .vercel-deploy
vercel --prod --yes --name youngeagles

# Clean up
cd ..
rm -rf .vercel-deploy

echo "Deployment complete!"
