/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  chakra,
} from '@chakra-ui/react'

import { getCroppedImage, getCroppedImageDataUrl } from './cropImage'
import styles from './ImageCropDialog.module.scss'

const ImageCropDialog = ({
  imageUrl,
  isOpen,
  onClose,
  setCroppedImage,
  setPreview,
}) => {
  const [zoom, setZoom] = useState(1)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropChange = (crop) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom) => {
    setZoom(zoom)
  }

  const onCropComplete = (_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const onCrop = async () => {
    const croppedImage = await getCroppedImage(imageUrl, croppedAreaPixels)
    const croppedImageDataUrl = await getCroppedImageDataUrl(
      imageUrl,
      croppedAreaPixels,
    )
    console.log(crop, zoom, croppedImage)
    setCroppedImage(croppedImage)
    setPreview(croppedImageDataUrl)
  }

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'xl' }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Crop image</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div className="crop-container">
            <Cropper
              classes={{ containerClassName: styles.cropperContainer }}
              image={imageUrl}
              zoom={zoom}
              crop={crop}
              aspect={2 / 1}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="controls">
            <div className="controls-upper-area">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onInput={(e) => {
                  // @ts-ignore
                  onZoomChange(e.target.value)
                }}
                className="slider"
              ></input>
            </div>
            <div className="button-area">
              <button onClick={onClose}>Cancel</button>
              <button onClick={onCrop}>Crop</button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ImageCropDialog
