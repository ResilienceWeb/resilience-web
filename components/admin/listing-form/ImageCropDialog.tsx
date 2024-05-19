/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from 'react'
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
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  Text,
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

    setCroppedImage(croppedImage)
    setPreview(croppedImageDataUrl)
  }

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '3xl' }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Crop image</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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
          <Box
            width="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="2rem"
          >
            <Text>Zoom:</Text>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              colorScheme="rw"
              onChange={(value) => {
                onZoomChange(value)
              }}
              maxWidth="300px"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={5} bg="rw.700" />
            </Slider>
          </Box>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button
              onClick={onClose}
              bg="gray.500"
              colorScheme="gray.500"
              _hover={{ bg: 'gray.600' }}
            >
              Cancel
            </Button>
            <Button onClick={onCrop} variant="rw">
              Crop
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ImageCropDialog
