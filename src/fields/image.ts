import type { UploadField } from 'payload'

type ImageOptions = {
  name?: string
  label?: string
  required?: boolean
}

/**
 * Standard upload->media field. Alt text is enforced as required on the Media collection
 * itself (see WEB-394), so every image carries alt regardless of where it is referenced.
 */
export const imageField = ({ name = 'image', label = 'Image', required = false }: ImageOptions = {}): UploadField => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
  required,
})
