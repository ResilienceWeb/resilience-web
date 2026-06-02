import { toast } from 'sonner'

const createShareActions = () => {
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`Successfully copied ${text} to clipboard`)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error("Couldn't copy that to your clipboard", {
        description: 'Please try selecting and copying the link manually.',
      })
    }
  }

  const share = async (url: string, title: string, description: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        })
        console.log('Successfully shared')
      } catch (error) {
        copy(url)
      }
    } else {
      console.error('Web Share API not supported')
      copy(url)
    }
  }

  return { copy, share }
}

export default createShareActions
