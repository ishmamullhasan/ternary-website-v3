import type { ArrayField, Field } from 'payload'

import { iconSelect } from './iconSelect'
import { imageField } from './image'
import { rowLabelAdmin } from './rowLabel'

/** Standard {title, excerpt, …} card list used by cardGrid / featureBento. */
export const cardsArray = ({
  name = 'cards',
  label = 'Cards',
  media = false,
  icons,
  link = false,
  span = false,
}: {
  name?: string
  label?: string
  media?: boolean
  icons?: string[]
  link?: boolean
  span?: boolean
} = {}): ArrayField => {
  const fields: Field[] = [
    { name: 'title', label: 'Title', type: 'text', required: true, localized: true, admin: { width: '50%' } },
    {
      name: 'excerpt',
      label: 'Excerpt',
      type: 'textarea',
      localized: true,
      admin: { description: 'Short supporting copy.' },
    },
  ]
  if (icons) fields.splice(1, 0, { ...iconSelect(icons), admin: { ...iconSelect(icons).admin, width: '50%' } })
  if (media) fields.push(imageField({ name: 'media', label: 'Image' }))
  if (link)
    fields.push({
      name: 'link',
      label: 'Link',
      type: 'text',
      admin: { description: 'Optional URL the card links to.' },
    })
  if (span)
    fields.push({
      name: 'span',
      label: 'Tile size',
      type: 'select',
      defaultValue: 'md',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
      admin: { width: '50%', description: 'Controls how wide this tile is in the bento grid.' },
    })
  return { name, label, type: 'array', admin: { ...rowLabelAdmin }, fields }
}

/** {value, label, detail?} metric list (laid out in rows). */
export const statsArray = ({ name = 'stats', label = 'Stats' } = {}): ArrayField => ({
  name,
  label,
  type: 'array',
  admin: { ...rowLabelAdmin, description: 'Headline metrics. Use real figures only.' },
  fields: [
    { name: 'value', label: 'Value', type: 'text', required: true, localized: true, admin: { width: '33%' } },
    { name: 'label', label: 'Label', type: 'text', required: true, localized: true, admin: { width: '33%' } },
    { name: 'detail', label: 'Detail', type: 'text', localized: true, admin: { width: '34%' } },
  ],
})

/** Numbered {title, description, active?} steps for the process block. */
export const stepsArray = ({ name = 'steps', label = 'Steps', active = false } = {}): ArrayField => {
  const fields: Field[] = [
    { name: 'title', label: 'Title', type: 'text', required: true, localized: true },
    { name: 'description', label: 'Description', type: 'richText', localized: true },
  ]
  if (active) fields.push({ name: 'active', label: 'Highlighted', type: 'checkbox', defaultValue: false })
  return { name, label, type: 'array', admin: { ...rowLabelAdmin }, fields }
}

/** Simple {name} tag list. */
export const tagsArray = ({ name = 'tags', label = 'Tags' } = {}): ArrayField => ({
  name,
  label,
  type: 'array',
  admin: { ...rowLabelAdmin },
  fields: [{ name: 'name', label: 'Tag', type: 'text', required: true, localized: true }],
})
