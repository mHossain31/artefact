import { v2 as cloudinary } from 'cloudinary'
import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  // Use CLOUDINARY_URL if available
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  })
} else {
  // Fallback to individual variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export interface UrlMetadata {
  title?: string
  description?: string
  favicon?: string
  image?: string
}

export async function extractUrlMetadata(url: string): Promise<UrlMetadata> {
  try {
    console.log('🔍 Extracting metadata for:', url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    // Extract metadata
    const metadata: UrlMetadata = {
      title: $('meta[property="og:title"]').attr('content') || 
             $('meta[name="twitter:title"]').attr('content') || 
             $('title').text() || 
             'Untitled',
      
      description: $('meta[property="og:description"]').attr('content') || 
                  $('meta[name="twitter:description"]').attr('content') || 
                  $('meta[name="description"]').attr('content') || 
                  '',
      
      favicon: getFaviconUrl(url, $),
      
      image: $('meta[property="og:image"]').attr('content') || 
             $('meta[name="twitter:image"]').attr('content')
    }
    
    console.log('✅ Metadata extracted:', metadata)
    return metadata
    
  } catch (error) {
    console.error('❌ Error extracting metadata:', error)
    return {
      title: 'Untitled',
      description: '',
    }
  }
}

function getFaviconUrl(url: string, $: cheerio.CheerioAPI): string {
  try {
    const urlObj = new URL(url)
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`
    
    // Try different favicon selectors
    const faviconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]'
    ]
    
    for (const selector of faviconSelectors) {
      const href = $(selector).attr('href')
      if (href) {
        return href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`
      }
    }
    
    // Fallback to default favicon
    return `${baseUrl}/favicon.ico`
  } catch (error) {
    return ''
  }
}

export async function captureScreenshot(url: string): Promise<string | null> {
  let browser
  
  try {
    console.log('📸 Capturing screenshot for:', url)
    
    // Launch Puppeteer browser with even more stable options
    browser = await puppeteer.launch({
      headless: true, // Use standard headless mode for compatibility
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    })
    
    const page = await browser.newPage()
    
    // Set viewport and user agent
    await page.setViewport({ width: 1200, height: 800 })
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    // Disable unnecessary features that might cause issues
    await page.setJavaScriptEnabled(true)
    await page.setCacheEnabled(false)
    
    try {
      console.log('🔄 Navigating to URL...')
      
      // Use a more conservative approach
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000
      })
      
      if (!response || !response.ok()) {
        throw new Error(`Failed to load page: ${response?.status()}`)
      }
      
      console.log('✅ Page loaded, waiting for content...')
      
      // Wait for content to render
      await new Promise<void>(resolve => setTimeout(resolve, 3000))
      
      // Double-check page is still available
      if (page.isClosed()) {
        throw new Error('Page closed during wait')
      }
      
      console.log('📷 Taking screenshot...')
      
      // Take screenshot with a try-catch specifically for this operation
      let screenshot
      try {
        screenshot = await page.screenshot({
          type: 'jpeg',
          quality: 80,
          fullPage: false,
          clip: { x: 0, y: 0, width: 1200, height: 630 }
        })
      } catch (screenshotError) {
        console.error('Screenshot capture failed:', screenshotError)
        throw screenshotError
      }
      
      console.log('✅ Screenshot captured successfully')
      
      // Close browser before uploading
      await browser.close()
      browser = null
      
      // Upload to Cloudinary
      console.log('☁️ Uploading screenshot to Cloudinary...')
      const base64Screenshot = (screenshot as Buffer).toString('base64')
      const uploadResult = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Screenshot}`,
        {
          folder: 'artefact-screenshots',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 630, crop: 'fill' },
            { quality: 'auto' }
          ]
        }
      )
      
      console.log('✅ Screenshot uploaded:', uploadResult.secure_url)
      return uploadResult.secure_url
      
    } catch (navigationError) {
      console.error('❌ Navigation/Screenshot error:', navigationError)
      if (browser) {
        await browser.close()
      }
      return null
    }
    
  } catch (error) {
    console.error('❌ Error capturing screenshot:', error)
    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.error('Error closing browser:', closeError)
      }
    }
    return null
  }
}

// Fallback screenshot service using a web API
export async function captureScreenshotWithService(url: string): Promise<string | null> {
  try {
    console.log('🌐 Using screenshot service for:', url)
    
    // Using htmlcsstoimage.com API (free tier available)
    // You can also use other services like screenshotapi.net, urlbox.io, etc.
    const screenshotResponse = await fetch('https://htmlcsstoimage.com/demo_run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: `<script>window.location.href = "${url}";</script>`,
        css: '',
        google_fonts: '',
        viewport_width: 1200,
        viewport_height: 630,
        device_scale: 1
      })
    })
    
    if (!screenshotResponse.ok) {
      throw new Error('Screenshot service failed')
    }
    
    const screenshotBlob = await screenshotResponse.blob()
    const arrayBuffer = await screenshotBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Upload to Cloudinary
    console.log('☁️ Uploading service screenshot to Cloudinary...')
    const base64Screenshot = buffer.toString('base64')
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Screenshot}`,
      {
        folder: 'artefact-screenshots-service',
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 630, crop: 'fill' },
          { quality: 'auto' }
        ]
      }
    )
    
    console.log('✅ Service screenshot uploaded:', uploadResult.secure_url)
    return uploadResult.secure_url
    
  } catch (error) {
    console.error('❌ Screenshot service failed:', error)
    return null
  }
}

// New function to get an image with multiple fallbacks
export async function getImageForUrl(url: string, metadata: UrlMetadata): Promise<string | null> {
  // First try to capture a screenshot with Puppeteer
  let imageUrl = await captureScreenshot(url)
  
  if (imageUrl) {
    return imageUrl
  }
  
  // If Puppeteer fails, try screenshot service
  console.log('🔄 Puppeteer failed, trying screenshot service...')
  imageUrl = await captureScreenshotWithService(url)
  
  if (imageUrl) {
    return imageUrl
  }
  
  // Fallback to Open Graph image if screenshot services fail
  if (metadata.image) {
    try {
      console.log('📸 Screenshot services failed, using OG image as fallback:', metadata.image)
      
      // Upload the OG image to Cloudinary for consistency
      const uploadResult = await cloudinary.uploader.upload(metadata.image, {
        folder: 'artefact-og-images',
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 630, crop: 'fill' },
          { quality: 'auto' }
        ]
      })
      
      console.log('✅ OG image uploaded:', uploadResult.secure_url)
      return uploadResult.secure_url
      
    } catch (ogError) {
      console.error('❌ Error uploading OG image:', ogError)
    }
  }
  
  // Final fallback: Generate a simple placeholder
  console.log('🎨 Generating placeholder image...')
  return await generatePlaceholderImage(url, metadata.title || 'Untitled')
}

// Generate a simple placeholder image using Cloudinary's text overlay feature
export async function generatePlaceholderImage(url: string, title: string): Promise<string | null> {
  try {
    const domain = new URL(url).hostname
    
    // Create a simple gradient placeholder with text
    const placeholderUrl = cloudinary.url('placeholder_base', {
      transformation: [
        { width: 1200, height: 630, crop: 'fill' },
        { color: '#6366f1', background: 'auto:predominant' },
        { overlay: { font_family: 'Arial', font_size: 48, text: title.substring(0, 30) } },
        { flags: 'layer_apply', gravity: 'center', y: -50 },
        { overlay: { font_family: 'Arial', font_size: 24, text: domain } },
        { flags: 'layer_apply', gravity: 'center', y: 50, color: '#9ca3af' }
      ]
    })
    
    console.log('✅ Placeholder generated:', placeholderUrl)
    return placeholderUrl
    
  } catch (error) {
    console.error('❌ Error generating placeholder:', error)
    return null
  }
}

// Utility function to validate URL
export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Utility function to normalize URL (add https if missing)
export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}






// import * as cheerio from "cheerio"

// export interface UrlMetadata {
//   title?: string
//   description?: string
//   favicon?: string
//   image?: string
// }

// export async function extractUrlMetadata(url: string): Promise<UrlMetadata> {
//   try {
//     // Ensure URL has protocol
//     const normalizedUrl = url.startsWith("http") ? url : `https://${url}`

//     const response = await fetch(normalizedUrl, {
//       headers: {
//         "User-Agent": "Mozilla/5.0 (compatible; ARTEFACT/1.0; +https://artefact.app)",
//       },
//       timeout: 10000,
//     })

//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status}`)
//     }

//     const html = await response.text()
//     const $ = cheerio.load(html)

//     // Extract title
//     const title =
//       $('meta[property="og:title"]').attr("content") ||
//       $('meta[name="twitter:title"]').attr("content") ||
//       $("title").text() ||
//       ""

//     // Extract description
//     const description =
//       $('meta[property="og:description"]').attr("content") ||
//       $('meta[name="twitter:description"]').attr("content") ||
//       $('meta[name="description"]').attr("content") ||
//       ""

//     // Extract favicon
//     let favicon =
//       $('link[rel="icon"]').attr("href") ||
//       $('link[rel="shortcut icon"]').attr("href") ||
//       $('link[rel="apple-touch-icon"]').attr("href") ||
//       "/favicon.ico"

//     // Make favicon absolute URL
//     if (favicon && !favicon.startsWith("http")) {
//       const urlObj = new URL(normalizedUrl)
//       favicon = favicon.startsWith("/") ? `${urlObj.origin}${favicon}` : `${urlObj.origin}/${favicon}`
//     }

//     // Extract image
//     const image =
//       $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content") || ""

//     return {
//       title: title.trim().substring(0, 200),
//       description: description.trim().substring(0, 500),
//       favicon,
//       image,
//     }
//   } catch (error) {
//     console.error("Metadata extraction error:", error)
//     return {}
//   }
// }

// export async function captureScreenshot(url: string): Promise<string | null> {
//   try {
//     // For now, we'll use a placeholder service
//     // In production, you'd use a service like Puppeteer, Playwright, or a screenshot API
//     const normalizedUrl = url.startsWith("http") ? url : `https://${url}`
//     const screenshotUrl = `https://api.screenshotmachine.com/?key=YOUR_API_KEY&url=${encodeURIComponent(
//       normalizedUrl,
//     )}&dimension=1024x768`

//     // For demo purposes, we'll return a placeholder
//     return `/placeholder.svg?height=400&width=600&query=website screenshot for ${encodeURIComponent(url)}`
//   } catch (error) {
//     console.error("Screenshot capture error:", error)
//     return null
//   }
// }
