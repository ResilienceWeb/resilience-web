#!/usr/bin/env npx ts-node

/**
 * Image Compression Script
 *
 * Compresses images in a specified folder without changing dimensions or format.
 * Supports: JPG/JPEG, PNG, WebP
 *
 * Usage: npx ts-node scripts/compress-images.ts <folder-path>
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

interface CompressionResult {
  file: string
  originalSize: number
  compressedSize: number
  savings: number
  savingsPercent: string
}

async function compressImage(filePath: string): Promise<CompressionResult> {
  const ext = path.extname(filePath).toLowerCase()
  const originalStats = fs.statSync(filePath)
  const originalSize = originalStats.size

  const image = sharp(filePath)

  let outputBuffer: Buffer

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      outputBuffer = await image
        .jpeg({
          quality: 80,
          mozjpeg: true,
        })
        .toBuffer()
      break

    case '.png':
      outputBuffer = await image
        .png({
          compressionLevel: 9,
          palette: true,
          quality: 80,
          effort: 10,
        })
        .toBuffer()
      break

    case '.webp':
      outputBuffer = await image
        .webp({
          quality: 80,
          effort: 6,
        })
        .toBuffer()
      break

    default:
      throw new Error(`Unsupported format: ${ext}`)
  }

  // Only write if compressed version is smaller
  if (outputBuffer.length < originalSize) {
    fs.writeFileSync(filePath, outputBuffer)
  }

  const compressedSize = Math.min(outputBuffer.length, originalSize)
  const savings = originalSize - compressedSize

  return {
    file: path.basename(filePath),
    originalSize,
    compressedSize,
    savings,
    savingsPercent: ((savings / originalSize) * 100).toFixed(1),
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

async function main() {
  const folderPath = process.argv[2]

  if (!folderPath) {
    console.error('Usage: npx ts-node scripts/compress-images.ts <folder-path>')
    process.exit(1)
  }

  const absolutePath = path.isAbsolute(folderPath)
    ? folderPath
    : path.resolve(process.cwd(), folderPath)

  if (!fs.existsSync(absolutePath)) {
    console.error(`Folder not found: ${absolutePath}`)
    process.exit(1)
  }

  const files = fs.readdirSync(absolutePath)
  const imageFiles = files.filter((file) =>
    SUPPORTED_EXTENSIONS.includes(path.extname(file).toLowerCase()),
  )

  if (imageFiles.length === 0) {
    console.log('No supported images found in the folder.')
    process.exit(0)
  }

  console.log(`Found ${imageFiles.length} images to compress...\n`)

  const results: CompressionResult[] = []
  let totalOriginal = 0
  let totalCompressed = 0

  for (const file of imageFiles) {
    const filePath = path.join(absolutePath, file)
    try {
      const result = await compressImage(filePath)
      results.push(result)
      totalOriginal += result.originalSize
      totalCompressed += result.compressedSize
      console.log(
        `✓ ${result.file}: ${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (${result.savingsPercent}% saved)`,
      )
    } catch (error) {
      console.error(`✗ ${file}: ${(error as Error).message}`)
    }
  }

  const totalSavings = totalOriginal - totalCompressed
  const totalPercent = ((totalSavings / totalOriginal) * 100).toFixed(1)

  console.log('\n--- Summary ---')
  console.log(`Files processed: ${results.length}`)
  console.log(`Original total:  ${formatBytes(totalOriginal)}`)
  console.log(`Compressed total: ${formatBytes(totalCompressed)}`)
  console.log(
    `Total saved:     ${formatBytes(totalSavings)} (${totalPercent}%)`,
  )
}

main().catch(console.error)
